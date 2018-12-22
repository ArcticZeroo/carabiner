import { EventEmitter } from 'events';
import Client from '../client/Client';
import StringUtil from '../util/StringUtil';

interface IEventHandlerOptions {
    listenByDefault?: boolean;
    name?: string;
}

export default abstract class EventHandler {
    protected readonly client: Client;
    private readonly name: string;

    /**
     * Create an event handler with this
     * client that will be used to listen.
     * @param {Client} client - The client to listen with.
     * @param {object} [options={}] - Additional option parameters
     * @param {boolean} [options.listenByDefault=true] - Whether this handler should call listen() by default.
     * @param {string} [options.name] - A name for this handler, if you want to make emitting easier
     */
    constructor(client: Client, options: IEventHandlerOptions = {}) {
        const { listenByDefault = true, name } = options;

        /**
         * The client used for listening.
         * @type {Client}
         */
        this.client = client;

        if (listenByDefault) {
            this.listen();
        }

        this.name = name;
    }

    /**
     * Emit a given event with the given event
     * parameters. This prepends the name set
     * in the constructor if available
     * @param eventName
     * @param data
     */
    emit(eventName: string, ...data: any[]): void {
        const event = (this.name) ? this.name + StringUtil.capitalize(eventName) : eventName;

        this.client.emit(event, ...data);
    }

    /**
     * Get this client's emitter.
     * @return {EventEmitter}
     */
    get emitter(): EventEmitter {
        return this.client.api.rtm.events;
    }

    /**
     * Register all events associated
     * with this event handler.
     */
    abstract listen(): void;

    /**
     * Set listeners for an arbitrary amount of events,
     * to a class method for this event handler.
     * @param {function} handler - A class method to bind to this and use as an event handler
     * @param {...string} events - An arbitrary set of events to listen for with the given handler
     */
    setListeners(handler: (...args: any[]) => void, ...events: string[]): void {
        handler = handler.bind(this);

        for (const event of events) {
            this.emitter.on(event, handler);
        }
    }
}

module.exports = EventHandler;