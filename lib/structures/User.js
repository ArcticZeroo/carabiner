const SlackUtil = require('../util/SlackUtil');

class User{
    /**
     * This class represents a slack user.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client, data){
        this.client = client;

        if (data) {
            this.setup(data);
        }
    }

    /**
     * Sets up the {User} with data provided from slack.
     * @param data {object} - The data from slack to use.
     */
    setup(data) {
        /**
         * @namespace
         * @property {string} User.id - The ID of this user.
         * @property {string} User.color - The color of this user, mostly used in compact mode.
         * @property {boolean} User.isAdmin - Whether the user is an admin in this team.
         * @property {boolean} User.isOwner - Whether the user is the owner of this team.
         * @property {boolean} User.has2fa - Whether the user has 2fa enabled. This may not be available to all clients.
         * @property {boolean} User.deleted - Whether the user is deleted.
         * @property {object} User.profile - The user's profile, which contains information about them.
         * @property {string} User.profile.firstName - The user's first name.
         * @property {string} User.profile.lastName - The user's last name.
         * @property {string} User.profile.realName - The user's first and last name.
         * @property {string} User.profile.tz - The user's timezone.
         * @property {string} User.profile.tz_label - The display name of the user's timezone. Use this with Date#toLocaleDateString as the timeZone option.
         * @property {number} User.profile.tz_offset - The amount of seconds to remove from GMT.
         * @property {boolean} User.isRestricted - Whether the user's account is "restricted" (i.e. a multi-channel guest)
         * @property {boolean} User.isUltraRestricted - Whether the user's account is "ultra restricted" (i.e. a single-channel guest).
         */
        Object.assign(this, SlackUtil.convertProperties(data));

        /**
         * Whether the user is currently deleted/disabled.
         * @type {boolean}
         */
        this.isDeleted = this.isDisabled = this.deleted;

    }

    /**
     * Send a message to the user directly.
     * @param msg {string|Message} - The message to send.
     * @param {object} [args={}] - Additional args to send.
     * @return {Promise}
     */
    send(msg, args = {}) {
        return this.client.chat(this, msg, args);
    }

    /**
     * Whether the user is a full user in this org.
     * @type {boolean}
     * @return {boolean}
     */
    get isFullUser() {
        return !(this.isRestricted || this.isUltraRestricted);
    }

    /**
     * The user's mention.
     * @type {string}
     * @return {string}
     * @readonly
     */
    get mention() {
        return User.getMention(this.id);
    }

    /**
     * Retrieve info about this user and update it.
     * This is usually not going to be necessary to call.
     * @return {Promise.<void>}
     */
    async update() {
        return this.client.api.methods.users.info({
            user: this.id
        }).then((d)=>{
            this.setup(d.user);
        });
    }

    /**
     * Get a mention from any slack ID.
     * @param id {string} - The user's slack ID.
     * @return {string}
     */
    static getMention(id){
        return `<@${id}>`;
    }
}

module.exports = User;