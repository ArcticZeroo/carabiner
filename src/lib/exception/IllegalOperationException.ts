import ExtraOptionalException from './ExtraOptionalException';

export default class IllegalOperationException extends ExtraOptionalException {
    constructor(extra?: string) {
        super('Illegal operation', extra);
    }

}