import EventHandler from './handler';
import User from '../structures/user/User';
import deepEqual from 'deep-equal';
import Client from '../client/Client';

export default class UserEventHandler extends EventHandler {
    constructor(client: Client, options = {}) {
        super(client, { ...options, name: 'user' });
    }

    listen(): void {
        // Listen to user<> events,
        // then related events which
        // are closely tied to users
        // like dnd events
        this._listenMain();
        this._listenRelated();
    }

    _listenMain(): void {
        /**
         * Emitted when a user's name is changed.
         * @event Client#userNameChange
         * @param {object} data - Event data.
         * @param {string} data.old - The old username.
         * @param {string} data.new - The new username.
         */
        /**
         * Emitted when a user's profile is changed.
         * @event Client#userProfileUpdate
         * @param {object} data - Event data.
         * @param {object} data.old - The old profile.
         * @param {object} data.new - The new profile.
         */
        /**
         * Emitted when a user is changed.
         * @event Client#userUpdate
         * @param {object} data - Event data.
         * @param {string} data.old - The old user.
         * @param {string} data.new - The new user.
         */
        this.setListeners(data => {
            // TODO: 2fa, admin, owner change detection
            const oldUser = this.client.users.get(data.user.id);
            const newUser = new User(this.client, data.user);

            this.client.users.set(data.user.id, newUser);

            if (oldUser.name !== newUser.name) {
                this.emit('nameChange', {
                    old: oldUser.name,
                    new: newUser.name
                });
            }

            if (!deepEqual(oldUser.profile, newUser.profile)) {
                this.emit('profileUpdate', {
                    old: oldUser.profile,
                    new: newUser.profile
                });
            }

            this.emit('update', {
                old: oldUser,
                new: newUser
            });

            // User was just deactivated
            if (!oldUser.isDeleted && newUser.isDeleted) {
                /**
                 * Emitted when a user is deactivated
                 * @event Client#userDeactivated
                 * @param {User} user - The user deactivated
                 */
                this.emit('deactivated', newUser);
                // Was just activated from being deactivated
            } else if (oldUser.isDeleted && !newUser.isDeleted) {
                /**
                 * Emitted when a user is activated, after
                 * being deactivated prior
                 * @event Client#userActivated
                 * @param {User} user - The user activated
                 */
                this.emit('activated', newUser);
            }
        }, 'user_change');

        /**
         * Emitted when a user starts typing.
         * @event Client#userTyping
         * @param {object} data - Event data.
         * @param {string} data.channel - The channel in which the user is typing.
         * @param {string} data.user - The user that is typing.
         */
        this.setListeners(data => {
            const channel = this.client.conversations.get(data.channel);
            const user = this.client.users.get(data.user);

            this.emit('typing', { channel, user });
        }, 'user_typing');
    }

    _listenRelated(): void {
        /**
         * Emitted when a user's DND status is updated.
         * @event Client#dndUpdated
         * @param {DoNotDisturb} dnd - The user's DND status (contains a reference to the user)
         */
        /**
         * Emitted when the client's own DND status is updated
         * @event Client#dndUpdatedSelf
         * @param {DoNotDisturb} dnd - The user's DND status (contains a reference to the user)
         */
        this.setListeners(({ dnd_status: dndStatus }) => {
            this.client.self.dnd.setup(dndStatus);
            this.client.emit('dndUpdatedSelf', this.client.self.dnd);
            this.client.emit('dndUpdated', this.client.self.dnd);
        }, 'dnd_updated');

        this.setListeners(({ user: id, dnd_status: dndStatus }) => {
            const user = this.client.users.get(id);

            user.dnd.setup(dndStatus);
            this.client.emit('dndUpdated', user.dnd);
        }, 'dnd_updated_user');
    }
}