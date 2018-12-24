import StringUtil from '../util/StringUtil';

export default class ExtraOptionalException extends Error {
    constructor(base: string, extra: string | null) {
        super(StringUtil.appendIfExists(base, extra, () => ` - ${extra}`));
    }
}