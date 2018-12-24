import ExtraOptionalException from './ExtraOptionalException';

export default class SlackAuthenticationException extends ExtraOptionalException {
    constructor(extra?: string) {
        super('Slack Authentication Error', extra);
    }
}