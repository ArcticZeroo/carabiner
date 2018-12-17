import ISlackWebApiArgs from '../models/ISlackWebApiArgs';
import ISlackWebApiMethods from '../models/ISlackWebApiMethods';
import SlackRTM from './SlackRTM';
import methods from '../../config/methods';
import request from './request';

interface ISlackApiOptions {
    handleMigration?: boolean;
}

interface ISlackWebApiChatPostMessageArgs extends ISlackWebApiArgs {
    text?: string;
    attachments?: any[]
}

type SlackWebApiMethod = (args?: ISlackWebApiArgs) => Promise<any>;
type MethodOrNestedMethod = { [key: string]: SlackWebApiMethod|MethodOrNestedMethod };

export default class SlackAPI {
    private readonly token: string;
    public readonly methods: ISlackWebApiMethods;
    public readonly rtm: SlackRTM;

    /**
     * Create this instance of the Slack web API.
     * This will also generate all methods into the
     * SlackAPI.methods object.
     * @param {string} token - Your slack token.
     * @param {object} [options={}] - Additional optional options to use
     * @param {boolean} [options.handleMigration=true] - The same as the one you should have given to {@link Client}
     */
    constructor(token: string, options: ISlackApiOptions = {}) {
        /**
         * The slack token this api should use.
         * @type {string}
         */
        this.token = token;

        /**
         * An object containing all basic slack API methods.
         * View https://api.slack.com/methods for the full list, and that's how you access them.
         * Each method takes one argument, which is an object of key:value pairs specified in the method's slack documentation.
         * @example
         * api.methods.chat.postMessage(...)
         * @type {object}
         */
        // @ts-ignore
        this.methods = {};

        for (const method of methods) {
            const path = method.split('.');

            let ptr: any = this.methods;

            for (let i = 0; i < path.length - 1; i++) {
                const cur = path[i];

                if (!ptr.hasOwnProperty(cur)) {
                    ptr[cur] = {};
                }

                ptr = ptr[cur];
            }

            ptr[path[path.length - 1]] = (args: ISlackWebApiArgs = {}) => {
                args.token = this.token;

                return request(method, args);
            };
        }

        /**
         * Posts a message to a slack channel.
         * @param {object} [args={}] - Additional args to send.
         * @return {Promise.<*>}
         */
        this.methods.chat.postMessage = async (args: ISlackWebApiChatPostMessageArgs = {}) => {
            // If text is falsy and not empty...
            if (!args.text && args.text !== '') {
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

        this.rtm = new SlackRTM({ api: this, retryIfMigrating: options.handleMigration });
    }
}