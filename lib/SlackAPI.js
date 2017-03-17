const EventEmitter = require('events');
const config       = require('../config/');
const slackRequest = require('./slackRequest');
const RTMManager   = require('./managers/RTMManager');

function SlackObject(name, id){
    this.name = name;
    this.id = id;
}

class SlackAPI extends EventEmitter{
    constructor(token){
        super();
        this.token   = token;

        this.cache   = {

        };
        
        let self = this;
        
        function getIdBasedObjectStorage(name) {
            let plural = `${name}s`;
            
            return {
                create: () => {
                    if (!self.cache.hasOwnProperty(plural)) self.cache[plural] = {}
                },
                get: (id, cb) => {
                    self.storage[plural].create();

                    if (self.cache[plural].hasOwnProperty(id)) return cb(null, self.cache[plural][id]);

                    let reqOptions = {};
                    reqOptions[name] = id;

                    self.methods[plural].info(reqOptions, (err, res) => {
                        if (err) return cb(err);

                        self.cache[plural][res[name].id] = res[name];

                        cb(self.cache[plural][res[name].id]);
                    });
                },
                save: (idObj) => {
                    self.storage[plural].create();
                    self.cache[plural][idObj.id] = idObj;
                },
                all: (cb) => {
                    self.storage[plural].create();

                    if (self.cache.hasOwnProperty('plural')) cb(null, self.cache[plural]);

                    self.methods[plural].list((err, res) => {
                        if (err) return cb(err);

                        for (let idObj of res) {
                            self.storage[plural].save(idObj);
                        }

                        cb(null, self.cache[plural]);
                    });
                }
            }
        }

        this.storage = {
            self: {
                get:(cb)=>{
                    if(this.cache.hasOwnProperty('self')) return cb(null, this.cache.self);

                    this.methods.auth.test((err)=>{
                        if(err) return cb(err);

                        cb(null, this.cache.self);
                    });
                },
                save: (user)=>{
                    this.cache.self = user;
                }
            },
            team: {
                get:(cb)=>{
                    if(this.cache.hasOwnProperty('team')) return cb(null, this.cache.team);

                    this.methods.auth.test((err)=>{
                        if(err) return cb(err);

                        cb(null, this.cache.team);
                    });
                },
                save: (team)=>{
                    this.cache.team = team;
                }
            },
            users    : getIdBasedObjectStorage('user'),
            channels : getIdBasedObjectStorage('channel'),
            groups   : getIdBasedObjectStorage('group')
        };

        this.rtm     = new RTMManager(token);
        this.methods = {};

        this.rtm.on('event', (type, data)=>{
            this.emit(type, data);
            this.emit('event', type, data);
        });

        this.rtm.on('orgData', (data)=>{
            this.storage.self.save(data.self);
            this.storage.team.save(data.team);

            for(let user of data.users){
                this.storage.users.save(user);
            }

            for(let channel of data.channels){
                this.storage.channels.save(channel);
            }

            for(let group of data.groups){
                this.storage.channels.save(group);
            }

            this.emit('orgData', data);
        });

        this.on('team_join', (data)=>{
            this.storage.users.save(data.user);
        });

        this.rtm.on('requestFail', ()=> this.emit('rtmFail'));

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

        this.methods.auth.test = (args = {}, cb = ()=>{})=>{
            if(typeof args == 'function') {
                //noinspection JSValidateTypes
                cb   = args;
                args = {};
            }

            args.token = this.token;

            slackRequest.makeRequest('auth.test', args, (err, res)=>{
                if(err) return cb(err);

                if(!this.cache.hasOwnProperty('self')) this.storage.self.save(new SlackObject(res.user, res.user_id));
                if(!this.cache.hasOwnProperty('team')) this.storage.team.save(new SlackObject(res.team, res.team_id));

                cb(null, res);
            });
        };

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