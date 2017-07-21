const EventEmitter = require('events');
const WebSocket    = require('frozor-websocket');
const slackRequest = require('./slackRequest');

class RTMManager extends EventEmitter{
    constructor(token, prefix){
        super();
        this.token  = token;

        let socketPrefix = `${(prefix)?`${prefix}|`:''}RTM`;

        this.socket = new WebSocket({
            prefix: socketPrefix,
            name  : 'RTM'||prefix,
            json  : true
        });
    }

    start(){
        return slackRequest.makeRequest('rtm.start', {token: this.token})
            .then((result)=>{
                //Emit that the request is a success
                this.emit('requestSuccess');

                //Emit the data we got for anyone who wants listen
                this.emit('orgData', result);

                //Connect to the socket
                this.socket.connect(result.url);

                //Tell people when there's a new event, obviously...
                this.socket.on('message', (event)=>{
                    if(event.type === 'reconnect_url') {
                        this.socket.options.reconnect_url = event.url;
                    }

                    this.emit('event', event.type, event);
                });

                return result;
            }).catch((e)=>{
                this.emit('requestFail', e);

                return e;
            })
    }
}

module.exports = RTMManager;