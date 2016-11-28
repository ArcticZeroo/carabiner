let EventEmitter = require('events');
let config       = require('../config/');
let slackRequest = require('./slackRequest');
let RTMManager   = require('./managers/RTMManager');

class SlackAPI extends EventEmitter{
    constructor(token){
        super();
        this.token = token;
        this.user  = null;
        this.team  = null;
        this.rtm   = new RTMManager(token);

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
    }
}

module.exports = SlackAPI;