const EventEmitter = require('events');
const config       = require('../config/');
const slackRequest = require('./slackRequest');
const SlackRTM     = require('./SlackRTM');

function SlackObject(name, id){
    this.name = name;
    this.id = id;
}

class SlackAPI extends EventEmitter{
    constructor(token, prefix){
        super();
        this.token   = token;
        this.prefix  = prefix;

        this.cache   = {};

        const doesStorageExist = (name)=>{
            return this.cache.hasOwnProperty(name);
        }

        const createStorageIfNotExists = (name)=>{
            if(!doesStorageExist(name)){
                this.cache[name] = {};
            }
        }

        const getIdBasedObjectStorage = (storageName)=>{
            let storagePlural = `${storageName}s`;

            return {
                create: () => {
                    createStorageIfNotExists(storagePlural);
                },
                get: (id, cb) => {
                    this.storage[storagePlural].create();

                    if (this.cache[storagePlural].hasOwnProperty(id)) return cb(null, this.cache[storagePlural][id]);

                    let reqOptions = { [storageName]: id };

                    this.methods[storagePlural].info(reqOptions, (err, res) => {
                        if (err) return cb(err);

                        this.storage[storagePlural].save(res[storageName]);

                        cb(this.cache[storagePlural][res[storageName].id]);
                    });
                },
                findInCache: (predicate)=>{
                    this.storage[storagePlural].create();

                    if(!doesStorageExist(storagePlural)){
                        return null;
                    }

                    for(let obj of this.cache[storagePlural]){
                        if(predicate(obj)){
                            return obj;
                        }
                    }

                    return null;
                },
                save: (idObj) => {
                    this.storage[storagePlural].create();

                    this.cache[storagePlural][idObj.id] = idObj;
                },
                all: (cb) => {
                    this.storage[storagePlural].create();

                    if (this.cache.hasOwnProperty(plural)) cb(null, this.cache[storagePlural]);

                    this.methods[storagePlural].list((err, res) => {
                        if (err) return cb(err);

                        for (let idObj of res) {
                            this.storage[storagePlural].save(idObj);
                        }

                        cb(null, this.cache[storagePlural]);
                    });
                }
            }
        };

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

        this.rtm     = new SlackRTM(token, this.prefix);
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
                this.storage.groups.save(group);
            }

            this.emit('orgData', data);
        });

        this.on('team_join', (data)=>{
            this.storage.users.save(data.user);
        });
        this.on('channel_created', (data)=>{
            this.storage.channels.save(data.channel);
        });
        this.on('group_joined', (data)=>{
            this.storage.groups.save(data.channel);
        });

        // TODO: Implement 'goodbye' handling

        this.rtm.on('requestFail', (err)=> this.emit('rtmFail', err));

        this.rtm.socket.on('close', (code, desc)=> this.emit('rtmClose', code, desc));
        this.rtm.socket.on('connectFailed', ()=> this.emit('rtmConnectFailed'));
        this.rtm.socket.on('error', (error)=> this.emit('rtmError', error));

        for(let methodName of config.methods){
            let method = methodName.split('.');
            let apiObj = this.methods;

            for(let i = 0; i < method.length; i++){
                if(!apiObj[method[i]]) apiObj[method[i]] = {};

                if(i === method.length-1){
                    apiObj[method[i]] = (args = {}, cb = ()=>{})=>{
                        if(typeof args === 'function') {
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
            if(typeof args === 'function') {
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
            if(typeof args === 'function') {
                //noinspection JSValidateTypes
                cb   = args;
                args = {};
            }

            if(!args.text) throw new Error("Text is required in chat.postMessage");

            args.token = this.token;

            if(args.text.length > 2999){
                let queue = [];
                let msg   = args.text;

                while(msg.length > 2999){
                    queue.push(msg.substr(0, 3000));
                    msg = msg.substr(3000);
                }

                function next() {
                    args.text = queue.shift();
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