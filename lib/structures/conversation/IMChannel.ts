import Conversation, { IConversationData } from './Conversation';
import Client from '../../client/Client';
import User from '../user/User';

interface IMChannelData extends IConversationData {
    user: string;
    is_user_deleted: boolean;
}

class IMChannel extends Conversation {
    user: User;
    isUserDeleted: boolean;

    /**
     * This class represents an IM channel in slack.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client: Client, data: IMChannelData) {
        super(client, data);

        if (data) {
            this.setup(data);
        }

        this.isIM = true;
    }

    setup(data: IMChannelData) {
        /**
         * The user who "owns" this DM.
         * @type {User}
         */
        this.user = this.client.users.get(data.user);

        this.members.set(data.user, this.user);

        /**
         * Whether the user is deleted (disabled).
         * @type {boolean}
         */
        this.isUserDeleted = data.is_user_deleted;
    }
}

module.exports = IMChannel;