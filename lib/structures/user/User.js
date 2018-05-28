const SlackUtil = require('../../util/SlackUtil');
const Structure = require('../Structure');
const DoNotDisturb = require('./DoNotDisturb');

class User extends Structure {
    /**
     * This class represents a slack user.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client, data){
        super(client, data);
    }

    /**
     * Sets up the {User} with data provided from slack.
     * @param data {object} - The data from slack to use.
     */
    setup(data) {
        super.setup();

        /**
         * @namespace
         * @property {string} User.id - The ID of this user.
         * @property {string} User.name - THe username of this user.
         * @property {string} User.color - The color of this user, mostly used in compact mode.
         * @property {boolean} User.isAdmin - Whether the user is an admin in this team.
         * @property {boolean} User.isOwner - Whether the user is the owner of this team.
         * @property {boolean} User.has2fa - Whether the user has 2fa enabled. This may not be available to all clients.
         * @property {boolean} User.isBot - Whether the user is a bot
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
         * @property {object} User.prefs - An object of user preferences that will only exist if this user is the authenticated one.
         */
        Object.assign(this, SlackUtil.convertProperties(data));

        this.isDisabled = this.deleted;

        /**
         * This user's DND status. This starts as being
         * 'empty', you should call {@Link DoNotDisturb#update}
         * on this.
         * @type {DoNotDisturb}
         */
        this.dnd = new DoNotDisturb(this.client, this);
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
     * This is determined
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

    get isDeleted() {
        return this.deleted;
    }

    set isDeleted(v) {
        this.deleted = v;
    }

    get isDisabled() {
        return this.isDeleted;
    }

    set isDisabled(v) {
        this.isDeleted = v;
    }

	/**
     * Disables this user (sets them as inactive).
     * <p>
     * This call will not work on free tier teams.
	 * @returns {Promise.<void>}
	 */
	async disable() {
        this.client.api.methods.users.admin.setInactive({ user: this.id }).then(() => {
            this._setDisabled(true);
        });
    }

    /**
     * Retrieve info about this user and update it.
     * This is usually not going to be necessary to call.
     * @return {Promise.<void>}
     */
    async update() {
        return this.client.api.methods.users.info({ user: this.id })
            .then((data) => {
                this.setup(data.user);
                return this.dnd.update();
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

    /**
     * Return whether another user equals this one
     * @param {User} other - The other user to check
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
}

module.exports = User;