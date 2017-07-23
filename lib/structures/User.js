const SlackUtil = require('../util/SlackUtil');

class User{
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
        Object.assign(this, SlackUtil.convertProperties(data));

        /**
         * Whether the user is currently deleted/disabled.
         * @type {boolean}
         */
        this.isDeleted = this.isDisabled = this.deleted;

    }

    /**
     * Send a message to a channel.
     * @param msg {string|Message} - The message to send.
     * @param args {object} [{}] - Additional args to send.
     */
    send(msg, args = {}) {
        this.client.chat(this, msg, args);
    }

    /**
     * Whether the user is a full user in this org.
     * @return {boolean}
     */
    get isFullUser() {
        return !(this.isRestricted || this.isUltraRestricted);
    }

    /**
     * The user's mention.
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