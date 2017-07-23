const Channel = require('./Channel');
const User = require('./User');

module.exports = class IMChannel extends Channel {
    constructor(client, data) {
        super(client, data);

        if (data) {
            this.setup(data);
        }

        this.isIM = true;
    }

    setup(data) {
        /**
         * The user who "owns" this DM.
         * @type {User}
         */
        this.user = this.client.users.find('id', data.user);

        this.members.set(data.user, this.user);

        /**
         * Whether the user is deleted (disabled).
         * @type {boolean}
         */
        this.isUserDeleted = data.is_user_deleted;
    }
};