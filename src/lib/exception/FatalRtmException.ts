import ExtraOptionalException from './ExtraOptionalException';

export default class FatalRtmException extends ExtraOptionalException {
    constructor(extra?: string) {
        super('Fatal RTM exception', extra);
    }
}