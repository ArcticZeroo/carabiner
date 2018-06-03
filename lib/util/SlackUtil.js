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
        return (date.getTime() / 1000);
    }

    /**
     * Converts slack properties into camelCase JS ones using a cloned object.
     * This method does not take circular references into account since they should not exist in slack's responses.
     * @example
     * // Returns {helloWorld: 'hi'}
     * SlackUtil.convertProperties({
     *  hello_world: 'hi!'
     * });
     * @param obj {T=object} - The object to convert.
     * @param {boolean} [deep=false] - Whether the conversion should be deep, i.e. if it should enter further objects to convert their properties.
     * @template T
     * @returns {T}
     */
    static convertProperties(obj, deep = true) {
        const newObj = {};

        // noinspection EqualityComparisonWithCoercionJS
        if (obj == null || !obj) {
            return obj;
        }

        for (const prop of Object.keys(obj)) {
            const bits = prop.split('_');

            // If there are no bits (that should never happen)
            // or there is only one (in the case of no underscores),
            // just set the property of the original name.
            if (bits.length <= 1) {
                newObj[prop] = obj[prop];
                continue;
            }

            // Start at the first property because we know
            // it must exist, and we don't want to
            // capitalize it.
            for (let i = 1; i < bits.length; i++) {
                const bit = bits[i];

                // Don't capitalize single-length bits
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

    /**
     * Get the next cursor based on slack metadata.
     * If the metadata is missing information (or
     * you are at the end of the pagination), this
     * will return null.
     * @param {object} res - the slack response object to get a cursor for
     * @return {string|null}
     */
    static getNextCursor(res) {
        if (!res || !res.response_metadata) {
            return null;
        }

        const cur = res.response_metadata.next_cursor;

        if (cur.toString().trim() === '') {
            return null;
        }

        return cur;
    }

    /**
     * Get the next page of the request.
     * @param {object} res - The last response from slack.
     * @param {function} method - The api function to call with the given limit and the next cursor.
     * @param {number} limit - The maximum number of results to return.
     * @param {function} getData - A function which accepts slack data and returns the data to add to the pages returned
     * @return {*}
     */
    static getNextPage({ res, method, limit, getData }) {
        const cursor = SlackUtil.getNextCursor(res);

        if (!cursor) {
            return null;
        }

        return method({ limit, cursor }).then(r => getData(r));
    }

    /**
     * Get all pages for a slack api call. This is useful for anything that
     * requires the use of pagination, for instance the conversations.list
     * method call. Pass arguments inside an object, so they are named.
     * @param {function} method - The api function to call. Pass a reference to the client.api.methods{your method}
     * @param {object} [args={}] - Arguments to use when calling this method for the first time (consecutive calls don't require args since the cursor stores it)
     * @param {function} getData - A function which accepts slack data and returns the data to add to the pages returned
     * @param {number} [pageLimit=Number.MAX_SAFE_INTEGER] - The maximum number of pages to retrieve. This could result in a lot of calls if you're in a large organization.
     * @param {number} [singlePageLimit=100] - The maximum number of results for one page.
     * @param {boolean} [combine=true] - Whether or not to "flatten" all pages into a single array before returning them. If this is false, each array member will be a page of data, and if it is true all elements from each page will be in the same array level.
     * @return {Promise<Array>}
     */
    static async getPages({ method, args = {}, getData = (r => r), pageLimit = Number.MAX_SAFE_INTEGER, singlePageLimit = 100, combine = true }) {
        const data = [];

        if (!args.limit) {
            args.limit = singlePageLimit;
        }

        // Get the first page
        let res;
        try {
            res = await method(args);

            data.push(getData(res));
        } catch (e) {
            throw e;
        }

        // Get all the remaining pages, based on the last response which
        // should contain the cursor for the next page
        for (let i = 1; i < pageLimit; i++) {
            try {
                res = await SlackUtil.getNextPage({ res, method, limit: singlePageLimit, getData });
            } catch (e) {
                throw e;
            }

            if (!res) {
                // We're done here, folks
                break;
            }

            data.push(res);
        }

        if (combine) {
            const flat = [];

            for (const page of data) {
                flat.push(...page);
            }

            return flat;
        }

        return data;
    }
}

module.exports = SlackUtil;