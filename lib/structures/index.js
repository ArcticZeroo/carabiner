const Attachment = require('./message/attachment/Attachment');
const Channel = require('./conversation/Conversation');
const ConversationDescriptor = require('./conversation/ConversationDescriptor');
const CommandMessage = require('./message/CommandMessage');
const Field = require('./message/attachment/Field');
const IMChannel = require('./conversation/IMChannel');
const Message = require('./message/Message');
const MessageBuilder = require('./message/MessageBuilder');
const Team = require('./Team');
const User = require('./user/User');

module.exports = {
    Attachment,
    Conversation: Channel,
    ConversationDescriptor,
    CommandMessage,
    Field,
    IMChannel,
    Message,
    MessageBuilder,
    Team,
    User
};
