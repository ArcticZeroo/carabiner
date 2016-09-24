var r = require('request');
var WebSocketClient = require('websocket').client;
var EventEmitter = require('events');
var log = require('frozor-logger');

var base_url = "https://slack.com/api/";

class Info{
    setUserID(id){
        this.userID = id;
    }
    getUserID(){
        return this.userID;
    }

    getUserMention(){
        return `<@${this.getUserID()}>`;
    }

    setUserName(name){
        this.userName = name;
    }
    getUserName(){
        return this.userName;
    }
    setTeamID(id){
        this.teamID = id;
    }
    getTeamID(){
        return this.teamID;
    }

    setTeamName(name){
        this.teamName = name;
    }
    getTeamName(){
        return this.teamName;
    }
}

class Utils{
    constructor(token){
        this.token = token;
        this.rtm   = null;
    }

    getToken(){
        //console.log(`Token has been requested, returning ${this.token}`);
        return this.token;
    }

    stringifyIfNecessary(object){
        if(typeof object != "string") return JSON.stringify(object);
        return object;
    }

    encodeAndStringify(object){
        return encodeURIComponent(this.stringifyIfNecessary(object));
    }

    createSlackRequestURL(method, args){
        var request_url = `${base_url}${method}`;
        if(!args) return request_url;

        var request_args = [];

        if(args.token == true) request_args.push(`token=${this.getToken()}`);
        if(args.token != undefined) delete args.token;

        for(var arg in args) if(args[arg]) request_args.push(`${arg}=${this.encodeAndStringify(args[arg])}`);

        if(request_args.length > 0) request_url = `${base_url}${method}?${request_args.join("&")}`;

        return request_url;
    }

    get(url, callback){
        r(url, (error, response, body) =>{
            if(!error && body != ''){
                try{var bodyParse = JSON.parse(body);}catch(e){return log.error(`Unable to parse request body for URL ${url}: ${e}`);}
                if(bodyParse.ok == false || bodyParse.error) log.error(`An error was returned by the recipient: ${bodyParse.error}`);
                callback(bodyParse);
            }else if(error){
                if (callback) callback({
                    ok: false,
                    error: error
                });
                log.error(`Request returned an error: ${error}`, "slack/Utils.get()");
            }else{
                if (callback) callback({
                    ok: false,
                    error: "An unexpected error occurred. Please try again later."
                });
            }
        });
    }

    makeRequest(method, args, callback){
        var request_url = this.createSlackRequestURL(method, args);
        this.get(request_url, (body)=>{
            if(!callback) return;
            callback(body);
        });
    }

}

class Events extends EventEmitter{
    constructor(api_emitter){
        super();
        this.emitter = api_emitter;
    }

    emitEvent(event){
        event = JSON.parse(event);

        this.emit(event.type, event);
        this.emit('all', event);

        this.emitter.emit(event.type, event);
        this.emitter.emit('all', event);
    }
}

class RTM extends EventEmitter {
    constructor(token, events, info, utils){
        super();
        this.token  = token;
        this.events = events;
        this.info   = info;
        this.utils  = utils;
    }

    start(args){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("rtm.start", args, (response)=>(this.init(response)));
    }

    init(response){
        if(response.url){
            this.info.setUserID(response.self.id);
            this.info.setUserName(response.self.name);
            this.info.setTeamID(response.team.id);
            this.info.setTeamName(response.team.name);
            this.connect(response.url);
        }
    }

    connect(url){
        log.info("Connecting to RTM server...", "slack/RTM::connect()");
        var socket = new WebSocketClient();
        socket.connect(url);
        socket.on('connect', (connection)=>{
            log.info('Connected to RTM socket!', "slack/RTM::connect()");
            connection.on('message', (message)=>{
                if(message.type == 'utf8') this.events.emitEvent(message.utf8Data);
            });
            connection.on('error', (error)=>{
                log.error("Error in connection to RTM server: " + error + ", restarting RTM", "slack/RTM.connect()");
                this.connect(url);
            });
            connection.on('close', ()=>{
                log.info("Rtm connection closed. Restarting RTM", "slack/RTM.connect()");
                this.connect(url);
            });
            connection.on('connectFailed', ()=>{
                log.info("Unable to connect to RTM. Retrying in 10 seconds...", "slack/RTM.connect()");
                setTimeout(()=>{this.connect(url)}, 10000);
            });
            setTimeout(()=>{
                if(!connection.connected){
                    log.error("Restarting _bot after waiting 10 seconds with no response from server...", "slack/RTM::connect()");
                    process.exit();
                }
            }, 10*1000);
        });
    }
}

