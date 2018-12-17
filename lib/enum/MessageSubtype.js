"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum {string}
 * @type {{NONE: null, BOT_MESSAGE: string, CHANNEL_ARCHIVE: string, CHANNEL_JOIN: string, CHANNEL_LEAVE: string, CHANNEL_NAME: string, CHANNEL_PURPOSE: string, CHANNEL_TOPIC: string, CHANNEL_UNARCHIVE: string, FILE_COMMENT: string, FILE_MENTION: string, FILE_SHARE: string, GROUP_ARCHIVE: string, GROUP_JOIN: string, GROUP_LEAVE: string, GROUP_NAME: string, GROUP_PURPOSE: string, GROUP_TOPIC: string, GROUP_UNARCHIVE: string, ME_MESSAGE: string, MESSAGE_CHANGED: string, MESSAGE_DELETED: string, MESSAGE_REPLIED: string, PINNED_ITEM: string, REPLY_BROADCAST: string, THREAD_BROADCAST: string, UNPINNED_ITEM: string}}
 */
var MessageSubtype;
(function (MessageSubtype) {
    MessageSubtype["NONE"] = "none";
    MessageSubtype["BOT_MESSAGE"] = "bot_message";
    MessageSubtype["CHANNEL_ARCHIVE"] = "channel_archive";
    MessageSubtype["CHANNEL_JOIN"] = "channel_join";
    MessageSubtype["CHANNEL_LEAVE"] = "channel_leave";
    MessageSubtype["CHANNEL_NAME"] = "channel_name";
    MessageSubtype["CHANNEL_PURPOSE"] = "channel_purpose";
    MessageSubtype["CHANNEL_TOPIC"] = "channel_topic";
    MessageSubtype["CHANNEL_UNARCHIVE"] = "channel_unarchive";
    MessageSubtype["FILE_COMMENT"] = "file_comment";
    MessageSubtype["FILE_MENTION"] = "file_mention";
    MessageSubtype["FILE_SHARE"] = "file_share";
    MessageSubtype["GROUP_ARCHIVE"] = "group_archive";
    MessageSubtype["GROUP_JOIN"] = "group_join";
    MessageSubtype["GROUP_LEAVE"] = "group_leave";
    MessageSubtype["GROUP_NAME"] = "group_name";
    MessageSubtype["GROUP_PURPOSE"] = "group_purpose";
    MessageSubtype["GROUP_TOPIC"] = "group_topic";
    MessageSubtype["GROUP_UNARCHIVE"] = "group_unarchive";
    MessageSubtype["ME_MESSAGE"] = "me_message";
    MessageSubtype["MESSAGE_CHANGED"] = "message_changed";
    MessageSubtype["MESSAGE_DELETED"] = "message_deleted";
    MessageSubtype["MESSAGE_REPLIED"] = "message_replied";
    MessageSubtype["PINNED_ITEM"] = "pinned_item";
    MessageSubtype["REPLY_BROADCAST"] = "reply_broadcast";
    MessageSubtype["THREAD_BROADCAST"] = "thread_broadcast";
    MessageSubtype["UNPINNED_ITEM"] = "unpinned_item";
})(MessageSubtype || (MessageSubtype = {}));
exports.default = MessageSubtype;
//# sourceMappingURL=MessageSubtype.js.map