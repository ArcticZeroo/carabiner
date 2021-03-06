export default class StringUtil {
    /**
     * String utilities.
     */
    private constructor() {}

    /**
     * It... capitalizes a string. Anything that's not the first character becomes lowercase.
     * @param str {string} - The string to capitalize.
     * @return {string}
     */
    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static appendIfExists(original: string, additional: string | null, formatter?: (s: string) => string) {
        if (!additional) {
            return original;
        }

        if (formatter) {
            return original + formatter(additional);
        }

        return original + additional;
    }
}