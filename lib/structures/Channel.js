const SlackUtil = require('../util/SlackUtil');
const ChannelType = require('../enum/ChannelType');
const ChannelDescriptor = require('./ChannelDescriptor');
const Message = require('./Message');
const Collection = require('djs-collection');
const MessageBuilder = require('./MessageBuilder');

class Channel {
    constructor(client, data) {
        this.client = client;

        /**
         * The members of the channel, as {@link User}s
         * @type {Collection.<number, User>}
         */
        this.members = new Collection();

        if (data) {
            this.setup(data);
        }
    }

    setup(data) {
        /**
         * The ID of the slack channel
         * @alias Channel.id
         * @readonly
         */
        Object.defineProperty(this, 'id', {value: data.id});

        /**
         * The creator of the slack channel
         * @alias Channel.creator
         * @type {User}
         * @readonly
         */
        Object.defineProperty(this, 'creator', {value: this.client.users.get(data.creator)});

        /**
         * The slack timestamp of the channel's creation
         * You might be looking for {@link Channel#created}
         * @alias Channel.createdTimestamp
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, 'createdTimestamp', {value: data.created});

        /**
         * The name of the channel
         * @type {string}
         */
        this.name = data.name;

        if (data.members) {
            for (const mId of data.members) {
                this.members.set(mId, this.client.members.get(mId));
            }
        }

        /**
         * The topic of the channel.
         * @type {ChannelDescriptor}
         */
        this.topic = new ChannelDescriptor(this.client, data.topic);

        /**
         * The purpose of the channel.
         * @type {ChannelDescriptor}
         */
        this.purpose = new ChannelDescriptor(this.client, data.purpose);

        /**
         * Whether the client is a member of the channel.
         * @type {boolean}
         */
        this.isMember = data.is_member;

        /**
         * The slack timestamp at which the last message was read.
         * @type {boolean}
         */
        this.lastReadTimestamp = data.last_read;

        /**
         * The slack timestamp at which the last message was sent.
         * @type {boolean}
         */
        this.latest = (data.latest)? new Message(this.client, data.latest) : null;

        // Do we actually care about this? I don't think I do.
        /**
         * Amount of unreads the client has.
         * @type {number}
         */
        this.unreadCount = data.unread_count;
        /**
         * I'm not actually sure what this is.
         */
        this.unreadCountDisplay = data.unread_count_display;

        /**
         * Whether the channel is archived or not.
         * @type {boolean}
         */
        this.isArchived = data.is_archived;

        /**
         * Whether the channel is the team's default channel.
         * If this is true, all users must be in this channel.
         * @type {boolean}
         */
        this.isDefault = this.isGeneral = data.is_general;

        /**
         * Whether the channel is a public channel
         * @type {boolean}
         */
        this.isChannel = data.is_channel || false;
        /**
         * Whether the channel is a MPIM (multi-person direct message, or a private channel)
         * @type {boolean}
         */
        this.isMpim = data.is_mpim || false;
        /**
         * Whether the channel is a private channel
         * @type {boolean}
         */
        this.isGroup = data.is_group || false;
        /**
         * Whether the channel is an IM (direct message)
         * @type {boolean}
         */
        this.isIM = data.is_im || false;
    }

    /**
     * Returns the type of channel.
     * Works best if you compare the return value to the {ChannelType} enum.
     * @returns {string}
     * @readonly
     */
    get type() {
        if (this.isChannel) {
            return ChannelType.CHANNEL;
        }

        if (this.isGroup) {
            return ChannelType.GROUP;
        }

        if (this.isIM) {
            return ChannelType.IM;
        }

        if (this.isMpim) {
            return ChannelType.MPIM;
        }

        return ChannelType.UNKNOWN;
    }

    /**
     * Returns the {Date} at which the last message was read
     * @return {Date}
     * @readonly
     */
    get lastRead() {
        return SlackUtil.getDate(this.lastReadTimestamp || 0);
    }

    /**
     * Returns the {Date} at which the channel was created
     * @return {Date}
     * @readonly
     */
    get created() {
        return SlackUtil.getDate(this.createdTimestamp || 0);
    }

    /**
     *
     * @param message {string|Message} - The message you want to send. If this is a string, it'll be turned into a {Message}
     * @param args {object} [{}] - Additional args to send
     * @return {Promise}
     */
    send(message, args = {}) {
        if (this.isArchived) {
            return Promise.reject(new Error('Channel is archived.'));
        }

        if (typeof message === 'string') {
            message = new MessageBuilder()
                .setText(message)
                .setChannel(this)
                .build(this.client);
        }

        return message.send(args);
    }
}