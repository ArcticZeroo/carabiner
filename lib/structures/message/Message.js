const SlackUtil = require('../../util/SlackUtil');
const Structure = require('../Structure');
const User = require('../user/User');
const MessageBuilder = require('./MessageBuilder');

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
         * @namespace
         * The {User} that sent the message.
         * @type {User}
         * @property User.user
         * @property User.author
         */
        this._user = this.client.users.get(data.user);

        /**
         * @namespace
         * The {Conversation} in which the message was sent.
         * @type {Conversation}
         * @property User.channel
         * @property User.conversation
         */
        this._channel = this.client.conversations.get(data.channel);

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
         * The timestamp at which this message was deleted, if it was deleted.
         * @type {number}
         */
        this.deletedTimestamp = data.deleted_timestamp;

        /**
         * Whether this message was deleted.
         * @type {boolean}
         */
        this.isDeleted = !!this.deletedTimestamp;

        /**
         * The attachments on the message, if any.
         * @type {Array}
         */
        this.attachments = data.attachments || [];

        /**
         * The timestamp for this thread, which
         * identifies it from other threads.
         * If this is null, there is no thread
         * for this message.
         * @type {number}
         */
        this.threadTimestamp = data.thread_ts;
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
     * Whether this message is in a thread.
     * This is also true for the parent.
     * @type {boolean}
     * @returns {boolean}
     * @readonly
     */
    get isThread() {
        return !!this.threadTimestamp;
    }

    /**
     * Whether this message is the parent
     * of a thread. Via slack API docs, this
     * is determined by whether it has a thread
     * timestamp and whether that equals its
     * original sent timestamp.
     * @returns {boolean}
     * @type {boolean}
     * @readonly
     */
    get isThreadParent() {
        return this.isThread && (this.sentTimestamp === this.threadTimestamp);
    }
    
    get user() {
        return this._user;
    }
    
    get author() {
        return this.user;
    }
    
    set user(v) {
        this._user = v;
    }
    
    set author(v) {
        this.user = v;
    }

    get channel() {
        return this._channel;
    }

    get conversation() {
        return this.channel;
    }

    set channel(v) {
        this._channel = v;
    }

    set conversation(v) {
        this.channel = v;
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
     * Send this message ephemerally, i.e. invisible to all but the user
     * that you wish to see it. It will also disappear the next time the
     * user reloads this channel, so don't send anything that needs to be
     * retrieved later.
     * @param {User} user - The user you want to see the message.
     * @param {Object} args - Additional args to send. The user and ephemeral properties will be overwritten.
     * @return {Promise}
     */
    sendEphemeral(user, args = {}) {
        // Set the recipient
        args.user = user.id;
        // Set the fact that this will be ephemeral
        args.ephemeral = true;

        return this.send(args);
    }

    /**
     * Replies to the message by mentioning the original user and then adding the text after a space.
     * This does not create a thread!
     * @param text {string} - The text to send
     * @param {boolean} [mention=true] - Whether or not the reply should mention the original user.
     * @param {object} [args={}] - Additional args to send.
     * @return {Promise}
     */
    reply(text, mention = true, args = {}) {
        return this.channel.send((mention) ? `${this.user.mention} ${text}` : text, args);
    }

    /**
     * Send a threaded reply to this message, using a user mention if you'd like.
     * @param {string} text - The text to send as a reply
     * @param {boolean} [mention=true] - Whether or not the reply should mention the original user.
     * @param {object} [args={}] - Additional args to send.
     * @returns {Promise}
     */
    threadReply(text, mention = true, args = {}) {
        return this.thread(
            new MessageBuilder(this.client)
                .setText(mention ? `${this.author.mention} ${text}` : text)
                .setConversation(this.conversation)
                .build(),
            args
        );
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
     * Alias of {@link delete}
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
     * @param {string} emoji - The emoji to react with
     * @return {Promise}
     */
    react(emoji) {
        return this.client.api.methods.reactions.add({
            channel: this.channel.id,
            name: emoji
        });
    }

    /**
     * Add a threaded reply to this message.
     * @param {Message} reply - The reply message to add to the thread
     * @param {Object} args - Arguments to use when sending this threaded reply
     * @return {Promise}
     */
    thread(reply, args = {}) {
        const threadIdentifier = this.threadTimestamp || this.sentTimestamp;

        return reply.send(Object.assign({
            // Set the thread timestamp to the identifier
            // for the thread that already exists for this
            // message, or create a new thread with the current
            // timestamp;
            thread_ts: threadIdentifier
        }, args)).then((d) => {
            // Set the timestamp of this thread, in
            // case we just made a thread out of it
            // where there was not one before.
            this.threadTimestamp = threadIdentifier;
            return d;
        });
    }
}

module.exports = Message;