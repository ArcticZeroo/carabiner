const SlackAPI = require('../api/SlackAPI');
const EventEmitter = require('events');
const Collection = require('djs-collection');
const Channel = require('../structures/Channel');
const IMChannel = require('../structures/IMChannel');
const User = require('../structures/User');
const Team = require('../structures/Team');
const ObjectUtil = require('../util/ObjectUtil');

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
        if (!chats || ObjectUtil.hasNullValue(chats)) {
            const getChannels = ()=>{
                if (!this.options.getFullChannelInfo) {
                    return this.api.methods.channels.list();
                }

                // Exclude members to speed up the first call. Not needed before we get info for all.
                return this.api.methods.channels.list({
                    exclude_members: true
                }).then((res)=>{
                    const promises = [];

                    for (const channel of res.channels) {
                        promises.push(this.api.methods.channels.info({
                            channel: channel.id
                        }));
                    }

                    return Promise.all(promises).then((responses)=>{
                        return {
                            channels: responses.map(r => r.channel)
                        }
                    });
                });
            };

            try {
                const lists = await Promise.all([
                    // This is necessary because only channels
                    // returns restricted channel objects if you
                    // don't use channels.info to retrieve the data.
                    getChannels(),
                    this.api.methods.groups.list(),
                    this.api.methods.mpim.list(),
                    this.api.methods.im.list()
                ]);

                chats = {
                    channels: lists[0].channels,
                    groups: lists[1].groups,
                    mpims: lists[2].groups,
                    ims: lists[3].ims
                };
            } catch (e) {
                throw e;
            }
        }

        chats.channels.forEach((channel)=>{
            const slackChannel = new Channel(this, channel);
            slackChannel.isChannel = true;

            this.channels.set(slackChannel.id, slackChannel);
        });

        if (this.options.separateGroupAndMpim) {
            chats.groups.forEach((group)=>{
                const slackGroup = new Channel(this, group);
                slackGroup.isChannel = false;
                slackGroup.isGroup = true;
                slackGroup.isMpim = false;

                this.channels.set(slackGroup.id, slackGroup);
            });

            chats.mpims.forEach((mpim)=>{
                const slackMpim = new Channel(this, mpim);
                slackMpim.isChannel = false;
                slackMpim.isGroup = false;
                slackMpim.isMpim = true;

                this.channels.set(slackMpim.id, slackMpim);
            });
        } else {
            chats.groups.concat(chats.mpims).forEach((group)=>{
                const slackGroup = new Channel(this, group);
                slackGroup.isGroup = true;
                slackGroup.isChannel = false;
                // I'll leave isMpim in case someone really wants it.

                this.channels.set(slackGroup.id, slackGroup);
            });
        }

        chats.ims.forEach((im)=>{
            const slackIM = new IMChannel(this, im);

            this.channels.set(slackIM.id, slackIM);
        });
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

        users.forEach((data)=>{
            const user = new User(this, data);

            this.users.set(user.id, user);
        });

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
                this._populateChannelInfo({channels, groups, mpims, ims}),
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
     * @return {Promise}
     */
    chat(channel, text, args = {}) {
        return this.api.chat.postMessage(Object.assign({
            channel: (typeof channel === 'string') ? channel : channel.id,
            text,
            as_user: true
        }, args))
    }
}

module.exports = Client;