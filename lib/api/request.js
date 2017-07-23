const baseUrl = require('../../config/url');
const snekfetch = require('snekfetch');

/**
 * Create a slack request URL based on a query object and a method path.
 *
 * This method does basic stringifying of the @query param.
 * If a value is not a string, it's stringified with JSON.stringify.
 * Then, the string (no matter if it started as a string or not) is encoded with encodeURIComponent.
 * This is because slack has a hard time understanding directly encoded 'objects' like {hello: 'world'}.
 * Stringification before encoding works well enough.
 *
 * It's possible that this may cause some issues for some specific characters, but so far I have encountered none, even with emoji.
 *
 * @param method {string} - The method to request.
 * @param {object} [query={}] - The query object to stringify.
 * @return {string}
 */
function createSlackRequestUrl(method, query = {}){
    const url = baseUrl + method;
    const args = [];

    for(const key of Object.keys(query)){
        let value = query[key];

        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }

        args.push(`${key}=${encodeURIComponent(value)}`);
    }

    return `${url}?${args.join('&')}`;
}

/**
 * Makes a request to a slack API method.
 *
 * @param path {string} - The peth to the method (e.g. chat.postMessage)
 * @param {object} [args={}] - All args to be sent to slack.
 * @return {Promise.<*>}
 */
module.exports = function makeSlackRequest(path, args = {}) {
    return snekfetch.get(createSlackRequestUrl(path, args))
        .then(r => {
            const {body} = r;

            if (body.ok === false || body.error != null) {
                return Promise.reject(new Error(body.error || 'An unknown error has occurred.'));
            }

            return body;
        }).catch(r => {
            const {body} = r;

            if (!body) {
                return new Error(`${r.status} - ${r.statusText}`);
            }

            if (body.error) {
                return new Error(body.error);
            }

            return r;
        });
};