const SlackUtil = require('../../util/SlackUtil');

class ChannelDescriptor {
    /**
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client, data) {
        /**
         * The value of the channel descriptor.
         * @type {string}
         * @readonly
         */
        Object.defineProperty(this, 'value', {value: data.value});

        /**
         * The creator of the channel descriptor
         * @type {User}
         * @readonly
         */
        Object.defineProperty(this, 'creator', {value: client.users.get(data.creator)});

        /**
         * The slack timestamp of the time this descriptor was set
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, 'lastSetTimestamp', {value: data.last_set});
    }

    /**
     * Gets the {Date} at which this channel descriptor was set.
     * @return {Date}
     * @readonly
     */
    get set() {
        return SlackUtil.getDate(this.lastSetTimestamp);
    }

    /**
     * Same as {ChannelDescriptor#set}
     * @return {Date}
     */
    get lastSet() {
        return this.set;
    }
}

module.exports = ChannelDescriptor;