const EventEmitter = require('events');

const Collection = require('djs-collection');
const deepEqual = require('deep-equal');

const SlackAPI = require('../api/SlackAPI');
const { Message, Channel, IMChannel, User, Team } = require('../structures');
const ObjectUtil = require('../util/ObjectUtil');
const SlackUtil = require('../util/SlackUtil');

class Client extends EventEmitter {
    /**
     * Create a single-team Slack Client.
     * @param token {string} - The slack token to use for all operations.
     * @param {object} [opts={}] - Options to use.
     * @param {boolean} [opts.rtm=true] - Whether the client should connect to RTM.
     * @param {boolean} [opts.getFullChannelInfo=false] - Whether the client should retrieve ALL info about channels. This will significantly increase startup time if true, and could hit rate limit.
     * @param {boolean} [opts.separateGroupAndMpim=false] - Whether group and mpim channels should have a different type.
     * @param {boolean} [opts.getUserPresence=false] - Whether user preference should be added to cached data. This will significantly increase startup time if true.
     * @param {boolean} [opts.useRtmStart=false] - Whether to use rtm.start for all init info rather than rtm.connect. If this is false, each thing is separately retrieved by the web api
     */
    constructor(token, opts = {}) {
        super();

        /**
         * The api this Client uses.
         * This can and should be used for direct Slack API access.
         * @name Client#api
         * @type {SlackAPI}
         * @readonly
         */
        Object.defineProperty(this, 'api', {value: new SlackAPI(token)});

        /**
         * The client's options.
         * Default values are documented in the constructor.
         * @type {object}
         */
        this.options = Object.assign({
            rtm: true,
            useRtmStart: false,
            getFullChannelInfo: false,
            separateGroupAndMpim: false,
            getUserPresence: false
        }, opts);

        /**
         * A collection of channels the Client has access to.
         * These are not all public channels, find by the 'type' property to get groups/ims/etc.
         * @type {Collection.<number, Channel>}
         */
        this.channels = new Collection();

        /**
         * A collection of users the Client can see (which should be all of them, but may not if the client is restricted).
         * @type {Collection.<number, User>}
         */
        this.users = new Collection();

        /**
         * The team this client is currently in.
         * @type {Team}
         */
        this.team = new Team(this);

        /**
         * The user that this client is running as.
         * @type {User}
         */
        this.self = new User(this);
    }

    /**
     * Gets channel info from the slack API.
     * If options.getFullChannelInfo is true,
     * the API will ping slack for EVERY SINGLE CHANNEL,
     * to get its full info. Be careful.
     *
     * This does not return a value, because once it
     * gets channel info, it also sets it in this.channels.
     * @returns {Promise.<void>}
     * @private
     */
    async _populateChannelInfo(chats) {
        if (!chats || !chats.length) {
            try {
                chats = await SlackUtil.getPages({ method: this.api.methods.conversations.list, getData: (r) => r.channels });
            } catch (e) {
                throw e;
            }
        }

        for (const data of chats) {
            const channel = new Channel(this, data);

            this.channels.set(channel.id, channel);
        }
    }

    /**
     * Gets user information and saves it to {Client#users}
     * If this.options.getUserPresence is true, this will take longer to complete.
     * @return {Promise.<void>}
     * @private
     */
    async _populateUserInfo(users) {
        if (!users) {
            try {
                users = (await this.api.methods.users.list({ presence: this.options.getUserPresence })).members;
            } catch (e) {
                throw e;
            }
        }

        for (const data of users) {
            const user = new User(this, data);

            this.users.set(user.id, user);
        }

        // this.self.id must be set, done automatically in Client#init.
        this.self = this.users.get(this.self.id);
    }

    async _populateTeamInfo(team) {
        if (!team) {
            try {
                team = (await this.api.methods.team.info()).team;
            } catch (e) {
                throw e;
            }
        }

        // We already made an instance, so just set it up now.
        this.team.setup(team);
    }

