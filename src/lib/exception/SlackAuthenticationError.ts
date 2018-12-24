import ExtraOptionalException from './ExtraOptionalException';

export default class SlackAuthenticationError extends ExtraOptionalException {
    constructor(extra?: string) {
        super('Slack Authentication Error', extra);
    }
}