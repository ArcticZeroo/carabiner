const request = require('./request');
const methods = require('../../config/methods');
const SlackRTM = require('./SlackRTM');

class SlackAPI {
    constructor(token) {
        /**
         * The slack token this api should use.
         * @type {string}
         */
        this.token = token;

        this.rtm = new SlackRTM(this);
    }
}

/**
 * An object containing all basic slack API methods.
 * View https://api.slack.com/methods for the full list, and that's how you access them, e.g. api.methods.channels.info(...)
 * Each method takes one argument, which is an object of key:value pairs specified in the method's slack documentation.
 * @example
 * api.methods.chat.postMessage(...)
 * @type {object}
 */
SlackAPI.prototype.methods = {};

for (const method of methods) {
    const path = method.split('.');

    let ptr = SlackAPI.prototype.methods;

    for (let i = 0; i < path.length - 1; i++) {
        const cur = path[i];

        if (!ptr.hasOwnProperty(cur)) {
            ptr[cur] = {};
        }

        ptr = ptr[cur];
    }

    ptr[path[path.length-1]] = function(args = {}) {
        args.token = this.token;

        return request(method, args);
    }
}

/**
 * Posts a message to a slack channel.
 * @param {object} [args={}] - Additional args to send.
 * @return {Promise.<*>}
 */
SlackAPI.prototype.methods.chat.postMessage = async function(args = {}){
    // If text is falsy and not empty...
    if(!args.text && args.text !== '') {
        // And there are no attachments being added...
        if (!args.attachments || !(args.attachments.length === 0)) {
            // The field is required.
            throw new Error('Text is required in chat.postMessage');
        }
    }

    args.token = this.token;

    function send() {
        return request('chat.postMessage', args);
    }

    if (args.text.length < 3000) {
        return send();
    }

    let msg = args.text;
    const queue = [];

    while (msg.length > 2999) {
        queue.push(msg.substr(0, 3000));
        msg = msg.substr(3000);
    }

    if (msg.length > 0) {
        queue.push(msg);
    }

    let last;

    for (const text of queue) {
        try {
            args.text = text;
            last = await send();
        } catch (e) {
            throw e;
        }
    }

    return last;
};

module.exports = SlackAPI;