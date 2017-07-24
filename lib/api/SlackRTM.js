const WebSocket = require('ws');
const ReadyState = require('../enum/WebSocketReadyState');
const EventEmitter = require('events');

class SlackRTM extends EventEmitter{
    /**
     * Create an instance of Slack RTM, which does not actually connect to anything until {@link SlackRTM#connect} is called.
     * @param api {SlackAPI} - The API to use for requesting an RTM connection.
     */
    constructor(api) {
        super();

        /**
         * The API to use for requesting an RTM connection.
         * @type {SlackAPI}
         */
        this.api = api;

        /**
         * The websocket this RTM connection is using. May be null if {@link SlackRTM#connect} has not been called.
         * @type {WebSocket}
         */
        this.socket = null;
    }

    /**
     * Creates an RTM connection from a given URL.
     * If a connection already exists it will be terminated.
     * @param url {string} - The URL to the RTM websocket.
     * @private
     */
    _createRtmConnection(url) {
        if (this.socket != null) {
            this.socket.removeAllListeners();

            if (this.socket.readyState < ReadyState.CLOSING) {
                this.socket.terminate();
            }

            this.socket = null;
        }

        this.emit('starting');
        this.socket = new WebSocket(url);

        const forward = (event)=>{
            this.socket.on(event, (...data)=>{
                this.emit(event, ...data);
            });
        };

        forward('close');
        forward('open');
        forward('error');

        this.socket.on('message', (event)=>{
            if (typeof event === 'string') {
                try {
                    event = JSON.parse(event);
                } catch (e) {
                    this.emit('error', 'Unable to JSON.parse a RTM message: ' + event);
                    return;
                }
            }

            this.emit('event', event.type, event);
        });
    }

    /**
     * Connect to RTM!
     * This can be called
     * @return {Promise.<void>}
     */
    async connect() {
        let res;

        try {
            res = await this.api.methods.rtm.connect()
        } catch (e) {
            this.emit('requestFail', e);
            throw e;
        }

        if (!res.url) {
            this.emit('error', 'WebSocket URL was not provided in slack\'s response.');
            return;
        }

        this.emit('requestSuccess');

        this._createRtmConnection(res.url);
    }
}

module.exports = SlackRTM;