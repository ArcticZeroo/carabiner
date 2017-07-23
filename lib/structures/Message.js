const SlackUtil = require('../util/SlackUtil');
const User = require('./User');

class Message{
    /**
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param data {object} [] - The 'raw' data provided by slack if applicable.
     */
    constructor(client, data) {
        this.client = client;

        /**
         * The edit history for this message.
         * This is empty by default.
         * @type {Array}
         */
        this.editHistory = [];

        if (data) {
            this.setup(data);
        }
    }

    setup(data) {
        /**
         * The slack timestamp at which the message was sent.
         * @type {number}
         */
        this.sentTimestamp = data.ts;

        /**
         * The {User} that sent the message.
         * @type {User}
         */
        this.user = this.client.users.get(data.user);

        /**
         * The {Channel} in which the message was sent.
         * @type {Channel}
         */
        this.channel = this.client.channels.get(data.channel);

        /**
         * The text of the message.
         * @type {string}
         */
        this.text = data.text;

        /**
         * The subtype of the message. This may be null.
         * It's probably easiest for your sanity to use
         * {MessageSubtype} to compare.
         * @type {string}
         */
        this.subtype = data.subtype;

        /**
         * An array containing an object for each reaction added.
         * @type {Array}
         */
        this.reactions = (data.reactions || []).map((r)=> {
            r.users = r.users.map((id => this.client.users.get(id)));
            return r;
        });

        /**
         * An array of channels the message is pinned to.
         * @type {Array<Channel>}
         */
        this.pinnedTo = (data.pinnedTo || []).map((id)=> this.client.channels.get(id));

        /**
         * Whether the message is starred by the client.
         * Defaults to false, of course.
         * @type {boolean}
         */
        this.isStarred = !!data.is_starred;

        /**
         * The timestamp at which this message was deleted, if it was delted.
         * @type {number}
         */
        this.deletedTimestamp = data.deleted_timestamp;
        this.isDeleted = !!this.deletedTimestamp;

        /**
         * The attachments on the message, if any.
         * @type {Array}
         */
        this.attachments = data.attachments || [];
    }

    /**
     * The timestamp as a {Date} at which the message was sent.
     * @returns {Date}
     */
    get ts() {
        return SlackUtil.getDate(this.sentTimestamp);
    }

    /**
     * Same as {Message#ts}
     * @returns {Date}
     */
    get sent() {
        return this.ts;
    }

    /**
     * The timestamp as a {Date} at which the message was deleted, if it was deleted.
     * This may return null if it is not deleted.
     * @returns {Date}
     */
    get deleted() {
        if (!this.isDeleted) {
            return null;
        }

        return SlackUtil.getDate(this.deletedTimestamp);
    }

    /**
     * Sends the message. This will really only be used for MessageBuilder, but
     * feel free to use it to resend a message or something?
     * @param args {object} [{}] - Additional args.
     * @return {Promise}
     */
    send(args = {}) {
        return this.client.chat(this.channel, this.text, Object.assign({
            attachments: this.attachments
        }, args));
    }

    /**
     * Replies to the message by mentioning the original user and then adding the text after a space.
     * @param text {string} - The text to send
     * @param mention {boolean} [true] - Whether or not the reply should mention the original user.
     * @param args {object} [{}] - Additional args to send.
     * @return {Promise}
     */
    reply(text, mention = true, args = {}) {
        return this.channel.send((mention) ? `${this.user.mention} ${text}` : text, args);
    }

    /**
     * Edits the message.
     * @param newText {string} - The new text in the message.
     * @param args {object} - Any additional args you want to pass, like an attachment.
     * @return {Promise}
     */
    edit(newText, args = {}) {
        return this.client.api.methods.chat.update(Object.assign({
            channel: this.channel.id,
            ts: this.sentTimestamp,
            text: newText
        }, args));
    }

    /**
     * Deletes the message.
     * @return {Promise}
     */
    delete() {
        return this.client.api.methods.chat.delete({
            channel: this.channel.id,
            ts: this.sentTimestamp
        });
    }

    /**
     * Same as {Message#delete}
     * @return {Promise}
     */
    remove() {
        return this.delete();
    }
}

module.exports = Message;