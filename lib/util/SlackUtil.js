const StringUtil = require('./StringUtil');

class SlackUtil {
    /**
     * Slack-related utilities.
     */
    constructor() {}

    /**
     * Returns a Date converted from slack time (ms since epoch / 1000)
     * @param slackTimestamp {number} - A unix epoch divided by 1000.
     * @returns {Date}
     */
    static getDate(slackTimestamp) {
        return new Date(slackTimestamp*1000);
    }

    /**
     * Turns a Date into a slack timestamp (ms since epoch / 1000)
     * @param date {Date} - The date to convert.
     * @return {number}
     */
    static dateToSlack(date) {
        return (date.getTime() / 1000)
    }

    /**
     * Converts slack properties into camelCase JS ones using a cloned object.
     * This method does not take circular references into account since they should not exist in slack's responses.
     * @example
     * // Returns {helloWorld: 'hi'}
     * SlackUtil.convertProperties({
     *  hello_world: 'hi!'
     * });
     * @param obj {object} - The object to convert.
     * @param {boolean} [deep=false] - Whether the conversion should be deep, i.e. if it should enter further objects to convert their properties.
     * @returns {object}
     */
    static convertProperties(obj, deep = true) {
        let newObj = {};

        if (obj == null || !obj) {
            return obj;
        }

        for (const prop of Object.keys(obj)) {
            const bits = prop.split('_');

            if (bits.length === 0) {
                newObj[prop] = obj[prop];
                continue;
            }

            for (let i = 1; i < bits.length; i++) {
                const bit = bits[i];

                bits[i] = (bit.length === 1) ? bit : StringUtil.capitalize(bit);
            }

            const newProp = bits.join('');

            const val = obj[prop];

            newObj[newProp] = (typeof val === 'object' && deep)
                ? SlackUtil.convertProperties(val)
                : val;
        }

        return newObj;
    }

    static getNextCursor(res) {
        const cur = res.response_metadata.next_cursor;

        if (cur.trim() === '') {
            return null;
        }

        return cur;
    }

    static async getNextPage({ res, method, limit, getData }) {
        const cursor = SlackUtil.getNextCursor(res);

        if (!cursor) {
            return null;
        }

        return method({ limit, cursor }).then(r => getData(r));
    }

    static async getPages({ method, args, getData, pageLimit = Number.POSITIVE_INFINITY }) {
        const data = [];

        let res;
        try {
           res = await method(args);

           data.push(res.getData());
        } catch (e) {
            throw e;
        }

        for (let i = 0; i < pageLimit; i++) {
            try {
                data.push(await SlackUtil.getNextPage({ res, method, limit: args.limit, getData }));
            } catch (e) {
                throw e;
            }
        }

        return data;
    }
}

module.exports = SlackUtil;