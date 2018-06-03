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
        // noinspection EqualityComparisonWithCoercionJS
        if (this.socket != null) {
            // Prevent memory leaks
            this.socket.removeAllListeners();

            // If it's below ReadyState.CLOSING it's either not yet open, opening, or open.
            // We don't have time to gracefully close, so just terminate the connection.
            if (this.socket.readyState < ReadyState.CLOSING) {
                this.socket.terminate();
            }

            // Reset the socket to null just so it's immediately de-referenced and added to garbage heap.
            this.socket = null;
        }

        this.emit('starting');

        // Socket should automatically connect...
        this.socket = new WebSocket(url);

        // Arrow functions to bind to this
        const forward = (event) => {
            this.socket.on(event, (...data) => {
                this.emit(event, ...data);
            });
        };

        forward('close');
        forward('open');
        forward('error');


        this.socket.on('message', (event) => {
            // Not entirely sure if ws parses messages by default.
            if (typeof event === 'string') {
                try {
                    event = JSON.parse(event);
                } catch (e) {
                    this.emit('error', `Unable to JSON.parse a RTM message: ${  event}`);
                    return;
                }
            }

            this.emit('event', event.type, event);
        });
    }

    /**
     * Connect to RTM!
     * This can be called if RTM is already active.
     * @param {string} [url] - The url to connect to, if applicable
     * @return {Promise.<void>}
     */
    async connect(url) {
        if (url) {
            this._createRtmConnection(url);
            return;
        }

        let res;

        try {
            res = await this.api.methods.rtm.connect();
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

    /**
     * Terminate this websocket if
     * it has been started.
     */
    destroy() {
        if (!this.socket) {
            return;
        }

        this.socket.terminate();
    }
}

module.exports = SlackRTM;