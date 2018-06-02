const SlackUtil = require('../../util/SlackUtil');
const Structure = require('../Structure');

class DoNotDisturb extends Structure {
    /**
     * This class represents the Do Not Disturb status of a slack user.
     * @param {User} user - The user this dnd status is for
     * @param [data] {object} - Optional data to use to set up this class instance
     */
    constructor(user, data) {
        super(user.client, data);

        this.user = user;
    }

    /**
     * Set this DND object up using snooze data only.
     * @param {object} data - The data to set this instance up with
     * @returns {*}
     * @private
     */
    _setupSnooze(data) {
        this._snoozeEnabled = data.snooze_enabled;

        if (this._snoozeEnabled) {
            this.snoozeEnd = SlackUtil.getDate(data.snooze_endtime);
            this.snoozeRemaining = data.snooze_remaining;
        }

        return data;
    }

    setup(data) {
        super.setup(data);

        /**
         * Whether dnd is currently enabled for this user
         * @type {boolean}
         */
        this.dndEnabled = data.dnd_enabled;

        if (this.dndEnabled) {
            /**
             * The next time at which this user's DND begins.
             * @type {Date}
             */
            this.dndStart = SlackUtil.getDate(data.next_dnd_start_ts);

            /**
             * The next time at which this user's DND ends.
             * @type {Date}
             */
            this.dndEnd = SlackUtil.getDate(data.next_dnd_end_ts);
        }

        this._setupSnooze(data);

        return data;
    }

    /**
     * Whether DND is likely to be currently active, i.e. it should be active unless the user has actively disabled it.
     * @type {boolean}
     * @returns {boolean}
     */
    get dndActive() {
        if (!this.dndEnabled) {
            return false;
        }

        const now = Date.now();

        return now >= this.dndStart.getTime() && now < this.dndEnd.getTime();
    }

    /**
     * Whether snooze is currently active.
     * @type {boolean}
     * @returns {boolean}
     */
    get snoozeEnabled() {
        if (!this._snoozeEnabled) {
            return false;
        }

        return Date.now() < this.snoozeEnd.getTime();
    }

    /**
     * Whether snooze is currently active
     * @type {boolean}
     * @returns {boolean}
     */
    get snoozeActive() {
        return this.snoozeEnabled;
    }

    /**
     * Set snooze for the given user.
     * <p>
     * This method throws an error if you try to call this on
     * a user who is not the client's self, since you can't do that!
     * @param {number} minutes - The number of minutes you want to snooze for.
     * @returns {Promise}
     */
    async setSnooze(minutes) {
        if (!this.user.equals(this.client.self)) {
            throw new Error('Cannot set snooze for non-self user');
        }


        return this.client.api.methods.dnd.setSnooze({ num_minutes: minutes }).then(this._setupSnooze);
    }

    /**
     * End snooze immediately.
     * <p>
     * This will throw an error if snooze is not active.
     * @returns {Promise.<void>}
     */
    async endSnooze() {
        if (!this.snoozeActive) {
            throw new Error('Snooze is not active');
        }

        return this.client.api.methods.dnd.endSnooze().then(this.setup);
    }

    async endDnd() {
        if (!this.dndActive) {
            throw new Error('DND is not active');
        }

        return this.client.api.methods.dnd.endDnd().then(() => {
            this.dndEnd = new Date();
        });
    }

    async update() {
        const opts = {};

        if (!this.user.equals(this.client.self)) {
            opts.user = this.user.id;
        }

        return this.client.api.methods.dnd.info(opts)
            .then((data) => {
                this.setup(data);
                return data;
            });
    }

    /**
     * Update all {@link Client} DND properties at once.
     * @param {Client} client - The client in which you would like to update all DND properties
     * @param {...User} [toUpdate] - A list of users to update. If not given, all users are updated.
     * @returns {Promise.<void>}
     */
    static async updateMany(client, ...toUpdate) {
        let all;

        try {
            // Update my own DND separately, because
            // it contains more information this way
            if (toUpdate.includes(client.self)) {
                await client.self.dnd.update();
            }

            const opts = {};

            if (toUpdate && Array.isArray(toUpdate) && toUpdate.length) {
                opts.users = toUpdate.map(u => u.id).join(',');
            }

            all = await client.api.methods.dnd.teamInfo(opts);
        } catch (e) {
            throw e;
        }

        for (const id of Object.keys(all.users)) {
            // Self user was updated separately
            // if they existed in the update array,
            // so ignore it in the full one
            if (client.self.id === id) {
                continue;
            }

            if (!client.users.has(id)) {
                continue;
            }

            client.users.get(id).dnd.setup(all.users[id]);
        }
    }
}

module.exports = DoNotDisturb;