class SlackAPI extends EventEmitter{
    constructor(token){
        super();

        this._token = token;

        this.info = new Info();

        this.events = new Events(this);

        this.utils = new Utils(token);

        this.rtm = new RTM(this.utils, this.events, this.info, this.utils);

        this.template_methods = {
            api:{
                test: true},
            auth:{
                revoke: true, test: true},
            bots:{
                info: true},
            channels:{
                archive: true, create: true, history: true, info: true, invite: true, join: true, kick: true, leave: true, list: true, mark: true, rename: true, setPurpose: true, setTopic: true, unarchive: true},
            chat:{
            delete: true, meMessage: true, postMessage: (args, callback)=>{
                    args = args || {};
                    args.token = true;
                    if(!args.text){
                        if(callback) callback({
                            ok: false,
                            error: "api_no_text"
                        });
                        return;
                    }

                    if(args.text.length > 2999){
                        var queue = [];

                        var message = args.text;

                        while(message.length > 2999){
                            var temp_args   = JSON.parse(JSON.stringify(args));
                            var textSub     = message.substring(0, 3000);
                            temp_args.text  = textSub;
                            queue.push(temp_args);
                            message         = message.substring(3000);
                        }
                        if(message.length > 0){
                            var temp_args   = args;
                            temp_args.text  = message;
                            queue.push(temp_args);
                        }

                        function sendNext(utils){
                            var toSend = queue.splice(0,1)[0];
                            toSend.token = true;
                            utils.makeRequest("chat.postMessage", toSend, ()=>{if(queue.length > 0){sendNext(utils)}});
                        }

                        sendNext(this.utils);
                    }else this.utils.makeRequest("chat.postMessage", args, callback);
                }, update: true},
            dnd:{
                endDnd: true, endSnooze: true, info: true, setSnooze: true, teamInfo: true},
            emoji:{
                list: true},
            files:{
                comments:{add: true, delete: true, edit: true}, delete: true, info: true, list: true, revokePublicURL: true, sharedPublicURL: true, upload: true},
            groups:{
                archive: true, close: true, create: true, createChild: true, history: true, info: true, invite: true, kick: true, leave: true, list: true, mark: true, open: true, rename: true, setPurpose: true, setTopic: true, unarchive: true},
            im:{
            close: true, history: true, list: true, mark: true, open: true},
            mpim:{
            close: true, history: true, list: true, mark: true, open: true},
            oauth:{
            access: false},
            pins:{
                add: true, list: true, remove: true
            },
            reactions:{
                add: true, get: true, list: true, remove: true
            },
            reminders:{
                add: true, complete: true, delete: true, info: true, list: true
            },
            search:{
              all: true, files: true, messages: true
            },
            stars:{
                add: true, list: true, remove: true
            },
            team:{
                accessLogs: true, billableInfo: true, info: true, integrationLogs: true, profile:{get: true}
            },
            usergroups:{
                create: true, disable: true, enable: true, list: true, update: true, users:{list: true, update: true}
            },
            users:{
                deletePhoto: true, getPresence: true, identity: true, info: true, list: true, setActive: true, setPhoto: true, setPresence: true, admin:{invite: true}, profile:{get: true, set: true}}
        }

        this.generateMethods();
    }

    generateMethods(){
        for(var category in this.template_methods){
            this[category] = {};

            for(var method in this.template_methods[category]){
                this[category][method] = {};

                var methodData = this.template_methods[category][method];

                if(typeof methodData == "function"){
                    this[category][method] = methodData;
                    continue;
                }

                if(typeof methodData == "object"){
                    for(var subMethod in methodData){
                        if(typeof methodData[subMethod] == "function"){
                            this[category][method][subMethod] = methodData[subMethod];
                            continue;
                        }

                        this[category][method][subMethod] = new Function(['args', 'callback'], `
                        if(typeof args == "function"){
                            callback = args;
                            args     = {};
                        }
                        args = args || {};
                        args.token = ${methodData[subMethod]}; 
                        
                        var utils = new SlackAPIUtils('${this._token}');
                        return utils.makeRequest('${category}.${method}.${subMethod}', args, callback);`);
                    }
                    continue;
                }

                this[category][method] = new Function(['args', 'callback'], `
                    if(typeof args == "function"){
                        callback = args;
                        args     = {};
                    }
                    args = args || {};
                    args.token = ${methodData}; 
                    
                    var utils = new SlackAPIUtils('${this._token}');
                    return utils.makeRequest('${category}.${method}', args, callback);`);
            }
        }
    }

}

global.SlackAPIUtils = Utils;

module.exports = {
    createBot: function(token){return new SlackAPI(token)},
    utils: require('./utils')
}