const Message = require('./Message');

class MessageBuilder {
    /**
     * This class allows you to build a {@link Message} easily.
     * @param client {Client} - The client to build the {@link Message} with.
     * @constructor
     */
    constructor(client) {
        this.client = client;

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
     * @param channel {Conversation} - The {@link Conversation} to set
     * @return {MessageBuilder}
     */
    setChannel(channel) {
        this.channel = channel;
        return this;
    }

    /**
     * Alias for {@link setChannel}
     * @param conversation
     * @returns {MessageBuilder}
     */
    setConversation(conversation) {
        return this.setChannel(conversation);
    }

    /**
     * Builds and returns the {@link Message} being created.
     * @return {Message}
     */
    build() {
        const msg = new Message(this.client);
        msg.text = this.text || '';
        msg.channel = this.channel;
        msg.attachments = this.attachments;
        return msg;
    }
}

module.exports = MessageBuilder;