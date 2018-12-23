"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars,no-console */
const assert_1 = __importDefault(require("assert"));
const methods_1 = __importDefault(require("../config/methods"));
const mockData_1 = __importDefault(require("./mockData"));
const Client_1 = __importDefault(require("../lib/client/Client"));
const ConversationType_1 = __importDefault(require("../lib/enum/ConversationType"));
const User_1 = __importDefault(require("../lib/structures/user/User"));
async function backwardsResolve(promise) {
    const msg = 'Promise resolved normally';
    try {
        await promise;
        //noinspection ExceptionCaughtLocallyJS
        throw new Error(msg);
    }
    catch (e) {
        if (e.message === msg) {
            throw e;
        }
    }
    return undefined;
}
async function asyncThrows(promise, error = Error) {
    try {
        await promise;
    }
    catch (e) {
        if (e instanceof error) {
            return true;
        }
    }
    return false;
}
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function promiseTimeout(promise, timeout) {
    return Promise.race([promise, pause(timeout)]);
}
process.on('unhandledRejection', console.error);
describe('Carabiner', function () {
    let mainClient;
    before(function () {
        assert_1.default.ok(process.env.SLACK_TOKEN != null, 'Slack token should be set in environment variables');
        mainClient = new Client_1.default(process.env.SLACK_TOKEN);
    });
    describe('SlackAPI Generation', function () {
        const split = methods_1.default.map(m => m.split('.'));
        it('should generate all high-level method categories', function () {
            // Get all high-level categories and cast it to a set so it's distinct
            const expectedUniqueMethods = new Set(split.map(s => s[0])).size;
            const actualUniqueMethods = Object.keys(mainClient.api.methods).length;
            return assert_1.default.strictEqual(expectedUniqueMethods, actualUniqueMethods);
        });
        it('should generate all actual methods', function () {
            for (const method of methods_1.default) {
                let pointer = mainClient.api.methods;
                for (const piece of method.split('.')) {
                    assert_1.default.ok(pointer.hasOwnProperty(piece), `Method ${method} is missing`);
                    pointer = pointer[piece];
                }
                assert_1.default.equal(typeof pointer, 'function', `Method ${method} does not end in a function`);
            }
        });
    });
    describe('Requests', function () {
        it('should throw an error when slack does', async function () {
            const nullClient = new Client_1.default('invalid slack token');
            return backwardsResolve(nullClient.api.methods.auth.test());
        });
        it('should return an object when making slack requests', async function () {
            return assert_1.default(typeof (await mainClient.api.methods.api.test()) === 'object');
        });
        it('should correctly pass all args', async function () {
            const args = {
                hello: 'world',
                count: '4',
                token: mainClient.api.token
            };
            return mainClient.api.methods.api.test(args).then(r => {
                assert_1.default.strictEqual(JSON.stringify(r.args), JSON.stringify(args));
            });
        });
    });
    describe('Web API', function () {
        it('should resolve when calling the basic api test', function () {
            return mainClient.api.methods.api.test();
        });
        it('should be able to parse arrays from requests', async function () {
            // Limit the amount of users we get back,
            // disable presence. We don't need much
            // data, just need it to validate
            return mainClient.api.methods.users.list({
                limit: 2,
                presence: false
            }).then(res => {
                assert_1.default.ok(Array.isArray(res.members), 'res.members is not an array');
            });
        });
    });
    describe('RTM API', function () {
        // This also tests the removed test to check
        // whether it can even connect to RTM to begin
        // with, because otherwise the two are redundant.
        // It either connects and receives events (which
        // is how we determine if it's opened) or it
        // doesn't at all.
        it('should be able to receive rtm events', async function () {
            const client = new Client_1.default(process.env.SLACK_TOKEN);
            try {
                await client.api.rtm.connect();
            }
            catch (e) {
                throw e;
            }
            const promise = new Promise((resolve, reject) => {
                client.api.rtm.once('event', resolve);
                client.api.rtm.once('error', reject);
            });
            // If anyone complains about this memory leak... stop yourself.
            return promiseTimeout(promise, 2000).finally(() => client.api.rtm.destroy());
        });
    });
    describe('Client', async function () {
        describe('init', async function () {
            it('should successfully cache objects without RTM', async function () {
                this.timeout(10000);
                const client = new Client_1.default(process.env.SLACK_TOKEN, { rtm: false });
                await client.init();
                // If length is 0 or id is null then it did not properly cache the item
                assert_1.default.notStrictEqual(client.conversations.size, 0);
                assert_1.default.notStrictEqual(client.users.size, 0);
                assert_1.default.notStrictEqual(client.team.id, null);
                assert_1.default.notStrictEqual(client.self.id, null);
            });
            it('should connect to rtm automatically', async function () {
                // This can take a while sometimes
                this.timeout(10000);
                const client = new Client_1.default(process.env.SLACK_TOKEN, { useRtmStart: true });
                try {
                    await client.init();
                }
                catch (e) {
                    throw e;
                }
                const promise = new Promise(resolve => {
                    client.api.rtm.once('open', resolve);
                });
                return promiseTimeout(promise, 10000).finally(() => client.api.rtm.destroy());
            });
        });
    });
    describe('Structures', function () {
        describe('User', async function () {
            it('should assign all necessary properties from mock data', function () {
                const testUser = new User_1.default(mainClient, mockData_1.default.user);
                // Yeah... this isn't ALL properties.
                // But I'm a bit lazy at the time of writing this.
                assert_1.default.equal(testUser.client, mainClient);
                assert_1.default.equal(testUser.id, mockData_1.default.user['id']);
                assert_1.default.equal(testUser.isAdmin, mockData_1.default.user['is_admin']);
            });
        });
    });
    describe('Test slack organization', function () {
        let testClient;
        before(function initClient() {
            this.timeout(10000);
            testClient = new Client_1.default(process.env.SLACK_TOKEN, { rtm: false });
            return testClient.init();
        });
        it('should recognize the self as a bot', function () {
            assert_1.default.ok(testClient.self.isBot, 'User is not recognized as a bot');
        });
        it('should contain slackbot in users', function () {
            assert_1.default.ok(testClient.users.find('isSlackbot', true) != null, 'Slackbot was not found');
        });
        it('should contain the correct distributions of channels', function () {
            assert_1.default.strictEqual(testClient.conversations.findAll('type', ConversationType_1.default.CHANNEL).length, 2);
            assert_1.default.strictEqual(testClient.conversations.findAll('type', ConversationType_1.default.GROUP).length, 2);
        });
        it('should contain the correct #general', function () {
            const conversation = testClient.conversations.find('name', 'general');
            assert_1.default.ok(conversation != null, '#general does not exist');
            assert_1.default.ok(conversation.type === ConversationType_1.default.CHANNEL, '#general is not a public channel');
            assert_1.default.strictEqual(conversation.topic.value, 'Company-wide announcements and work-based matters', 'incorrect topic');
            assert_1.default.ok(conversation.contains(testClient.self), '#general does not contain the bot');
        });
        it('should contain the correct #random', function () {
            const conversation = testClient.conversations.find('name', 'random');
            assert_1.default.ok(conversation != null, '#random does not exist');
            assert_1.default.ok(conversation.type === ConversationType_1.default.CHANNEL, '#random is not a public channel');
            assert_1.default.equal(conversation.topic.value, 'Non-work banter and water cooler conversation', 'incorrect topic');
            assert_1.default.ok(!conversation.contains(testClient.self), '#random does contain the bot');
        });
        it('should contain the correct #carabiner-private', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-private');
            assert_1.default.ok(conversation != null, '#carabiner-private does not exist');
            assert_1.default.ok(conversation.type === ConversationType_1.default.GROUP, '#carabiner-private is not a private channel');
            assert_1.default.ok(conversation.contains(testClient.self), '#carabiner-private does not contain the bot');
        });
        it('should contain the correct #carabiner-solitary', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-solitary');
            assert_1.default.ok(conversation != null, '#carabiner-solitary does not exist');
            assert_1.default.ok(conversation.type === ConversationType_1.default.GROUP, '#carabiner-solitary is not a private channel');
            assert_1.default.ok(!conversation.topic.exists, '#carabiner-solitary has a conversation topic');
            assert_1.default.ok(conversation.contains(testClient.self), '#carabiner-solitary does not contain the bot');
            if (conversation.members.size !== 1) {
                assert_1.default.strictEqual(conversation.members.size, 2, 'conversation has too many users');
                // Get the only other user in this conversation, i.e. the only other one whose ID is not mine
                // since members is a map of <ID, User>
                const other = conversation.members.get(conversation.members
                    .keyArray()
                    .filter(id => !(id === testClient.self.id))[0]);
                assert_1.default.ok(other != null, 'the other user could not be found');
                assert_1.default.ok(other === conversation.creator, 'the other user is not the creator of the conversation');
            }
        });
    });
});
//# sourceMappingURL=main.test.js.map