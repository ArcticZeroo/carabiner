"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConversationType_1 = __importDefault(require("./ConversationType"));
/**
 * This is the conversation type used by calls
 * to the conversation API, more specifically
 * the conversations.list method, which for
 * some reason does not get all conversation
 * types by default.
 * @enum {string}
 * @type {object}
 */
exports.default = {
    [ConversationType_1.default.CHANNEL]: 'public_channel',
    [ConversationType_1.default.GROUP]: 'private_channel',
    [ConversationType_1.default.MPIM]: 'mpim',
    [ConversationType_1.default.IM]: 'im'
};
//# sourceMappingURL=ApiConversationType.js.map