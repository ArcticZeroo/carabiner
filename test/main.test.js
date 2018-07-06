/* eslint-disable no-unused-vars,no-console */
const assert = require('assert');
const Promise = require('bluebird');

const methods = require('../config/methods');
const mockData = require('./mockData');

const Client = require('../lib/client/Client');

const ConversationType = require('../lib/enum/ConversationType');
const User = require('../lib/structures/user/User');

async function backwardsResolve(promise) {
    const msg = 'Promise resolved normally';

    try {
        await promise;

        //noinspection ExceptionCaughtLocallyJS
        throw new Error(msg);
    } catch (e) {
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

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

process.on('unhandledRejection', console.error);

describe('Carabiner', function () {
    let mainClient;

    before(function () {
        assert.ok(process.env.SLACK_TOKEN != null, 'Slack token should be set in environment variables');

        mainClient = new Client(process.env.SLACK_TOKEN);
    });

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
                    assert.ok(pointer.hasOwnProperty(piece), `Method ${method} is missing`);
                    pointer = pointer[piece];
                }

                assert.equal(typeof pointer, 'function', `Method ${method} does not end in a function`);
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
            // Limit the amount of users we get back,
            // disable presence. We don't need much
            // data, just need it to validate
            return mainClient.api.methods.users.list({
                limit: 2,
                presence: false
            }).then(res => {
                assert.ok(Array.isArray(res.members), 'res.members is not an array');
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
            })
                .timeout(2000)
                .finally(() => client.api.rtm.destroy());
        });
    });

    describe('Client', async function () {
        describe('init', async function () {
            it('should successfully cache objects without RTM', async function () {
                this.timeout(10000);

                const client = new Client(process.env.SLACK_TOKEN, { rtm: false });

                await client.init();

                // If length is 0 or id is null then it did not properly cache the item
                assert.notEqual(client.conversations.length, 0);
                assert.notEqual(client.users.length, 0);
                assert.notEqual(client.team.id, null);
                assert.notEqual(client.self.id, null);
            });

            it('should connect to rtm automatically', async function () {
                // This can take a while sometimes
                this.timeout(10000);

                const client = new Client(process.env.SLACK_TOKEN, { useRtmStart: true });

                try {
                    await client.init();
                } catch (e) {
                    throw e;
                }

                return new Promise(resolve => {
                    client.api.rtm.once('open', resolve);
                })
                    .timeout(10000)
                    .finally(() => client.api.rtm.destroy());
            });
        });
    });

    describe('Structures', function () {
        describe('User', async function () {
            it('should assign all necessary properties from mock data', function () {
                const testUser = new User(mainClient, mockData.user);

                // Yeah... this isn't ALL properties.
                // But I'm a bit lazy at the time of writing this.
                assert.equal(testUser.client, mainClient);
                assert.equal(testUser.id, mockData.user['id']);
                assert.equal(testUser.isAdmin, mockData.user['is_admin']);
            });
        });
    });

    describe('Test slack organization', function () {
        let testClient;

        before(function initClient() {
            this.timeout(10000);

            testClient = new Client(process.env.SLACK_TOKEN, { rtm: false });

            return testClient.init();
        });

        it('should recognize the self as a bot', function () {
            assert.ok(testClient.self.isBot, 'User is not recognized as a bot');
        });

        it('should contain slackbot in users', function () {
            assert.ok(testClient.users.find('isSlackbot', true) != null, 'Slackbot was not found');
        });

        it('should contain the correct distributions of channels', function () {
            assert.equal(testClient.conversations.findAll('type', ConversationType.CHANNEL).length, 2);
            assert.equal(testClient.conversations.findAll('type', ConversationType.GROUP).length, 2);
        });

        it('should contain the correct #general', function () {
            const conversation = testClient.conversations.find('name', 'general');

            assert.ok(conversation != null, '#general does not exist');
            assert.ok(conversation.type === ConversationType.CHANNEL, '#general is not a public channel');
            assert.equal(conversation.topic.value, 'Company-wide announcements and work-based matters', 'incorrect topic');
            assert.ok(conversation.contains(testClient.self), '#general does not contain the bot');
        });

        it('should contain the correct #random', function () {
            const conversation = testClient.conversations.find('name', 'random');

            assert.ok(conversation != null, '#random does not exist');
            assert.ok(conversation.type === ConversationType.CHANNEL, '#random is not a public channel');
            assert.equal(conversation.topic.value, 'Non-work banter and water cooler conversation', 'incorrect topic');
            assert.ok(!conversation.contains(testClient.self), '#random does contain the bot');
        });

        it('should contain the correct #carabiner-private', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-private');

            assert.ok(conversation != null, '#carabiner-private does not exist');
            assert.ok(conversation.type === ConversationType.GROUP, '#carabiner-private is not a private channel');
            assert.ok(conversation.contains(testClient.self), '#carabiner-private does not contain the bot');
        });

        it('should contain the correct #carabiner-solitary', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-solitary');

            assert.ok(conversation != null, '#carabiner-solitary does not exist');
            assert.ok(conversation.type === ConversationType.GROUP, '#carabiner-solitary is not a private channel');
            assert.ok(!conversation.topic.exists, '#carabiner-solitary has a conversation topic');
            assert.ok(conversation.contains(testClient.self), '#carabiner-solitary does not contain the bot');

            if (conversation.members.size !== 1) {
                assert.strictEqual(conversation.members.size, 2, 'conversation has too many users');

                // Get the only other user in this conversation, i.e. the only other one whose ID is not mine
                // since members is a map of <ID, User>
                const other = conversation.members.get(
                    conversation.members
                        .keyArray()
                        .filter(id => !(id === testClient.self.id))[0]
                );

                assert.ok(other != null, 'the other user could not be found');
                assert.ok(other === conversation.creator, 'the other user is not the creator of the conversation');
            }
        });
    });
});