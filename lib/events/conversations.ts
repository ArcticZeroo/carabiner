import ConversationType from '../enum/ConversationType';
import Conversation from '../structures/conversation/Conversation';
import StringUtil from '../util/StringUtil';
import EventHandler from './handler';

export default class ConversationEventHandler extends EventHandler {
    listen() {
        /**
         * Emitted when a conversation of any type
         * is created.
         * Use conversationCreated.[type] to get events for just
         * channels, groups, ims, etc
         * @param {Conversation} - The conversation created
         * @event Client#conversationCreated
         */
        this.setListeners(this.onCreate, 'channel_created', 'im_created');

        /**
         * Emitted when a conversation of any type
         * is "opened", which apparently to slack
         * pretty much just means that the authenticated
         * user created it.
         * Use conversationOpen.[type] to get events for just
         * channels, groups, ims, etc
         * @param {Conversation} - The conversation created
         * @event Client#conversationOpen
         */
        this.setListeners(this.onCreate, 'group_open', 'im_open');

        /**
         * Emitted when a conversation of any type
         * is deleted.
         * Use conversationDeleted.[type] to get events for just
         * channels, groups, ims, etc
         * @param {Conversation} - The conversation deleted
         * @event Client#conversationDeleted
         */
        this.setListeners(this.onDelete, 'channel_deleted');

        /**
         * Emitted when a conversation of any
         * type is renamed.
         * Use conversationRename.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationRename
         * @param {object} data - Event data
         * @param {string} data.oldName - The old conversation name
         * @param {string} data.newName - The new conversation name
         * @param {Conversation} data.conversation - The conversation whose name was just changed
         */
        this.setListeners(this.onRename, 'channel_rename', 'group_rename');

        /**
         * Emitted when a user joins a slack conversation.
         * Use conversationMemberJoin.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationMemberJoin
         * @param {object} data - Event data.
         * @param {Conversation} data.conversation - The conversation the member joined.
         * @param {User} data.user - The user that joined the channel.
         * @param {User|null} data.inviter - The user that invited the joining member, if applicable.
         */
        this.setListeners(this.onMemberJoin, 'member_joined_channel');

        /**
         * Emitted when a user leaves a slack conversation.
         * Use conversationMemberLeave.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationMemberLeave
         * @param {object} data - Event data.
         * @param {Conversation} data.conversation - The channel the member left.
         * @param {User} data.user - The user that joined the channel.
         */
        this.setListeners(this.onMemberLeave, 'member_left_channel');

        /**
         * Emitted when a conversation is archived (distinct from deletion
         * because it still exists in message history and can be remade later)
         * Use conversationArchive.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationArchive
         * @param {Conversation} conversation - The conversation that was just archived.
         */
        this.setListeners(this.onArchive, 'channel_archive', 'group_archive');

        /**
         * Emitted when a conversation is unarchived
         * Use conversationUnarchive.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationUnrchive
         * @param {Conversation} conversation - The conversation that was just unarchived.
         */
        this.setListeners(this.onUnArchive, 'channel_unarchive', 'group_unarchive');

        /**
         * Emitted when the current user joins a conversation
         * Use conversationSelfJoin.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationSelfJoin
         * @param {Conversation} conversation - The conversation the client joined
         */
        this.setListeners(this.onSelfJoin, 'channel_joined', 'group_joined');

        /**
         * Emitted when the current user leaves a conversation
         * Use conversationSelfLeave.[type] to get events for just
         * channels, groups, ims, etc
         * @event Client#conversationSelfLeave
         * @param {Conversation} conversation - The conversation the client left
         */
        this.setListeners(this.onSelfLeave, 'channel_left', 'group_left');

        this.setListeners(this.onClose, 'im_close', 'group_close');
    }

    /**
     * Emit two conversation events. One will be
     * conversation$name, the other conversation$name.$type
     * based on the given conversation in the data.
     * @param {string} name - The event suffix name.
     * @param {object|Conversation} data - Data to emit and get the conversation from. If this is an object, it must have a conversation property.
     */
    emitWithSubtype(name: string, data: Conversation | ({ conversation: Conversation } & any)) {
        name = StringUtil.capitalize(name);

        let conversation;
        if (data instanceof Conversation) {
            conversation = data;
        } else if (data.conversation instanceof Conversation) {
            conversation = data.conversation;
        } else {
            this.client.emit('error', new Error(`Could not emit a conversation event with the subtype ${name}; invalid data provided`));
        }

        this.client.emit(`conversation${name}`, data);
        this.client.emit(`conversation${name}.${conversation.type}`, data);
    }

