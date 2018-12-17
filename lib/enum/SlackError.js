"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum {string}
 * @type {{NOT_AUTHED: string, INVALID_AUTH: string, ALREADY_INVITED: string, ALREADY_IN_TEAM: string, CHANNEL_NOT_FOUND: string, SENT_RECENTLY: string, USER_DISABLED: string, MISSING_SCOPE: string, INVALID_EMAIL: string, NOT_ALLOWED: string, NOT_ALLOWED_TOKEN_TYPE: string}}
 */
var SlackError;
(function (SlackError) {
    SlackError["NOT_AUTHED"] = "not_authed";
    SlackError["INVALID_AUTH"] = "invalid_auth";
    SlackError["ALREADY_INVITED"] = "already_invited";
    SlackError["ALREADY_IN_TEAM"] = "already_in_team";
    SlackError["CHANNEL_NOT_FOUND"] = "channel_not_found";
    SlackError["SENT_RECENTLY"] = "sent_recently";
    SlackError["USER_DISABLED"] = "user_disabled";
    SlackError["MISSING_SCOPE"] = "missing_scope";
    SlackError["INVALID_EMAIL"] = "invalid_email";
    SlackError["NOT_ALLOWED"] = "not_allowed";
    SlackError["NOT_ALLOWED_TOKEN_TYPE"] = "not_allowed_token_type";
    SlackError["MIGRATION_IN_PROGRESS"] = "migration_in_progress";
})(SlackError || (SlackError = {}));
exports.default = SlackError;
//# sourceMappingURL=SlackError.js.map