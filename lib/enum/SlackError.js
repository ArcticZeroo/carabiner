/**
 * @enum {string}
 * @type {{NOT_AUTHED: string, INVALID_AUTH: string, ALREADY_INVITED: string, ALREADY_IN_TEAM: string, CHANNEL_NOT_FOUND: string, SENT_RECENTLY: string, USER_DISABLED: string, MISSING_SCOPE: string, INVALID_EMAIL: string, NOT_ALLOWED: string, NOT_ALLOWED_TOKEN_TYPE: string}}
 */
module.exports = {
    NOT_AUTHED: 'not_authed',
    INVALID_AUTH: 'invalid_auth',
    ALREADY_INVITED: 'already_invited',
    ALREADY_IN_TEAM: 'already_in_team',
    CHANNEL_NOT_FOUND: 'channel_not_found',
    SENT_RECENTLY: 'sent_recently',
    USER_DISABLED: 'user_disabled',
    MISSING_SCOPE: 'missing_scope',
    INVALID_EMAIL: 'invalid_email',
    NOT_ALLOWED: 'not_allowed',
    NOT_ALLOWED_TOKEN_TYPE: 'not_allowed_token_type',
    MIGRATION_IN_PROGRESS: 'migration_in_progress'
};