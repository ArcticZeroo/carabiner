import Client from '../client/Client';
import EventHandler from './handler';
import Message from '../structures/message/Message';
import IReactionEvent from "../models/event/messages/IReactionEvent";

export default class MessageEventHandler extends EventHandler {
    constructor(client: Client, options = {}) {
        super(client, { ...options, name: 'message' });
    }

    listen() {
        this._listenMain();
        this._listenRelated();
    }

    _listenMain() {
        /**
         * Emitted when a message is sent in a slack channel.
         * These are NOT necessarily chat messages! Listen to
         * message.chat event instead for those.
         * If you just want to listen to a single subtype,
         * you can listen to message.subtype.<TArgs>.
         * Or if you only want messages from a certain
         * channel type, you can listen to message.type.<TArgs>
         * @event Client#message
         * @param {Message} message - The message that was sent.
         */
        this.setListeners(data => {
            const message = new Message(this.client, data);

            this.client.emit('message', message);

            if (message.conversation) {
                this.client.emit(`message.type.${message.conversation.type}`, message);
            }

            if (message.subtype) {
                this.client.emit(`message.subtype.${message.subtype}`, message);

                //TODO: switch on subtype for special handling
            } else {
                if (message.conversation) {
                    message.conversation.cacheMessage(message);
                }

                /**
                 * Emitted when a user sends a chat message.
                 * These are messages without subtypes.
                 * @event Client#message.chat
                 * @param {Message} message - The message they sent
                 */
                this.client.emit('message.chat', message);
            }
        }, 'message');
    }

    _listenRelated() {
        /**
         * Emitted when a user adds a reaction to a message
         * @event Client#reactionAdded
         * @param {object} data - Event data
         * @param {User} data.reactingUser - The user reacting
         * @param {User} data.itemUser - The user they are reacting to
         * @param {string} data.reaction - The emoji they reacted with
         */
        this.setListeners(({ user: reactingUser, item_user: itemUser, reaction, item: reactingItem }) => {
            reactingUser = this.client.users.get(reactingUser);
            itemUser = this.client.users.get(itemUser);

            // only support message reactions for now
            if (reactingItem.type !== 'message') {
                return;
            }

            const item = new Message(this.client, reactingItem);

            const reactionData: IReactionEvent = { reactingUser, itemUser, reaction, item };

            this.client.emit('reactionAdded', reactionData);
        }, 'reaction_added');

        /**
         * Emitted when a user adds a reaction to a message
         * @event Client#reactionRemoved
         * @param {object} data - Event data
         * @param {User} data.reactingUser - The user reacting
         * @param {User} data.itemUser - The user they are reacting to
         * @param {string} data.reaction - The emoji they reacted with
         */
        this.setListeners(({ user: reactingUser, item_user: itemUser, reaction, item: reactingItem }) => {
            reactingUser = this.client.users.get(reactingUser);
            itemUser = this.client.users.get(itemUser);

            // only support message reactions for now
            if (reactingItem.type !== 'message') {
                return;
            }

            const item = new Message(this.client, reactingItem);

            const reactionData: IReactionEvent = { reactingUser, itemUser, reaction, item };

            this.client.emit('reactionRemoved', reactionData);
        }, 'reaction_removed');
    }
}