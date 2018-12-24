import ExtraOptionalException from './ExtraOptionalException';

export default class InvalidStateException extends ExtraOptionalException {
    constructor(extra?: string) {
        super('Invalid State', extra);
    }
}