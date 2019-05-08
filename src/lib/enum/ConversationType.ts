/**
 * @enum {string}
 * @type {{GROUP: string, CHANNEL: string, IM: string, MPIM: string, UNKNOWN: string}}
 */
enum ConversationType {
    GROUP = 'group',
    CHANNEL = 'channel',
    IM = 'im',
    MPIM = 'mpim',
    UNKNOWN = 'unknown'
}

export default ConversationType;