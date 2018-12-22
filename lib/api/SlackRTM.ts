import SlackAPI from './SlackAPI';
import WebSocket from 'ws';
import ReadyState from '../enum/WebSocketReadyState';
import EventEmitter from 'events';
import SlackError from '../enum/SlackError';
import PromiseUtil from '../util/PromiseUtil';
import apiConfig from '../../config/api';

interface ISlackRtmParams {
    api: SlackAPI;
    retryIfMigrating?: boolean;
    migrationRetryAttempts?: number;
}

export default class SlackRTM extends EventEmitter {
    public socket: WebSocket;
    public readonly events: EventEmitter;
    private readonly api: SlackAPI;
    private readonly retryIfMigrating: boolean;
    private readonly migrationRetryAttempts: number;

    /**
     * Create an instance of Slack RTM, which does not actually connect to anything until {@link SlackRTM#connect} is called.
     * @param {object} [options]
     * @param {SlackAPI} options.api - The API to use for requesting an RTM connection.
     * @param {boolean} [options.retryIfMigrating=true] - Whether to retry connecting to this RTM instance if it was migrating when it called the method
     * @param {number} [options.migrationRetryAttempts=Infinity] - How many times to retry connecting if it was indeed migrating when we try to connect
     */
    constructor({ api, retryIfMigrating = true, migrationRetryAttempts = Number.POSITIVE_INFINITY } : ISlackRtmParams) {
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

        /**
         * Whether to retry connecting to this RTM instance if it was migrating when it called the method
         * @type {boolean}
         */
        this.retryIfMigrating = retryIfMigrating;

        /**
         * How many times to retry connecting if it was indeed migrating when we try to connect
         * @type {number}
         */
        this.migrationRetryAttempts = migrationRetryAttempts;

        /**
         * An event emitter for RTM events.
         * This directly emits event types,
         * meaning you don't have to worry
         * about clashing with existing events
         * in rtm...
         * @type {EventEmitter}
         */
        this.events = new EventEmitter();
    }

    /**
     * Creates an RTM connection from a given URL.
     * If a connection already exists it will be terminated.
     * @param url {string} - The URL to the RTM websocket.
     * @private
     */
    _createRtmConnection(url: string): void {
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
        const forward = (event: any) => {
            this.socket.on(event, (...data: any[]) => {
                this.events.emit(event, ...data);
                this.emit(event, ...data);
            });
        };

        forward('close');
        forward('open');
        forward('error');


        this.socket.on('message', (event: { type: string }) => {
            // Not entirely sure if ws parses messages by default.
            // noinspection SuspiciousTypeOfGuard
            if (typeof event === 'string') {
                try {
                    event = JSON.parse(event);
                } catch (e) {
                    this.emit('error', `Unable to JSON.parse a RTM message: ${event}`);
                    return;
                }
            }

            this.events.emit(event.type, event);
            this.emit('event', event.type, event);
        });
    }

    /**
     * Connect to RTM!
     * This can be called if RTM is already active.
     * @param {string} [url] - The URL to connect to. If this is not supplied rtm.connect will be called.
     * @param {number} [retryCount=0] - How many tries this rtm.connect call has made. Don't set this yourself.
     * @return {Promise.<void>}
     */
    async connect(url: string, retryCount = 0): Promise<any> {
        if (url) {
            this._createRtmConnection(url);
            return;
        }

        let res;
        try {
            res = await this.api.methods.rtm.connect();
        } catch (e) {
            if (e === SlackError.MIGRATION_IN_PROGRESS) {
                this.emit('migrating');

                if (this.retryIfMigrating && (this.migrationRetryAttempts > retryCount)) {
                    await PromiseUtil.pause(apiConfig.rtm.migrationRetryBase + (apiConfig.rtm.migrationRetryIncrement * retryCount));

                    // Do not use a URL this time because the old
                    // URL is invalid as migration was in progress...
                    return this.connect(null, retryCount + 1);
                }
            }

            this.emit('requestFail', e);
            throw e;
        }

        if (!res.url) {
            const error = new Error('WebSocket URL was not provided in slack\'s response.');

            this.emit('error', error);
            throw error;
        }

        this.emit('requestSuccess');

        this._createRtmConnection(res.url);
    }

    /**
     * Send JSON to the current RTM socket, if any.
     * If RTM is not currently running this will throw
     * an error.
     * @param {object} obj - The JSON object to send. This will be directly JSON stringified, so no circular refs!
     * @return {Promise<void>}
     */
    async sendJson(obj: {}): Promise<any> {
        if (!this.socket) {
            throw new Error('RTM is inactive');
        }

        return new Promise((resolve, reject) => {
            this.socket.send(JSON.stringify(obj), function (err) {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    /**
     * Terminate this websocket if
     * it has been started.
     */
    destroy(): void {
        if (!this.socket) {
            return;
        }

        this.socket.terminate();
    }
}