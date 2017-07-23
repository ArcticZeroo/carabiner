const SlackUtil = require('../util/SlackUtil');

class User{
    constructor(client, data){
        this.client = client;

        if (data) {
            this.setup(data);
        }
    }

    setup(data) {
        Object.assign(this, SlackUtil.convertProperties(data));

        this.isDeleted = this.isDisabled = this.deleted;

    }

    send(msg, args = {}) {
        this.client.chat(this, msg, args);
    }

    get isFullUser() {
        return !(this.isRestricted || this.isUltraRestricted);
    }

    get mention() {
        return User.getMention(this.id);
    }

    static getMention(id){
        return `<@${id}>`;
    }
}

module.exports = User;