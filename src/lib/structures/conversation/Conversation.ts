import Client from '../../client/Client';
import IllegalOperationException from '../../exception/IllegalOperationException';
import SlackTime from '../../models/types/SlackTime';
import SlackUtil from '../../util/SlackUtil';
import Structure from '../Structure';
import ConversationType from '../../enum/ConversationType';
import User from '../user/User';
import ConversationDescriptor, { IConversationDescriptorData } from './ConversationDescriptor';
import Message, { IMessageData } from '../message/Message';
import Collection from '@arcticzeroo/collection';
import MessageBuilder from '../message/MessageBuilder';
import Attachment from '../message/attachment/Attachment';

export interface IConversationData {
    id: string;
    creator: string;
    name: string;
    is_member: boolean;
    members?: string[];
    last_read?: SlackTime;
    latest?: IMessageData;
    unread_count?: number;
    is_archived?: boolean;
    is_general: boolean;
    is_channel: boolean;
    is_im: boolean;
    is_mpim: boolean;
    is_group: boolean;
    is_private: boolean;
    created: SlackTime;
    purpose?: IConversationDescriptorData;
    topic?: IConversationDescriptorData;
    unread_count_display?: any;
}

export default class Conversation extends Structure<IConversationData> {
    readonly members: Collection<string, User>;
    readonly users: Collection<string, User>;
    readonly messages: Collection<SlackTime, Message>;
    id: string;
    creator: User;
    createdTimestamp: SlackTime;
    name: string;
    topic: ConversationDescriptor;
    purpose: ConversationDescriptor;
    isMember: boolean;
    lastReadTimestamp: SlackTime;
    latest: Message;
    unreadCount: number;
    unreadCountDisplay: any;
    isArchived: boolean;
    isDefault: boolean;
    isChannel: boolean;
    isGroup: boolean;
    isMpim: boolean;
    isIM: boolean;
    isPrivate: boolean;
    isDeleted: boolean;
    isGeneral: boolean;

    /**
     * This class represents a channel in slack where users can post messages, files, etc.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client: Client, data?: IConversationData) {
        super(client);

        /**
         * The members of the conversation, as {@link User}s
         * @type {Collection<number, User>}
         */
        this.members = this.users = new Collection();
        this.messages = new Collection<SlackTime, Message>();

