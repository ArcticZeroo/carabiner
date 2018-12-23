import Client from '../../client/Client';
import SlackUtil from '../../util/SlackUtil';
import Structure from '../Structure';

export interface IConversationDescriptorData {
    value: string;
    creator: string;
    last_set: number;
}

export default class ConversationDescriptor extends Structure<IConversationDescriptorData> {
    /**
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client: Client, data: IConversationDescriptorData) {
        super(client, data);

        /**
         * Whether this descriptor exists (i.e. is not empty).
         * If the descriptor has been set back to empty, this is
         * still false.
         * @type {boolean}
         * @readonly
         */
        Object.defineProperty(this, 'exists', { value: data ? (!!data.value) : false });
    }

    // eslint-disable-next-line require-jsdoc
    setup(data: IConversationDescriptorData) {
        /**
		 * The value of the channel descriptor.
		 * @type {string}
		 * @readonly
		 */
        Object.defineProperty(this, 'value', { value: data.value });

        /**
		 * The creator of the channel descriptor
		 * @type {User}
		 * @readonly
		 */
        Object.defineProperty(this, 'creator', { value: this.client.users.get(data.creator) });

        /**
		 * The slack timestamp of the time this descriptor was set
		 * @type {number}
		 * @readonly
		 */
        Object.defineProperty(this, 'lastSetTimestamp', { value: data.last_set });
    }

    /**
     * Gets the {Date} at which this channel descriptor was set.
     * @return {Date}
     * @readonly
     */
    get set(): Date {
        return SlackUtil.getDate(this.lastSetTimestamp);
    }

    /**
     * Same as {@link ConversationDescriptor#set}
     * @return {Date}
     */
    get lastSet(): Date {
        return this.set;
    }
}
