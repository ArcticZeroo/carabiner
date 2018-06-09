const EventEmitter = require('events');

const Collection = require('enmap');

const SlackAPI = require('../api/SlackAPI');
const { Message, Conversation, User, Team } = require('../structures');
//const ObjectUtil = require('../util/ObjectUtil');
const SlackUtil = require('../util/SlackUtil');
//const MessageSubtype = require('../enum/MessageSubtype');
const DoNotDisturb = require('../structures/user/DoNotDisturb');
// Well that's a long name.
const ApiConversationType = require('../enum/ApiConversationType');
const ConversationEventHandler = require('../events/conversations');
const UserEventHandler = require('../events/users');
const TeamEventHandler = require('../events/team');

class Client extends EventEmitter {
    /**
     * Create a single-team Slack Client.
     * @param token {string} - The slack token to use for all operations.
     * @param {object} [options={}] - Options to use.
     * @param {boolean} [options.rtm=true] - Whether the client should connect to RTM.
     * @param {boolean} [options.separateGroupAndMpim=false] - Whether group and mpim conversations should have a different type.
     * @param {boolean} [options.getUserPresence=false] - Whether user preference should be added to cached data. This will significantly increase startup time if true.
     * @param {boolean} [options.useRtmStart=false] - Whether to use rtm.start for all init info rather than rtm.connect. If this is false, each thing is separately retrieved by the web api
     * @param {boolean} [options.getDndStatus=false] - Whether to get dnd status of all users as they are retrieved
     * @param {boolean} [options.handleMigration=true] - Whether the client should automatically take care of all migration related issues, e.g. the rtm failing to connect during migration and the migration event + disconnection
     */
    constructor(token, options = {}) {
        super();

        /**
         * The api this Client uses.
         * This can and should be used for direct Slack API access.
         * @name Client.api
         * @type {SlackAPI}
         * @readonly
         */
        Object.defineProperty(this, 'api', { value: new SlackAPI(token, options) });

        /**
         * The client's options.
         * Default values are documented in the constructor.
         * @type {object}
         */
        this.options = Object.assign({
            rtm: true,
            useRtmStart: false,
            separateGroupAndMpim: false,
            getUserPresence: false,
            handleMigration: true
        }, options);

        /**
         * A collection of conversations the Client has access to.
         * These are not all public conversations, find by the 'type' property to get groups/ims/etc.
         * @extends {Map}
         * @type {module:enmap.Enmap.<string, Conversation>}
         */
        this.conversations = new Collection();

        /**
         * @namespace
         * A collection of users the Client can see (which should be all of them, but may not if the client is restricted).
         * @extends {Map}
         * @type {module:enmap.Enmap.<string, User>}
         * @property Client.users
         * @property Client.members
         */
        this.users = new Collection();
        this.members = this.users;

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
     * This does not return a value, because once it
     * gets channel info, it also sets it in this.conversations.
     * @returns {Promise.<void>}
     * @private
     */
    async _populateChannelInfo(conversations = []) {
        if (!conversations || !conversations.length) {
            try {
                conversations = await SlackUtil.getPages({
                    method: this.api.methods.conversations.list,
                    getData: r => r.channels,
                    args: {
                        // Get all channel types. It's stupid you have to do this,
                        // what's the point of a unified API if you have to arbitrarily
                        // specify each one and it's not all by default?
                        types: Object.keys(ApiConversationType)
                            .map(k => ApiConversationType[k])
                            .join(',')
                    }
                });
            } catch (e) {
                throw e;
            }
        }

        for (const data of conversations) {
            const conversation = new Conversation(this, data);

            await conversation.retrieveMembers();

            this.conversations.set(conversation.id, conversation);
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

        if (this.options.getDndStatus) {
            // Congrats DND, this method is finally being used for once!
            return DoNotDisturb.updateMany(this, ...Array.from(this.users.values()));
        }

        // Update self's DND status regardless. We always want the self's
        // DND status to be up-to-date, but if the developer doesn't set
        // getDndStatus to be true, we don't care about other users' DND
        return this.self.dnd.update();
    }

    /***
     * Retrieve team info from slack, and then
     * set up this client's team with the returned
     * info.
     * @param team
     * @return {Promise<void>}
     * @private
     */
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

    /**
     * Once RTM has started, listen to all
     * of slack's emitted events and extend them
     * to this client.
     * @private
     */
    _extendRtmEvents() {
        const emitter = this.api.rtm;

        const forward = event => {
            emitter.on(event, (...data) => {
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
         message.conversations
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
         * Emitted when the client is about to lose its RTM connection.
         * @event Client#goodbye
         */
        forward('goodbye');

        const eventHandlers = [
            ConversationEventHandler,
            UserEventHandler,
            TeamEventHandler
        ];

        for (const EventHandler of eventHandlers) {
            // Instantiation causes it to
            // begin listening because we're
            // not setting the option to false...
            new EventHandler(this);
        }
    }

    /**
     * Initialize this client.
     * This method must be called in order to receive
     * the benefits of this client, meaning RTM, event
     * extension, caching, etc.
     * <p>
     * If you do not call it, the client will only
     * be usable for slack API method calls.
     * <p>
     * Anyways, this method does the following:
     * - Retrieves/caches Client.self
     * - Retrieves/caches Client.team
     * - Retrieves/caches all users
     * - Retrieves/caches all conversations
     * - Starts RTM (if you want that)
     * <p>
     * Call this before you try to do anything
     * with the client past basic web calls using
     * client.api! And make sure you wait for the
     * promise to complete.
     * @return {Promise<void>}
     */
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
                // eslint-disable-next-line camelcase
                ({ url, self, team, users, channels, groups, mpims, ims } = await this.api.methods.rtm.start({ no_latest: 1 }));
            }

            // Populate users AND self if id is set (which it is above)
            // do this first so channels are initialized properly
            await this._populateUserInfo(users);

            //noinspection JSUnusedAssignment
            await Promise.all([
                // Populate conversations, potentially with extra data...
                this._populateChannelInfo((channels || []).concat(groups || []).concat(mpims || []).concat(ims || [])),
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
     * Retrieve a conversation with the given
     * ID from the slack API, and return it
     * as a high-level Conversation object.
     * The conversation's members are also
     * populated at this time.
     * This does not load the conversation into
     * the client's map of conversations.
     * @param id
     * @return {Promise<Conversation|*>}
     */
    async retrieveConversation(id) {
        let data;
        try {
            data = await this.api.methods.conversations.info({ channel: id });
        } catch (e) {
            throw e;
        }

        const conversation = new Conversation(this, data);

        try {
            await conversation.retrieveMembers();
        } catch (e) {
            throw e;
        }

        return conversation;
    }

    /**
     * Chats in the specified channel.
     * @param channel {Conversation|User|string} - A {@link Conversation}, {@link User} or string representing the channel to chat in.
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

            if (!args.user) {
                return Promise.reject(new Error('Ephemeral recipient must be specified in args.user'));
            }
        }

        return this.api.chat[`post${method}`](Object.assign({
            text,
            channel: (typeof channel === 'string') ? channel : channel.id,
            // eslint-disable-next-line camelcase
            as_user: true
        }, args));
    }

    /**
     * Destroy this client.
     * This performs the following actions:
     * - Calls SlackRTM#destroy
     * - Removes all listeners on this rtm
     * - Clears all conversations
     * - Clears all users
     * - Nulls the team
     */
    destroy() {
        this.api.rtm.destroy();
        this.api.rtm.removeAllListeners();
        this.conversations.clear();
        this.users.clear();
        this.team = null;
    }
}

module.exports = Client;