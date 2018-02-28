const SlackUtil = require('../util/SlackUtil');
const Structure = require('./Structure');

class Team extends Structure {
    /**
     * This class represents a slack team.
     * @param client {Client} - The client to use.
     * @param {object} [data] - Slack data, if applicable.
     */
    constructor(client, data) {
        super(client, data);

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
    }

    /**
     * Set up this Team with slack data.
     * @param data
     */
    setup(data) {
        Object.assign(this, SlackUtil.convertProperties(data));
    }
}

module.exports = Team;