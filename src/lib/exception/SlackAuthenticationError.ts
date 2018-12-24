export default class SlackAuthenticationError extends Error {
    constructor(extraMessage?: string) {
        super(`Slack authentication error${extraMessage ? ` ${extraMessage}` : ''}`);
    }
}