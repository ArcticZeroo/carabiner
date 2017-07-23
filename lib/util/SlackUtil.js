module.exports = class SlackUtil {
    /**
     * Returns a {Date} converted from slack time (epoch / 1000)
     * @param slackTimestamp {number} - A unix epoch divided by 1000.
     * @returns {Date}
     */
    static getDate(slackTimestamp) {
        return new Date(slackTimestamp*1000);
    }

    /**
     * Converts slack properties into camelCase JS ones using a cloned object.
     * @example
     * // Returns {helloWorld: 'hi'}
     * SlackUtil.convertProperties({
     *  hello_world: 'hi!'
     * });
     * @param obj {object} - The object to convert.
     * @param deep {boolean} [false] - Whether the conversion should be deep, i.e. if it should enter further objects to convert their properties.
     * @returns {object}
     */
    static convertProperties(obj, deep = true) {
        let newObj = {};

        for (const prop of Object.keys(obj)) {
            const bits = prop.split('_');

            if (bits.length === 0) {
                newObj[prop] = obj[prop];
                continue;
            }

            for (let i = 1; i < bits.length; i++) {
                const bit = bits[i];

                bits[i] = bit[0].toUpperCase() + bit.substr(1);
            }

            const newProp = bits.join('');

            const val = obj[prop];

            newObj[newProp] = (typeof val === 'object' && deep) ? SlackUtil.convertProperties(val) : val;
        }

        return newObj;
    }
};