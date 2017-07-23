const SlackAPI = require('../api/SlackAPI');
const EventEmitter = require('events');
const Collection = require('djs-collection');
const Channel = require('../structures/Channel');
const IMChannel = require('../structures/IMChannel');
const User = require('../structures/User');

module.exports = class Client extends EventEmitter {
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
         * By default, rtm is true and getFullChannelInfo is false.
         * @type {object}
         */
        this.options = Object.assign({
            rtm: true,
            getFullChannelInfo: false,
            separateGroupAndMpim: false,
            getUserPresence: false
        }, opts);

        /**
         * A collection of channels the Client has access to.
         * These are not all public channels, find by the 'type' property to get groups/ims/etc.
         * @type {Collection}
         */
        this.channels = new Collection();

        /**
         * A collection of users the Client can see (which should be all of them, but may not if the client is restricted).
         * @type {Collection}
         */
        this.users = new Collection();

        this.team = null;
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
    async _getChannelInfo() {
        let chats;

        const getChannels = ()=>{
            if (!this.options.getFullChannelInfo) {
                return this.api.methods.channels.list();
            }

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

        for (const channel of chats.channels) {
            const slackChannel = new Channel(this, channel);
            slackChannel.isChannel = true;
            this.channels.set(slackChannel.id, slackChannel);
        }

        if (this.options.separateGroupAndMpim) {
            for (const group of chats.groups) {
                const slackGroup = new Channel(this, group);
                slackGroup.isChannel = false;
                slackGroup.isGroup = true;
                slackGroup.isMpim = false;
                this.channels.set(slackGroup.id, slackGroup);
            }

            for (const mpim of chats.mpims) {
                const slackMpim = new Channel(this, mpim);
                slackMpim.isChannel = false;
                slackMpim.isGroup = false;
                slackMpim.isMpim = true;
                this.channels.set(slackMpim.id, slackMpim);
            }
        } else {
            for (const group of chats.groups.concat(chats.mpims)) {
                const slackGroup = new Channel(this, group);
                slackGroup.isGroup = true;
                slackGroup.isChannel = false;
                // I'll leave isMpim in case someone really wants it.
                this.channels.set(slackGroup.id, slackGroup);
            }
        }

        for (const im of chats.ims) {
            const slackIM = new IMChannel(this, im);
            this.channels.set(slackIM.id, slackIM);
        }
    }

    /**
     * Gets user information and saves it to {Client#users}
     * If this.options.getUserPresence is true, this will take longer to complete.
     * @return {Promise.<void>}
     * @private
     */
    async _getUserInfo() {
        let userList;

        try {
            userList = await this.api.methods.users.list({
                presence: this.options.getUserPresence
            });
        } catch (e) {
            throw e;
        }

        userList.members.forEach((data)=>{
            const user = new User(this, data);

            this.users.set(user.id, user);
        });
    }

    async _getTeamInfo() {
        let response;
    }

    async init() {
        try {
            await Promise.all([
                this._getChannelInfo(),
                this._getUserInfo()
            ]);
        } catch (e) {
            throw e;
        }

        if (this.options.rtm) {

        }
    }

    /**
     * Chats in the specified channel.
     * @param channel {Channel|string} - A {Channel} or string representing the channel to chat in.
     * @param text {string} - The text to send in the channel.
     * @param args {object} [{}] - Additional args to send.
     * @return {Promise}
     */
    chat(channel, text, args = {}) {
        return this.api.chat.postMessage(Object.assign({
            channel: (typeof channel === 'string') ? channel : channel.id,
            text,
            as_user: true
        }, args))
    }
};