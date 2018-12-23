import Client from '../../client/Client';
import Conversation from '../conversation/Conversation';
import Message from './Message';

class MessageBuilder {
    readonly client: Client;
    text: string;
    attachments: Attachment[];
    conversation: Conversation;

    /**
     * This class allows you to build a {@link Message} easily.
     * @param client {Client} - The client to build the {@link Message} with.
     * @constructor
     */
    constructor(client?: Client) {
        this.client = client;

        this.text = null;
        this.attachments = [];
        this.conversation = null;
    }

    /**
     * Sets the text for the message
     * @param text {string} - The text to set
     * @return {MessageBuilder}
     */
    setText(text: string): this {
        this.text = text;
        return this;
    }

    /**
     * Adds an attachment to the message
     * @param attachment
     * @return {MessageBuilder}
     */
    addAttachment(attachment: Attachment): this {
        this.attachments.push(attachment);
        return this;
    }

    /**
     * Sets the destination channel for the message
     * @param conversation {Conversation} - The {@link Conversation} to set
     * @return {MessageBuilder}
     */
    setChannel(conversation: Conversation): this {
        this.conversation = conversation;
        return this;
    }

    setConversation(conversation) {
        return this.setChannel(conversation);
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
        const nessage = new Message(this.client);
        nessage.text = this.text || '';
        nessage.conversation = this.conversation;
        nessage.attachments = this.attachments;
        return nessage;
    }
}

module.exports = MessageBuilder;