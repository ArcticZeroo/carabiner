const Message = require('./Message');

class MessageBuilder {
    /**
     * This class allows you to build a {@link Message} easily.
     * @constructor
     */
    constructor() {
        /**
         *
         * @type {null}
         */
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
     * Sets the destination channel for the message
     * @param channel {Channel} - The {@link Channel} to set
     * @return {MessageBuilder}
     */
    setChannel(channel) {
        this.channel = channel;
        return this;
    }

    /**
     * Builds and returns the {@link Message} being created.
     * @param client {Client} - The client to build the {@link Message} with.
     * @return {Message}
     */
    build(client) {
        const msg = new Message(client);
        msg.text = this.text;
        msg.channel = this.channel;
        msg.attachments = this.attachments;
        return msg;
    }
}

module.exports = MessageBuilder;