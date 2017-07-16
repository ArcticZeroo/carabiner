const SlackDate = require('../util/SlackDate');

class SlackChannelDescriptor {
    constructor(data, api) {
        this.data = data;
        this.value = data.value;
        this.creator = api.cache.users[data.creator];
        this.set = SlackDate(data.last_set);
    }
}

module.exports = SlackChannelDescriptor;