    static getConversationId({ channel } : { channel: string | Conversation }) {
        return (typeof channel === 'string') ? channel : channel.id;
    }

    onClose(data: { channel: string | Conversation }) {
        const id = ConversationEventHandler.getConversationId(data);

        const conversation = this.client.conversations.get(id);

        this.emitWithSubtype('close', conversation);
    }

    onRename(data: { channel: { id: string, name: string; } }) {
        const conversation = this.client.conversations.get(data.channel.id);

        const oldName = conversation.name;
        const newName = data.channel.name;

        conversation.name = newName;

        this.emitWithSubtype('rename', { conversation, oldName, newName });
    }

    onSelfJoin(data: { channel: string | Conversation }) {
        const id = ConversationEventHandler.getConversationId(data);

        if (!this.client.conversations.has(id)) {
            this.client.retrieveConversation(id)
                .then(conversation => {
                    this.client.conversations.set(conversation.id, conversation);
                    this.emitWithSubtype('selfJoin', conversation);
                })
                .catch(e => this.client.emit('error', e));
        } else {
            const conversation = this.client.conversations.get(id);

            conversation.users.set(this.client.self.id, this.client.self);

            this.emitWithSubtype('selfJoin', conversation);
        }
    }

    onSelfLeave({ channel: id } : { channel: string }) {
        const conversation = this.client.conversations.get(id);

        conversation.users.delete(this.client.self.id);

        this.emitWithSubtype('selfLeave', conversation);
    }

    onOpen(data: { channel: string | Conversation }) {
        const id = ConversationEventHandler.getConversationId(data);

        this.client.retrieveConversation(id)
            .then(conversation => {
                this.client.conversations.set(conversation.id, conversation);
                this.emitWithSubtype('open', conversation);
            })
            .catch(e => {
                this.client.emit('error', e);
            });
    }

    async onMemberJoin(data : { channel: string, user: string, inviter: string }) {
        /**
         * @type {Conversation}
         */
        let conversation;
        if (!this.client.conversations.has(data.channel)) {
            try {
                conversation = await this.client.retrieveConversation(data.channel);
                this.client.conversations.set(conversation.id, conversation);
            } catch (e) {
                console.error(e);
                return;
            }
        } else {
            conversation = this.client.conversations.get(data.channel);
        }

        const user = this.client.users.get(data.user);

        conversation.users.set(user.id, user);

        const inviter = (data.inviter) ? this.client.users.get(data.inviter) : null;

        this.emitWithSubtype('memberJoin', { conversation, user, inviter });
    }

    onMemberLeave(data: { channel: string, user: string }) {
        const conversation = this.client.conversations.get(data.channel);
        const user = this.client.users.get(data.user);

        conversation.users.delete(user.id);

        this.emitWithSubtype('memberLeave', { conversation, user });
    }

    onCreate(data: { channel: string | Conversation }) {
        const id = ConversationEventHandler.getConversationId(data);

        this.client.retrieveConversation(id)
            .then(conversation => {
                this.client.conversations.set(conversation.id, conversation);

                this.emitWithSubtype('created', conversation);
            })
            .catch(e => {
                this.client.emit('error', e);
            });
    }

    onArchive({ channel: id } : { channel: string }) {
        const conversation = this.client.conversations.get(id);

        conversation.isArchived = true;

        if (conversation.type !== ConversationType.CHANNEL) {
            conversation.isDeleted = true;
        }

        this.emitWithSubtype('archive', conversation);
    }

    onUnArchive({ channel: id } : { channel: string }) {
        const conversation = this.client.conversations.get(id);

        conversation.isArchived = false;
        conversation.isDeleted = false;

        this.emitWithSubtype('unarchive', conversation);
    }

    onDelete(data: { channel: string }) {
        const conversation = this.client.conversations.get(data.channel);

        conversation.isDeleted = true;

        // It has to be archived if it's deleted...
        conversation.isArchived = true;

        this.client.conversations.delete(data.channel);

        this.emitWithSubtype('deleted', conversation);
    }
}