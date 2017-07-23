const Message = require('./Message');

module.exports = class MessageBuilder {
    constructor() {
        this.text = null;
        this.attachments = [];
        this.channel = null;
    }

    /**
     * Sets the text for the message
     * @param text {string} - The text to set
     * @return {MessageBuilder}
     */
    setText(text) {
        this.text = text;
        return this;
    }

    /**
     * Adds an attachment to the message
     * @param attachment
     * @return {MessageBuilder}
     */
    addAttachment(attachment) {
        this.attachments.push(attachment);
        return this;
    }

    /**
     * Sets the channel for the message
     * @param channel {Channel} - The {Channel} to set
     * @return {MessageBuilder}
     */
    setChannel(channel) {
        this.channel = channel;
        return this;
    }

    /**
     * Builds and returns the {Message}
     * @param client {Client} - The client to build the {Message} with
     * @return {Message}
     */
    build(client) {
        const msg = new Message(client);
        msg.text = this.text;
        msg.channel = this.channel;
        msg.attachments = this.attachments;
        return msg;
    }
};