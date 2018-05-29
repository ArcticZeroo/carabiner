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
         * All conversations in this team.
         * This is simply a reference to {@link Client#conversations}
         * @type {module:enmap.Enmap}
         */
        this.conversations = this.client.conversations;

        /**
         * @namespace
         * All users in this team.
         * This is simply a reference to {@link Client#users}
         * @type {module:enmap.Enmap}
         * @property Team.users
         * @property Team.members
         */
        this.users = this.client.users;
        this.members = this.users;
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