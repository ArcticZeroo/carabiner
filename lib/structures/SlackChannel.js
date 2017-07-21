const SlackDate = require('../util/SlackDate');
const ChannelType = require('../enum/SlackChannelType');
const SlackChannelDescriptor = require('./SlackChannelDescriptor');
//TODO: Solve circular dependency
const SlackMessage = require('./SlackMessage');

class SlackChannel {
    constructor(api, data) {
        this.api = api;

        if (data) {
            this.setup(data);
        }
    }

    setup(data) {
        this.id = data.id;
        this.name = data.name;
        //TODO: Fix this
        this.creator = api.cache.users[data.creator];
        this.created = SlackDate(data.created);
        //TODO: Also this
        this.members = data.members.map((m)=> api.cache.users[m]);
        //TODO: Also these
        this.topic = new SlackChannelDescriptor(data, api);
        this.purpose = new SlackChannelDescriptor(data, api);
        this.isMember = data.is_member;
        this.lastRead = SlackDate(data.last_read);
        this.latest = new SlackMessage(data.latest);
        this.unreadCount = data.unread_count;
        this.unreadCountDisplay = data.unread_count_display;
        this.isArchived = data.is_archived;
        this.isDefault = this.isGeneral = data.is_general;
        this.isChannel = data.is_channel;
        this.isMpim = data.is_mpim;
        this.isGroup = data.is_group;
        this.isIM = data.is_im;
    }

    send(text, args) {
        this.api.chat(this.id, text, args);
    }

    getChannelType() {
        if(this.isChannel) {
            return ChannelType.CHANNEL;
        }

        if(this.isGroup) {
            return ChannelType.GROUP;
        }

        if(this.isIM) {
            return ChannelType.IM;
        }

        if(this.isMpim) {
            return ChannelType.MPIM;
        }

        return ChannelType.UNKNOWN;
    }
}