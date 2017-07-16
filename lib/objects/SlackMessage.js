const SlackUser = require('./SlackUser');

class SlackMessage{
    constructor(msg, api) {
        Object.assign(this, msg);

        // Get user data...
        // This NEEDS to be sync since the constructor
        // must return an instance of the class synchronously.
        this.user = new SlackUser(api.cache.users[this.user]);
        this.api = api;
    }

    reply(msg, mention = true, args = {}) {
        return this.api.chat(this.channel, (mention)?`${this.user.mention()} ${msg}`:msg, args);
    }

    edit(text, args = {}) {
        return this.api.methods.chat.update(Object.assign({ channel: this.channel, ts: this.ts, text }, args));
    }

    delete() {
        return this.api.methods.chat.delete({ channel: this.channel, ts: this.ts });
    }

    remove() {
        return this.delete();
    }
}

module.exports = SlackMessage;