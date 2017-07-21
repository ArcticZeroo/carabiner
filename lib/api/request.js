const config = require('../../config');
const snekfetch = require('snekfetch');

function createSlackRequestUrl(method, query = {}){
    const url = config.base_url + method;
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

module.exports = function makeSlackRequest(path, args) {
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