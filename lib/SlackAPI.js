let EventEmitter = require('events');
let config       = require('../config/');
let slackRequest = require('./slackRequest');
let RTMManager   = require('./managers/RTMManager');

class SlackAPI extends EventEmitter{
    constructor(token){
        super();
        this.token = token;
        this.user  = null;
        this.rtm   = new RTMManager(token);

        this.rtm.on('event', (type, data)=>{
            this.emit(type, data);
        });
    }
}

module.exports = SlackAPI;