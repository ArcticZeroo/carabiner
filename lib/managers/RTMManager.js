let EventEmitter = require('events');
let Websocket    = require('frozor-websocket');
let slackRequest = require('../slackRequest');
class RTMManager extends EventEmitter{
    constructor(token){
        super();
        this.token  = token;
        this.socket = new WebSocket({
            prefix: 'RTM Socket',
            name  : 'RTM Socket'
        });
    }

    start(){
        slackRequest('rtm.start', {token: this.token}, (success, result)=>{
            if(!success) return this.emit('requestFail', result);

            //Emit that the request is a success
            this.emit('requestSuccess');

            //Emit the data we got for anyone who wants listen
            this.emit('selfData'    , result.self);
            this.emit('teamData'    , result.team);
            this.emit('usersData'   , result.users);
            this.emit('channelsData', result.channels);
            this.emit('groupsData'  , result.groups);
            this.emit('mpimsData'   , result.mpims);
            this.emit('imsData'     , result.ims);
            this.emit('botsData'    , result.bots);

            //Connect to the socket
            this.socket.connect(result.url);

            this.socket.on('message', (event)=>{
                this.emit('event', event.type, event);
            });
         });
    }
}