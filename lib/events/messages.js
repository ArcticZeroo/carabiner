/* eslint-disable require-jsdoc */
const EventHandler = require('./handler');
const Message = require('../structures/message/Message');

class TeamEventHandler extends EventHandler {
    constructor(client, { listenByDefault }) {
        super(client, { listenByDefault, name: 'message' });
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
         * you can listen to message.subtype.<T>.
         * Or if you only want messages from a certain
         * channel type, you can listen to message.type.<T>
         * @event Client#message
         * @param {Message} message - The message that was sent.
         */
        this.emitter.on('message', data => {
            const message = new Message(this.client, data);

            this.client.emit('message', message);
            this.client.emit(`message.type.${message.channel.type}`, message);

            if (message.subtype) {
                this.client.emit(`message.subtype.${message.subtype}`, message);

                //TODO: switch on subtype for special handling
            } else {
                /**
                 * Emitted when a user sends a chat message.
                 * These are messages without subtypes.
                 * @event Client#message.chat
                 * @param {Message} message - The message they sent
                 */
                this.client.emit('message.chat', message);
            }
        });
    }

    _listenRelated() {
        /**
         * Emitted when a user adds a reaction to a message
         * @event Client#reactionAdded
         * @param {object} data - Event data
         * @param {User} data.reactingUser - The user reacting
         * @param {User} data.reactingTo - The user they are reacting to
         * @param {string} data.reaction - The emoji they reacted with
         */
        this.emitter.on('reaction_added', ({ user: reactingUser, item_user: reactingTo, reaction }) => {
            reactingUser = this.client.users.get(reactingUser);
            reactingTo = this.client.users.get(reactingTo);

            this.client.emit('reactionAdded', { reactingUser, reactingTo, reaction });
        });

        /**
         * Emitted when a user adds a reaction to a message
         * @event Client#reactionRemoved
         * @param {object} data - Event data
         * @param {User} data.reactingUser - The user reacting
         * @param {User} data.reactingTo - The user they are reacting to
         * @param {string} data.reaction - The emoji they reacted with
         */
        this.emitter.on('reaction_removed', ({ user: reactingUser, item_user: reactingTo, reaction }) => {
            reactingUser = this.client.users.get(reactingUser);
            reactingTo = this.client.users.get(reactingTo);

            this.client.emit('reactionRemoved', { reactingUser, reactingTo, reaction });
        });
    }
}

module.exports = TeamEventHandler;