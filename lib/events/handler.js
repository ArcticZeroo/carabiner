/* eslint-disable no-empty-function */
class EventHandler {
    /**
     * Create an event handler with this
     * client that will be used to listen.
     * @param {Client} client - The client to listen with.
     * @param {boolean} [listenByDefault=true] - Whether this handler should call listen() by default.
     */
    constructor(client, listenByDefault = true) {
        /**
         * The client used for listening.
         * @type {Client}
         */
        this.client = client;

        if (listenByDefault) {
            this.listen();
        }
    }

    /**
     * Get this client's emitter.
     * @return {SlackRTM}
     */
    get emitter() {
        return this.client.rtm;
    }

    /**
     * Register all events associated
     * with this event handler.
     */
    listen() {}

    /**
     * Set listeners for an arbitrary amount of events,
     * to a class method for this event handler.
     * @param {function} handler - A class method to bind to this and use as an event handler
     * @param {...string} events - An arbitrary set of events to listen for with the given handler
     */
    setListeners(handler, ...events) {
        handler = handler.bind(this);

        for (const event of events) {
            this.emitter.on(event, handler);
        }
    }
}

module.exports = EventHandler;