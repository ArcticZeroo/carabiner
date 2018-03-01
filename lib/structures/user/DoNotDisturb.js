const SlackUtil = require('../../util/SlackUtil');
const Structure = require('../Structure');

class DoNotDisturb extends Structure {
    /**
     * This class represents the Do Not Disturb status of a slack user.
     * @param {Client} client - The client for which to set this dnd status up with
     * @param {User} user - The user this dnd status is for
     * @param [data] {object} - Optional data to use to set up this class instance
     */
    constructor(client, user, data) {
        super(client, data);

        this.user = user;
    }

    setup(data) {
        super.setup(data);

        /**
         * Whether dnd is currently enabled for this user
         * @type {boolean}
         */
        this.dndEnabled = data.dnd_enabled;

        if (this.dndEnabled) {
            this.nextStart = SlackUtil.getDate(data.next_dnd_start_ts);
            this.nextEnd = SlackUtil.getDate(data.next_dnd_end_ts);
        }

        this._snoozeEnabled = data.snooze_enabled;

        if (this._snoozeEnabled) {
            this.snoozeEnd = SlackUtil.getDate(data.snooze_endtime);
            this.snoozeRemaining = data.snooze_remaining;
        }
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

        return now >= this.nextStart.getTime() && now < this.nextEnd.getTime();
    }

    get snoozeEnabled() {
        if (!this._snoozeEnabled) {
            return false;
        }

        return Date.now() < this.snoozeEnd.getTime();
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
     * @param {Array.<User>} [toUpdate] - A list of users to update. If not given, all users are updated.
	 * @returns {Promise.<void>}
	 */
	static async updateMany(client, toUpdate) {
        let all;
	    try {
			await client.self.dnd.update();

			const opts = {};

			if (toUpdate && Array.isArray(toUpdate)) {
			    opts.users = toUpdate.map(u => u.id).join(',');
            }

            all = await client.api.methods.dnd.teamInfo(opts);
        } catch (e) {
	        throw e;
        }

        for (const id of Object.keys(all.users)) {
	        // Self user was updated separately, so ignore it in the full one
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