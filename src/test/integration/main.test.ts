/* eslint-disable no-unused-vars,no-console */
import methods from '../../config/methods';
import messages from '../../lib/events/messages';
import Message from '../../lib/structures/message/Message';
import mockData from '../mockData/primary';
import Client from '../../lib/client/Client';
import ConversationType from '../../lib/enum/ConversationType';
import User from '../../lib/structures/user/User';
import { expect } from 'chai';

async function backwardsResolve(promise: Promise<any>): Promise<void> {
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

async function asyncThrows(promise: Promise<any>, error = Error) {
    try {
        await promise;
    } catch (e) {
        if (e instanceof error) {
            return true;
        }
    }
    return false;
}

function pause(ms: number) {
    return new Promise((resolve: () => void) => setTimeout(resolve, ms));
}

function promiseTimeout(promise: Promise<any>, timeout: number): Promise<any> {
    return Promise.race([promise, pause(timeout)]);
}

process.on('unhandledRejection', console.error);

describe('Carabiner', function () {
    let mainClient: Client;

    before(function () {
        expect(process.env.SLACK_TOKEN).to.be.a('string', 'Slack token should be set in environment variables');

        mainClient = new Client(process.env.SLACK_TOKEN);
    });

    describe('SlackAPI Generation', function () {
        const split = methods.map(m => m.split('.'));

        it('should generate all high-level method categories', function () {
            // Get all high-level categories and cast it to a set so it's distinct
            const expectedUniqueMethods = new Set(split.map(s => s[0])).size;
            const actualUniqueMethods = Object.keys(mainClient.api.methods).length;

            expect(expectedUniqueMethods).to.equal(actualUniqueMethods);
        });

        it('should generate all actual methods', function () {
            for (const method of methods) {
                let pointer: any = mainClient.api.methods;

                for (const piece of method.split('.')) {
                    expect(pointer.hasOwnProperty(piece), `Method ${method} is missing`).to.be.ok;
                    pointer = pointer[piece];
                }

                expect(pointer).to.be.a('function', `Method ${method} does not end in a function`);
            }
        });
    });

    describe('Requests', function () {
        it('should throw an error when slack does', async function () {
            const nullClient = new Client('invalid slack token');

            return backwardsResolve(nullClient.api.methods.auth.test());
        });

        it('should return an object when making slack requests', async function () {
            return expect(await mainClient.api.methods.api.test()).to.be.an('object');
        });

        it('should correctly pass all args', async function () {
            const args = {
                hello: 'world',
                count: '4',
                token: mainClient.api.token
            };

            return mainClient.api.methods.api.test(args).then(r => {
                const expectedResult = JSON.stringify(args);
                const actualResult = JSON.stringify(r.args);

                expect(expectedResult).to.equal(actualResult);
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
                expect(res.members).to.be.an('array', 'res.members is not an array');
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

            const promise = new Promise((resolve, reject) => {
                client.api.rtm.once('event', resolve);
                client.api.rtm.once('error', reject);
            });

            // If anyone complains about this memory leak... stop yourself.
            return promiseTimeout(promise, 2000).finally(() => client.api.rtm.destroy());
        });
    });

    describe('Client', async function () {
        describe('constructor assignments', () => {

        });

        describe('init', async function () {
            it('should successfully cache objects without RTM', async function () {
                this.timeout(10000);

                const client = new Client(process.env.SLACK_TOKEN, { rtm: false });

                await client.init();

                // If length is 0 or id is null then it did not properly cache the item
                expect(client.conversations.size).to.be.greaterThan(0);
                expect(client.users.size).to.be.greaterThan(0);
                expect(client.team.id).to.be.ok;
                expect(client.self.id).to.be.ok;
                expect(client.users.has(client.self.id)).to.be.true;
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
                const testUser = new User(mainClient, mockData.user);

                // Yeah... this isn't ALL properties.
                // But I'm a bit lazy at the time of writing this.
                expect(testUser.client).to.equal(mainClient);
                expect(testUser.id).to.equal(mockData.user.id);
                expect(testUser.isAdmin).to.equal(mockData.user.is_admin);
            });
        });
    });

    describe('Test slack organization', function () {
        let testClient: Client;

        before(function initClient() {
            this.timeout(10000);

            testClient = new Client(process.env.SLACK_TOKEN, { rtm: false });

            return testClient.init();
        });

        after(() => {
            testClient.destroy();
        });

        it('should recognize the self as a bot', function () {
            expect(testClient.self.isBot).to.be.true('User is not recognized as a bot');
        });

        it('should contain slackbot in users', function () {
            expect(testClient.users.find('isSlackbot', true), 'Slackbot was not found').to.not.be.null;
        });

        it('should contain the correct distributions of channels', function () {
            expect(testClient.conversations.findAll('type', ConversationType.CHANNEL)).to.have.length(2);
            expect(testClient.conversations.findAll('type', ConversationType.GROUP)).to.have.length(2);
        });

        it('should contain the correct #general', function () {
            const conversation = testClient.conversations.find('name', 'general');

            expect(conversation, '#general does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.CHANNEL, '#general is not a public channel');
            expect(conversation.topic.value).to.equal('Company-wide announcements and work-based matters', 'incorrect topic');
            expect(conversation.contains(testClient.self)).to.be.true('#general does not contain the bot but should');
        });

        it('should contain the correct #random', function () {
            const conversation = testClient.conversations.find('name', 'random');

            expect(conversation, '#random does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.CHANNEL, '#random is not a public channel');
            expect(conversation.topic.value).to.equal('Non-work banter and water cooler conversation', 'incorrect topic');
            expect(conversation.contains(testClient.self)).to.be.false('#random does contain the bot but should not');
        });

        it('should contain the correct #carabiner-private', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-private');

            expect(conversation, '#carabiner-private does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.GROUP, '#carabiner-private is not a private channel');
            expect(conversation.contains(testClient.self)).to.be.true('#carabiner-private does not contain the bot but should');
        });

        it('should contain the correct #carabiner-solitary', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-solitary');

            expect(conversation, '#carabiner-solitary does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.GROUP, '#carabiner-solitary is not a private channel');
            expect(conversation.topic.exists).to.be.false('#carabiner-solitary has a conversation topic');
            expect(conversation.contains(testClient.self)).to.be.true('#carabiner-solitary does not contain the bot but should');

            if (conversation.members.size !== 1) {
                expect(conversation.members.size).to.equal(2, 'conversation has too many users');

                // Get the only other user in this conversation, i.e. the only other one whose ID is not mine
                // since members is a map of <ID, User>
                const other = conversation.members.get(
                    conversation.members
                        .keyArray()
                        .find(id => !(id === testClient.self.id))
                );

                expect(other, 'the other user could not be found').to.be.ok;
                expect(other).to.equal(conversation.creator);
            }
        });

        it('should emit chat message events when they are sent', async function(done) {
            this.timeout(5000);

            // We should have already found that general is non-null
            const conversation = testClient.conversations.find('name', 'general');

            testClient.api.rtm.once('message', (message: Message) => {
                expect(message).to.be.an.instanceOf(Message);
                expect(message.conversation).to.equal(conversation);
                expect(message.text).to.equal(mockData.message.chat);
                done();
            });

            try {
                await conversation.send(mockData.message.chat);
            } catch (e) {
                throw e;
            }
        });
    });
});