const ConversationType = require('./ConversationType');

/**
 * This is the conversation type used by calls
 * to the conversation API, more specifically
 * the conversations.list method, which for
 * some reason does not get all conversation
 * types by default.
 * @enum {string}
 * @type {object}
 */
module.exports = {
    [ConversationType.CHANNEL]: 'public_channel',
    [ConversationType.GROUP]: 'private_channel',
    [ConversationType.MPIM]: 'mpim',
    [ConversationType.IM]: 'im'
};