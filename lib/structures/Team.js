const SlackUtil = require('../util/SlackUtil');

module.exports = class Team {
    /**
     * @param client {Client} - The client to use.
     * @param data {object} [] - Slack data, if applicable.
     */
    constructor(client, data) {
        /**
         * The slack client used by this team.
         * @type {Client}
         */
        this.client = client;

        /**
         * All channels in this team.
         * This is simply a reference to {@link Client#channels}
         * @type {Collection}
         */
        this.channels = this.client.channels;

        /**
         * All users in this team.
         * This is simply a reference to {@link Client#users}
         * @type {Collection}
         */
        this.users = this.client.users;

        if (data) {
            this.setup(data);
        }
    }

    setup(data) {
        Object.assign(this, SlackUtil.convertProperties(data));
    }
};