    _extendApiEvents() {
        const emitter = this.api.rtm;

        const forward = (event)=>{
            emitter.on(event, (...data)=>{
                this.emit(event, ...data);
            });
        };

        /*
         accounts_changed
         bot_added
         bot_changed
         channel_archive
         channel_created
         channel_deleted
         channel_history_changed
         channel_joined
         channel_left
         channel_marked
         channel_rename
         channel_unarchive
         commands_changed
         dnd_updated
         dnd_updated_user
         email_domain_changed
         emoji_changed
         file_change
         file_comment_added
         file_comment_deleted
         file_comment_edited
         file_created
         file_deleted
         file_public
         file_shared
         file_unshared
         goodbye
         group_archive
         group_close
         group_history_changed
         group_joined
         group_left
         group_marked
         group_open
         group_rename
         group_unarchive
         im_close
         im_created
         im_history_changed
         im_marked
         im_open
         manual_presence_change
         - MANUAL START -
         message.channels
         message.groups
         message.im
         message.mpim
         - MANUAL END -
         pin_added
         pin_removed
         pref_change
         presence_change
         presence_sub
         reaction_added
         reaction_removed
         reconnect_url
         star_added
         star_removed
         subteam_created
         subteam_members_changed
         subteam_self_added
         subteam_self_removed
         subteam_updated
         team_domain_change
         team_join
         team_migration_started
         team_plan_change
         team_pref_change
         team_profile_change
         team_profile_delete
         team_profile_reorder
         team_rename
         */

        /**
         * Emitted when the client connects successfully to slack's RTM
         * @event Client#hello
         */
        forward('hello');

        /**
         * Emitted when a channel is created.
         * @event Client#channelCreated
         */
        emitter.on('channel_created', (data) => {
            const {id} = data;

            //TODO: Finish this once I finish conversation support
        });

        /**
         * Emitted when a user joins a slack channel.
         * @event Client#channelMemberJoin
         * @param {object} data - Event data.
         * @param {Channel} data.channel - The channel the member joined.
         * @param {User} data.user - The user that joined the channel.
         * @param {User|null} data.inviter - The user that invited the joining member, if applicable.
         */
        emitter.on('member_joined_channel', (data) => {
            const channel = this.channels.get(data.channel);

            const user = this.users.get(data.user);

            channel.users.set(user.id, user);

            const inviter = (data.inviter) ? this.users.get(data.inviter) : null;

            this.emit('channelMemberJoin', {channel, user, inviter});
        });

        /**
         * Emitted when a user leaves a slack channel.
         * @event Client#channelMemberLeave
         * @param {object} data - Event data.
         * @param {Channel} data.channel - The channel the member joined.
         * @param {User} data.user - The user that joined the channel.
         */
        emitter.on('member_left_channel', (data) => {
            const channel = this.channels.get(data.channel);

            const user = this.users.get(data.user);

            channel.users.delete(user.id);

            this.emit('channelMemberLeave', {channel, user});
        });

        /**
         * Emitted when a message is sent in a slack channel.
         * @event Client#message
         * @param {Message} message - The message that was sent.
         */
        emitter.on('message', (data) => {
            const message = new Message(this, data);

            this.emit('message', message);
            this.emit(`message.${message.channel.type}`, message);
        });

        /**
         * Emitted when a member joins a slack team
         * @event Client#teamMemberJoin
         * @param {User} user - The user that joined the team.
         */
        emitter.on('team_join', (data) => {
            const user = new User(this, data.user) ;

            this.users.set(user.id, user);

            this.emit('teamMemberJoin', user);
        });

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
        emitter.on('user_change', (data) => {
            const oldUser = this.users.get(data.user.id);
            const newUser = new User(this, data.user);

            this.users.set(data.user.id, newUser);

            if (oldUser.name !== newUser.name) {
                this.emit('userNameChange', {
                    old: oldUser.name,
                    new: newUser.name
                });
            }

            if (!deepEqual(oldUser.profile, newUser.profile)) {
                this.emit('userProfileUpdate', {
                    old: oldUser.profile,
                    new: newUser.profile
                });
            }

            this.emit('userUpdate', {
                old: oldUser,
                new: newUser
            });
        });

        /**
         * Emitted when a user starts typing.
         * @event Client#userTyping
         * @param {object} data - Event data.
         * @param {string} data.channel - The channel in which the user is typing.
         * @param {string} data.user - The user that is typing.
         */
        emitter.on('user_typing', (data) => {
            const channel = this.channels.get(data.channel);
            const user = this.users.get(data.user);

            this.emit('userTyping', { channel, user })
        });
    }

    async init() {
        try {
            this.self.id = (await this.api.methods.auth.test()).user_id;
        } catch (e) {
            throw new Error(`Slack authentication error: ${e}`);
        }

        let url;

        try {
            let self, team, users, channels, groups, mpims, ims;

            if (this.options.useRtmStart) {
                ({ url, self, team, users, channels, groups, mpims, ims } = await this.api.methods.rtm.start({ no_latest: 1 }));
            }

            //noinspection JSUnusedAssignment
            await Promise.all([
                // Populate channels, potentially with extra data...
                this._populateChannelInfo(channels.concat(groups).concat(mpims).concat(ims)),
                // Populate users AND self if id is set (which it is above)
                this._populateUserInfo(users),
                // Populate the team itself.
                this._populateTeamInfo(team)
            ]);

            // If they used rtm.start, self is available, and we can set prefs.
            if (self) {
                this.self.setup(self);
            }
        } catch (e) {
            throw e;
        }

        if (!this.options.rtm) {
            return;
        }

        return this.api.rtm.connect(url);
    }

    /**
     * Chats in the specified channel.
     * @param channel {Channel|User|string} - A {@link Channel}, {@link User} or string representing the channel to chat in.
     * @param text {string} - The text to send in the channel.
     * @param {object} [args={}] - Additional args to send.
     * @param {*} [args.postEphemeral] - If this is truthy, the message will be sent ephemerally
     * @param {*} [args.ephemeral] - If this is truthy, the message will be sent ephemerally
     * @param {*} [args.invisible] - If this is truthy, the message will be sent ephemerally
     * @return {Promise}
     */
    chat(channel, text, args = {}) {
        let method = 'Message';

        if (args.postEphemeral || args.ephemeral || args.invisible) {
            method = 'Ephemeral';
        }

        return this.api.chat[`post${method}`](Object.assign({
            channel: (typeof channel === 'string') ? channel : channel.id,
            text,
            as_user: true
        }, args));
    }
}

module.exports = Client;