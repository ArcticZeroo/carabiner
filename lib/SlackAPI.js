const EventEmitter = require('events');
const config       = require('../config/');
const slackRequest = require('./slackRequest');
const RTMManager   = require('./managers/RTMManager');

class SlackAPI extends EventEmitter{
    constructor(token){
        super();
        this.token   = token;
        this.user    = null;
        this.team    = null;
        this.rtm     = new RTMManager(token);
        this.methods = {};

        this.rtm.on('event', (type, data)=>{
            this.emit(type, data);
        });

        this.rtm.on('orgData', (data)=>{
            if(!this.user) this.user = {
                id  : data.self.id,
                name: data.self.name,
            };

            if(!this.team) this.team = {
                id  : data.team.id,
                name: data.team.name
            };

            this.emit('orgData', data);
        });

        this.rtm.socket.on('close', (code, desc)=> this.emit('rtmClose', code, desc));
        this.rtm.socket.on('connectFailed', ()=> this.emit('rtmConnectFailed'));
        this.rtm.socket.on('error', (error)=> this.emit('rtmError', error));

        for(let methodName of config.methods){
            let method = methodName.split('.');
            let apiObj = this.methods;

            for(let i = 0; i < method.length; i++){
                if(!apiObj[method[i]]) apiObj[method[i]] = {};

                if(i == method.length-1){
                    apiObj[method[i]] = (args = {}, cb = ()=>{})=>{
                        if(typeof args == 'function') {
                            //noinspection JSValidateTypes
                            cb   = args;
                            args = {};
                        }

                        args.token = this.token;

                        slackRequest.makeRequest(methodName, args, cb);
                    };
                    break;
                }else apiObj = apiObj[method[i]];
            }
        }

        this.methods.chat.postMessage = (args = {}, cb = ()=>{})=>{
            if(typeof args == 'function') {
                //noinspection JSValidateTypes
                cb   = args;
                args = {};
            }

            if(!args.text) throw "Text is required in chat.postMessage";

            args.token = this.token;

            if(args.text.length > 2999){
                let queue = [];
                let msg   = args.text;

                while(msg.length > 2999){
                    queue.push(msg.substr(0, 3000));
                    msg = msg.substr(3000);
                }

                function next() {
                    args.text = queue.splice(0,1)[0];
                    slackRequest.makeRequest('chat.postMessage', args, (err, res)=>{
                        if(err) return cb(err, res);

                        if(queue.length > 0) next();
                        else cb(null, res);
                    });
                }

                next();
            }else slackRequest.makeRequest('chat.postMessage', args, cb);
        }
    }
}

module.exports = SlackAPI;