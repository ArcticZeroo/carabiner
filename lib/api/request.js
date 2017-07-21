const config = require('../../config');
const snekfetch = require('snekfetch');

function createSlackRequestUrl(method, properties = {}){
    const url = config.base_url + method;
    const args = [];

    for(let property in properties){
        if (!properties.hasOwnProperty(property)) {
            continue;
        }

        let value = properties[property];

        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }

        args.push(`${property}=${encodeURIComponent(value)}`);
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