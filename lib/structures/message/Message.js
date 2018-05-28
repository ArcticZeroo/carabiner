const SlackUtil = require('../../util/SlackUtil');
const Structure = require('../Structure');
const User = require('../user/User');

class Message extends Structure {
    /**
     * This class represents a message sent in any slack channel.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client, data) {
        super(client, data);

        /**
         * The edit history for this message.
         * This is empty by default.
         * @type {Array}
         */
        this.editHistory = [];
    }

    setup(data) {
        /**
         * The slack timestamp at which the message was sent.
         * If slack ever asks for a 'ts' property, this is what you want.
         * Alternatively, call SlackUtil.dateToSlack(msg.ts)
         * @type {number}
         */
        this.sentTimestamp = data.ts;

        /**
         * The {User} that sent the message.
         * @type {User}
         */
        this.user = this.client.users.get(data.user);

        /**
         * The {Conversation} in which the message was sent.
         * @type {Conversation}
         */
        this.channel = this.client.conversations.get(data.channel);

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
         * An array of conversations the message is pinned to.
         * @type {Array<Conversation>}
         */
        this.pinnedTo = (data.pinnedTo || []).map((id)=> this.client.conversations.get(id));

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
     * The timestamp as a Date at which the message was sent.
     * @type {Date}
     * @returns {Date}
     */
    get ts() {
        return SlackUtil.getDate(this.sentTimestamp);
    }

    /**
     * Same as {@link Message#ts}
     * @type {Date}
     * @returns {Date}
     */
    get sent() {
        return this.ts;
    }

    /**
     * The timestamp as a Date at which the message was deleted, if it was deleted.
     * This may return null if it is not deleted.
     * @type {Date}
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
     * @param {object} [args={}] - Additional args.
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
     * @param {boolean} [mention=true] - Whether or not the reply should mention the original user.
     * @param {object} [args={}] - Additional args to send.
     * @return {Promise}
     */
    reply(text, mention = true, args = {}) {
        return this.channel.send((mention) ? `${this.user.mention} ${text}` : text, args);
    }

    /**
     * React to a message, then reply to it.
     * @param {string} emoji - Emoji to react with.
     * @param {string} text - Text to reply with.
     * @param {boolean} [mention] - Whether or not to mention.
     * @param {object} [args] - Additional args to send.
     * @returns {Promise.<object>} - The response to the .reply call.
     */
    reactReply(emoji, text, mention, args) {
        return this.react(emoji).then(r => this.reply(text, mention, args));
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

    // noinspection ReservedWordAsName
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

    /**
     * Unfurl images
     * @param unfurls
     * @return {Promise}
     */
    unfurl(unfurls) {
        return this.client.api.methods.chat.unfurl({
            channel: this.channel.id,
            ts: this.sentTimestamp,
            unfurls
        });
    }

    /**
     * React to this message.
     * @param emoji
     * @return {Promise}
     */
    react(emoji) {
        return this.client.api.methods.reactions.add({
            channel: this.channel.id,
            name: emoji
        });
    }
}

module.exports = Message;