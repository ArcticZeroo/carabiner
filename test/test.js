const assert = require('assert');

const methods = require('../config/methods');
const mockData = require('./mockData');

const Client = require('../lib/client/Client');
const SlackAPI = require('../lib/api/SlackAPI');

const ConversationType = require('../lib/enum/ConversationType');
const User = require('../lib/structures/user/User');

async function backwardsResolve(promise) {
    const msg = 'Promise resolved normally';

    try {
        await promise;

        //noinspection ExceptionCaughtLocallyJS
        throw new Error(msg);
    } catch(e) {
        if (e.message === msg) {
            throw e;
        }
    }

    return undefined;
}

async function asyncThrows(promise, error = Error) {
    try {
        await promise;
    } catch (e) {
        if (e instanceof error) {
            return true;
        }
    }
    return false;
}

process.on('unhandledRejection', console.error);

describe('Carabiner', function () {
    assert.notEqual(process.env.SLACK_TOKEN, null, 'Slack token should be set in environment variables');

    const mainClient = new Client(process.env.SLACK_TOKEN);

    describe('SlackAPI Generation', function () {
        const split = methods.map(m => m.split('.'));

        it('should generate all high-level method categories', function () {
            // Get all high-level categories and cast it to a set so it's distinct
            const expectedUniqueMethods = new Set(split.map(s => s[0])).size;
            const actualUniqueMethods = Object.keys(mainClient.api.methods).length;

            return assert.strictEqual(expectedUniqueMethods, actualUniqueMethods);
        });

        it('should generate all actual methods', function () {
            for (const method of methods) {
                let pointer = mainClient.api.methods;
                for (const piece of method.split('.')) {
                    assert.ok(pointer.hasOwnProperty(piece), 'Method ' + method + ' is missing');
                    pointer = pointer[piece];
                }
            }
        });
    });

    describe('Requests', function () {
        it('should throw an error when slack does', async function () {
            const nullClient = new Client('invalid slack token');

            return backwardsResolve(nullClient.api.methods.auth.test());
        });

        it('should return an object when making slack requests', async function () {
            return assert(typeof (await mainClient.api.methods.api.test()) === 'object');
        });

        it('should correctly pass all args', async function () {
            const args = {
                hello: 'world',
                count: '4',
                token: mainClient.api.token
            };

            return mainClient.api.methods.api.test(args).then(r => {
                assert.equal(JSON.stringify(r.args), JSON.stringify(args));
            });
        });
    });

    describe('Web API', function () {
        it('should resolve when calling the basic api test', function () {
            return mainClient.api.methods.api.test();
        });

        it('should be able to parse arrays from requests', async function () {
            return mainClient.api.methods.users.list({
                limit: 5,
                presence: false
            }).then(res => {
                assert(Array.isArray(res.members));
            });
        });
    });

    describe('RTM API', function () {
        it('should be able to connect to rtm', async function () {
            const client = new Client(process.env.SLACK_TOKEN);

            try {
                await client.api.rtm.connect();
            } catch (e) {
                throw e;
            }

            return new Promise(resolve => {
                client.api.rtm.once('open', resolve);
            });
        });

        it('should be able to receive rtm events', async function () {
            const client = new Client(process.env.SLACK_TOKEN);

            try {
                await client.api.rtm.connect();
            } catch (e) {
                throw e;
            }

            // If anyone complains about this memory leak... stop yourself.
            return new Promise((resolve, reject) => {
                client.api.rtm.once('event', resolve);
                client.api.rtm.once('error', reject);
            });
        });
    });

    describe('Client', async function () {
        describe('init', async function () {
            it('should successfully cache objects', async function () {
                const client = new Client(process.env.SLACK_TOKEN, {rtm: false});
                await client.init();

                // If length is 0 or id is null then it did not properly cache the item
                assert.notEqual(client.conversations.length, 0);
                assert.notEqual(client.users.length, 0);
                assert.notEqual(client.team.id, null);
                assert.notEqual(client.self.id, null);
            });

            it('should connect to rtm automatically', async function () {
                this.timeout(10000);

                const client = new Client(process.env.SLACK_TOKEN, {useRtmStart: true});

                client.init().catch((e) => {
                    throw e;
                });

                return new Promise(resolve => {
                    client.api.rtm.once('open', () => {
                        client.api.rtm.destroy();
                        resolve();
                    });
                });
            });
        });
    });

    describe('Structures', async function () {
        describe('User', async function () {
            const testUser = new User(mainClient, mockData.user);

            assert.equal(testUser.client, mainClient);
            assert.equal(testUser.id, mockData.user['id']);
            assert.equal(testUser.isAdmin, mockData.user['is_admin']);
        });
    });

    describe('Test slack organization', async function () {
        const testClient = new Client(process.env.SLACK_TOKEN);

        try {
            await testClient.init();
        } catch (e) {
            throw e;
        }

        it('should recognize the self as a bot', function () {
            assert.ok(testClient.self.isBot, 'User is not recognized as a bot');
        });

        it('should contain the correct distributions of channels', function () {
           assert.equal(testClient.conversations.length, 4);
           assert.equal(testClient.conversations.findAll('type', ConversationType.CHANNEL).length, 2);
           assert.equal(testClient.conversations.findAll('type', ConversationType.GROUP).length, 2);
        });

        it('should contain the correct #general', function () {
            const generalConversation = testClient.conversations.find('name', 'general');

            assert.ok(generalConversation != null, '#general does not exist');
            assert.equal(generalConversation.topic.value, 'Company-wide announcements and work-based matters', 'incorrect topic');
            assert.ok(generalConversation.members.find('id', testClient.self.id) != null, '#general does not contain the bot');
        });
    });
});