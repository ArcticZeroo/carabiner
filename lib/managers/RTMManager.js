const EventEmitter = require('events');
const WebSocket    = require('frozor-websocket');
const slackRequest = require('../slackRequest');

class RTMManager extends EventEmitter{
    constructor(token){
        super();
        this.token  = token;
        this.socket = new WebSocket({
            prefix: 'RTM',
            name  : 'RTM',
            json  : true
        });
    }

    start(){
        slackRequest.makeRequest('rtm.start', {token: this.token}, (success, result)=>{
            if(!success) return this.emit('requestFail', result);

            //Emit that the request is a success
            this.emit('requestSuccess');

            //Emit the data we got for anyone who wants listen
            this.emit('orgData', {
                self     : result.self,
                team     : result.team,
                users    : result.users,
                channels : result.channels,
                groups   : result.groups,
                mpims    : result.mpims,
                ims      : result.ims,
                bots     : result.bots
            });

            //Connect to the socket
            this.socket.connect(result.url);

            //Tell people when there's a new event, obviously...
            this.socket.on('message', (event)=>{
                if(event.type == 'reconnect_url') this.socket.options.reconnect_url = event.url;
                this.emit('event', event.type, event);
            });
         });
    }
}

module.exports = RTMManager;