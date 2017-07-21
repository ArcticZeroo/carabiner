class SlackUser{
    constructor(data = {}, api){
        this.api = api;
        Object.assign(this, data);
    }

    send(msg, args = {}) {
        return this.api.methods.chat.postMessage(Object.assign(args, {
            channel: this.id,
            text: msg
        }));
    }

    mention() {
        return SlackUser.getMention(this.id);
    }

    static getMention(id){
        return `<@${id}>`;
    }
}

module.exports = SlackUser;