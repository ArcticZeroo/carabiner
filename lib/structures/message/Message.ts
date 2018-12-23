import Client from '../../client/Client';
import IClientWebApiChatArgs from '../../models/client/IClientWebApiChatArgs';
import SlackUtil from '../../util/SlackUtil';
import Structure from '../Structure';
import User from '../user/User';
import Conversation from '../conversation/Conversation';
import Attachment from './attachment/Attachment';
import MessageBuilder from './MessageBuilder';
import Collection from '@arcticzeroo/collection';

export interface IMessageData {
    ts: number;
    user: string;
    channel: string;
    text: string;
    subtype?: string;
    reactions?: Array<{ name: string, users: string[] }>
    pinnedTo?: string[];
    is_starred?: boolean;
    deleted_timestamp?: number;
    attachments?: any[];
    thread_ts?: number;

}

export default class Message extends Structure<IMessageData> {
    private _user: User;
    private _channel: Conversation;

    readonly editHistory: any[];
    readonly reactions: Collection<string, User[]>;
    sentTimestamp: number;
    threadTimestamp?: number;
    deletedTimestamp?: number;
    isDeleted: boolean;
    text: string;
    attachments: Attachment[];
    subtype: string;
    pinnedTo: Conversation[];
    isStarred?: boolean;

    /**
     * This class represents a message sent in any slack channel.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client: Client, data?: IMessageData) {
        super(client, data);

        /**
         * The edit history for this message.
         * This is empty by default.
         * @type {Array}
         */
        this.editHistory = [];

        /**
         * A map of <emoji name, Array of users who reacted>
         * @type {Collection<string, Array<User>>}
         */
        this.reactions = new Collection();
    }

    setup(data: IMessageData) {
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

        for (const { name, users } of (data.reactions || [])) {
            if (!this.reactions.has(name)) {
                this.reactions.set(name, []);
            }

            const usersArray = this.reactions.get(name);

            for (const userId of users) {
                const user = this.client.users.get(userId);

                if (!usersArray.includes(user)) {
                    usersArray.push(user);
                }
            }
        }

        /**
         * An array of conversations the message is pinned to.
         * @type {Array<Conversation>}
         */
        this.pinnedTo = (data.pinnedTo || []).map((id: string) => this.client.conversations.get(id));

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

    /**
     * Return whether this is a chat
     * message, i.e. whether its subtype
     * does not exist.
     * @return {boolean}
     */
    get isChat() {
        return this.subtype == null;
    }

    /**
     * The user who sent this message
     * @type {User}
     * @return {User}
     */
    get user() {
        return this._user;
    }

    /**
     * Same as Message.user
     * @return {User}
     */
    get author() {
        return this.user;
    }

    /**
     * Set the user who sent
     * this message.
     * @param {User} sender
     */
    set user(sender) {
        if (!(sender instanceof User)) {
            throw new TypeError('Expected a User to be set as the message sender');
        }

        this._user = sender;
    }

    /**
     * Same as Message.user's setter
     * @param {User} author
     */
    set author(author) {
        this.user = author;
    }

    /**
     * Get the channel (conversation)
     * this message was sent in. This
     * is only here for legacy reasons.
     * @type {Conversation}
     * @return {Conversation}
     */
    get channel() {
        return this._channel;
    }

    /**
     * Same as Message.channel
     * @return {Conversation}
     */
    get conversation() {
        return this.channel;
    }

    /**
     * Set the conversation this message
     * was sent in.
     * @param {Conversation} origin
     */
    set channel(origin) {
        if (!(origin instanceof Conversation)) {
            throw new TypeError('Expected a Conversation given as the origin');
        }

        this._channel = origin;
    }

    /**
     * Same as the setter for
     * Message.channel
     * @param {Conversation} origin
     */
    set conversation(origin) {
        this.channel = origin;
    }

    /**
     * Sends the message. This will really only be used for MessageBuilder, but
     * feel free to use it to resend a message or something?
     * @param {object} [args={}] - Additional args.
     * @return {Promise}
     */
    send(args: IClientWebApiChatArgs = {}) {
        return this.client.chat(this.channel, this.text, Object.assign({ attachments: this.attachments }, args));
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
    sendEphemeral(user: User, args: IClientWebApiChatArgs = {}) {
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
    reply(text: string, mention: boolean = true, args: IClientWebApiChatArgs = {}) {
        return this.channel.send((mention) ? `${this.user.mention} ${text}` : text, args);
    }

    /**
     * Send a threaded reply to this message, using a user mention if you'd like.
     * @param {string} text - The text to send as a reply
     * @param {boolean} [mention=true] - Whether or not the reply should mention the original user.
     * @param {object} [args={}] - Additional args to send.
     * @returns {Promise}
     */
    threadReply(text: string, mention: boolean = true, args: IClientWebApiChatArgs = {}) {
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
    reactReply(emoji: string, text: string, mention?: boolean, args?: IClientWebApiChatArgs) {
        return this.react(emoji).then(() => this.reply(text, mention, args));
    }

    /**
     * Edits the message.
     * @param newText {string} - The new text in the message.
     * @param args {object} - Any additional args you want to pass, like an attachment.
     * @return {Promise}
     */
    edit(newText: string, args = {}) {
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
    unfurl(unfurls: string[]) {
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
    react(emoji: string) {
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
    thread(reply: Message, args = {}) {
        const threadIdentifier = this.threadTimestamp || this.sentTimestamp;

        return reply.send(Object.assign({
            // Set the thread timestamp to the identifier
            // for the thread that already exists for this
            // message, or create a new thread with the current
            // timestamp;
            thread_ts: threadIdentifier
        }, args)).then((d: any) => {
            // Set the timestamp of this thread, in
            // case we just made a thread out of it
            // where there was not one before.
            this.threadTimestamp = threadIdentifier;
            return d;
        });
    }
}