        if (data) {
            this.setup(data);
        }
    }

    /**
     * Use slack data to set all member properties of this Conversation
     * @param data
     */
    setup(data: IConversationData) {
        /**
         * The ID of the slack conversation
         * @property {number} Conversation.id
         * @readonly
         */
        Object.defineProperty(this, 'id', { value: data.id });

        /**
         * The creator of the slack conversation
         * @property {User} Conversation.creator
         * @readonly
         */
        Object.defineProperty(this, 'creator', { value: this.client.users.get(data.creator) });

        /**
         * The slack timestamp of the conversation's creation
         * You might be looking for {@link Conversation#created}
         * @property {number} Conversation.createdTimestamp
         * @readonly
         */
        Object.defineProperty(this, 'createdTimestamp', { value: data.created });

        /**
         * The name of the conversation
         * @type {string}
         */
        this.name = data.name;

        if (data.members && Array.isArray(data.members)) {
            for (const mId of data.members) {
                this.members.set(mId, this.client.users.get(mId));
            }
        }

        /**
         * The topic of the conversation.
         * @type {ConversationDescriptor}
         */
        this.topic = new ConversationDescriptor(this.client, data.topic);

        /**
         * The purpose of the conversation.
         * @type {ConversationDescriptor}
         */
        this.purpose = new ConversationDescriptor(this.client, data.purpose);

        /**
         * Whether the client is a member of the conversation.
         * @type {boolean}
         */
        this.isMember = data.is_member || false;

        /**
         * The slack timestamp at which the last message was read.
         * @type {boolean}
         */
        this.lastReadTimestamp = data.last_read;

        /**
         * The latest slack message.
         * @type {Message}
         */
        this.latest = (data.latest) ? new Message(this.client, data.latest) : null;

        // Do we actually care about this? I don't think I do.
        /**
         * Amount of unreads the client has.
         * @type {number}
         */
        this.unreadCount = data.unread_count || 0;

        /**
         * I'm not actually sure what this is.
         */
        this.unreadCountDisplay = data.unread_count_display;

        /**
         * Whether the conversation is archived or not.
         * @type {boolean}
         */
        this.isArchived = data.is_archived || false;

        /**
         * Whether the conversation is the team's default conversation.
         * If this is true, all users must be in this conversation.
         * @type {boolean}
         */
        this.isDefault = this.isGeneral = data.is_general;

        /**
         * Whether the conversation is a public conversation
         * @type {boolean}
         */
        this.isChannel = data.is_channel || false;
        /**
         * Whether the conversation is a MPIM (multi-person direct message, or a private conversation)
         * @type {boolean}
         */
        this.isMpim = data.is_mpim || false;
        /**
         * Whether the conversation is a private conversation
         * @type {boolean}
         */
        this.isGroup = data.is_group || false;
        /**
         * Whether the conversation is an IM (direct message)
         * @type {boolean}
         */
        this.isIM = data.is_im || false;
        /**
         * Whether the conversation is private
         * @type {boolean}
         */
        this.isPrivate = data.is_private || false;
        /**
         * Whether this conversation is deleted
         * (or archived, if it is a group)
         * @type {boolean}
         */
        this.isDeleted = false;
    }

    /**
     * Returns the type of conversation.
     * Works best if you compare the return value to the {ConversationType} enum.
     * @returns {string}
     * @type {string}
     * @readonly
     */
    get type(): string {
        if (this.isChannel) {
            return ConversationType.CHANNEL;
        }

        if (this.isGroup) {
            return ConversationType.GROUP;
        }

        if (this.isIM) {
            return ConversationType.IM;
        }

        if (this.isMpim) {
            return ConversationType.MPIM;
        }

        return ConversationType.UNKNOWN;
    }

    /**
     * Returns the Date at which the last message was read.
     * This may return null depending on how it was populated.
     * @return {Date}
     * @type {Date}
     * @readonly
     */
    get lastRead() {
        if (!this.lastReadTimestamp) {
            return null;
        }

        return SlackUtil.slackToDate(this.lastReadTimestamp);
    }

    /**
     * Returns the Date at which the conversation was created
     * @return {Date}
     * @type {Date}
     * @readonly
     */
    get created() {
        return this.createdTimestamp ? SlackUtil.slackToDate(this.createdTimestamp) : null;
    }

    /**
     * Send a message to a conversation.
     * @param message {string|Message|Attachment|Array.<Attachment>} - The message you want to send. This can be a string, message, attachment, or array of attachments. All will convert properly and send.
     * @param {object} [args={}] - Additional args to send
     * @return {Promise}
     */
    async send(message: string | Message | Attachment | Attachment[], args: object = {}): Promise<Message> {
        if (this.isArchived) {
            return Promise.reject(new Error('conversation is archived.'));
        }

        if (typeof message === 'string') {
            message = new MessageBuilder(this.client)
                .setText(message)
                .setChannel(this)
                .build();
        } else if (message instanceof Attachment) {
            message = new MessageBuilder(this.client)
                .setChannel(this)
                .addAttachment(message)
                .build();
        } else if (Array.isArray(message) && message[0] instanceof Attachment) {
            const builder = new MessageBuilder(this.client).setChannel(this);
            for (const attachment of message) {
                builder.addAttachment(attachment);
            }
            message = builder.build();
        }

        if (!(message instanceof Message)) {
            throw new TypeError('Could not convert message type to Message');
        }

        return message.send(args);
    }

    /**
     * Remove a user from this conversation.
     * @param {User} user - The user to remove.
     * @returns {Promise.<void>}
     */
    async remove(user: User): Promise<void> {
        if (user.equals(this.client.self)) {
            throw new IllegalOperationException('Can\'t kick self from a conversation');
        }

        return this.client.api.methods.conversations.kick({
            channel: this.id,
            user: user.id
        }).then(() => {
            this.members.delete(user.id);
        });
    }

    /**
     * Alias for {@link Conversation#remove}
     * @param {User} user - The user to remove.
     * @returns {Promise.<void>}
     */
    kick(user: User) {
        return this.remove(user);
    }

    /**
     * Retrieve info about this conversation and update it.
     * This is usually not going to be necessary to call.
     * @return {Promise.<void>}
     */
    async update(): Promise<void> {
        return this.client.api.methods.conversations.info({ channel: this.id })
            .then(data => this.setup(data.channel));
    }

    /**
     * Retrieve all members in this conversation, and
     * populate this conversation's members.
     * @returns {Promise<Array<String>>}
     */
    async retrieveMembers(): Promise<void> {
        let memberIds;
        try {
            memberIds = await SlackUtil.getPages({
                method: this.client.api.methods.conversations.members,
                args: { channel: this.id },
                singlePageLimit: Math.max(100, Math.min(1000, this.client.users.size)),
                transformData: r => r.members
            });
        } catch (e) {
            throw e;
        }

        for (const memberId of memberIds) {
            this.members.set(memberId, this.client.users.get(memberId));
        }
    }

    /**
     * Whether this conversation has the given user
     * @param {User} user - The user to check
     * @returns {boolean}
     */
    contains(user?: User): boolean {
        if (!user || !user.id) {
            return false;
        }

        return this.members.has(user.id);
    }

    /**
     * Cache a message in this conversation.
     * If there are too many messages being cached,
     * @param message
     * @param overrideClientSetting
     */
    cacheMessage(message: Message, overrideClientSetting: boolean = false): void {
        if (!this.client.options.cacheMessages && !overrideClientSetting) {
            return;
        }

        // If Number.isFinite returns false just don't bother to check if we have too many messages cached...
        if (Number.isFinite(this.client.options.messageCacheLimitPerConversation)
            && this.messages.size >= this.client.options.messageCacheLimitPerConversation) {
            this.messages.delete(this.messages.lastKey());
        }

        this.messages.set(message.sentTimestamp, message);
    }

    equals(other: any): boolean {
        if (!(other instanceof Conversation)) {
            return false;
        }

        return other.id === this.id;
    }
}