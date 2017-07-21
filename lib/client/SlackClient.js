const SlackAPI = require('../api.old/SlackAPI');
const EventEmitter = require('events');
const Collection = require('djs-collection');

class SlackClient extends EventEmitter {
    constructor(token, opts = {}) {
        super();

        this.api = new SlackAPI(token);

        // default options
        this.options = Object.assign({
            rtm: true,

        }, opts);

        this.channels = new Collection();

        this.users = new Collection();
        this.team = null;
    }
}