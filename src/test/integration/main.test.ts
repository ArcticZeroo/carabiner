/* eslint-disable no-unused-vars,no-console */
import methods from '../../config/methods';
import SlackWebAPI from '../../lib/api/SlackWebAPI';
import SlackAuthenticationException from '../../lib/exception/SlackAuthenticationException';
import Message from '../../lib/structures/message/Message';
import AsyncHelpers from '../helpers/AsyncHelpers';
import mockData from '../mockData/primary';
import mockMessageData from '../mockData/message';
import mockConversationData from '../mockData/conversation';
import Client, { IClientOptions } from '../../lib/client/Client';
import ConversationType from '../../lib/enum/ConversationType';
import User from '../../lib/structures/user/User';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Conversation } from '../../lib/structures';

chai.use(chaiAsPromised);

function createClient(options?: IClientOptions): Client {
    return new Client(process.env.SLACK_TOKEN, options);
}

process.on('unhandledRejection', console.error);

describe('Carabiner', function () {
    let mainClient: Client;

    before(function () {
        expect(process.env.SLACK_TOKEN).to.be.a('string', 'Slack token should be set in environment variables');

        mainClient = createClient();
    });

    describe('SlackWebAPI Generation', function () {
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
            const nullWebApi = new SlackWebAPI('invalid slack token');

            return AsyncHelpers.shouldThrowAny(nullWebApi.methods.auth.test());
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
            const client = createClient();

            const promise = new Promise((resolve, reject) => {
                client.api.rtm.once('event', resolve);
                client.api.rtm.once('error', reject);
            });

            try {
                await client.api.rtm.connect();
            } catch (e) {
                client.api.rtm.destroy();
                throw e;
            }

            return AsyncHelpers.addTimeout(promise, 2000).finally(() => client.api.rtm.destroy());
        });
    });

    describe('Client', async function () {
        describe('constructor assignments', () => {

        });

        describe('init', async function () {
            it('should throw a slack authentication error when auth is invalid', async function () {
                this.timeout(5000);

                const client = new Client(mockData.client.token);

                // TODO: See if chai has a better way of doing this
                // await AsyncHelpers.doesThrow(client.init(), SlackAuthenticationException);
                expect(client.init()).to.eventually.be.rejectedWith(SlackAuthenticationException);
            });

            it('should successfully cache objects without RTM', async function () {
                this.timeout(10000);

                const client = createClient({ rtm: false });

                await client.init();

                // If length is 0 or id is null then it did not properly cache the item
                expect(client.conversations.size).to.be.greaterThan(0);
                expect(client.users.size).to.be.greaterThan(0);
                expect(client.team.id).to.be.ok;
                expect(client.self.id).to.be.ok;
                expect(client.users.has(client.self.id)).to.be.true;
            });

            it('should connect to rtm automatically with rtm.start', async function () {
                // This can take a while sometimes
                this.timeout(10000);

                const client = createClient({ useRtmStart: true });

                try {
                    await client.init();
                } catch (e) {
                    throw e;
                }

                const promise = new Promise(resolve => {
                    client.api.rtm.once('open', resolve);
                });

                return AsyncHelpers.addTimeout(promise, 10000).finally(() => client.api.rtm.destroy());
            });

            it('should connect to rtm automatically with rtm.connect', async function () {
                // This can take a while sometimes
                this.timeout(10000);

                const client = createClient({ rtm: true, useRtmStart: false });

                try {
                    await client.init();
                } catch (e) {
                    throw e;
                }

                const promise = new Promise(resolve => {
                    client.api.rtm.once('open', resolve);
                });

                return AsyncHelpers.addTimeout(promise, 10000).finally(() => client.api.rtm.destroy());
            });
        });

        describe('RTM event extension', function() {
            let client: Client;

            before(function() {
                client = createClient({ rtm: false });

                client.conversations.set(
                    mockMessageData.chatMessage.channel,
                    new Conversation(client, mockConversationData.channel)
                );

                // @ts-ignore - We need to force this to test whether the extension works as expected.
                // this is normally a private method because no outside user should be allowed to accidentally
                // register all the handlers twice, and this method makes no checks against doing so.
                client._extendRtmEvents();
            });

            describe('Messages', async function () {
                it('should properly extend basic chat messages', function () {
                    const promise = AsyncHelpers.resolveWhenEmitterEmits({
                        emitter: client,
                        event: 'message'
                    });

                    client.api.rtm.emit('message', mockMessageData.chatMessage);

                    return AsyncHelpers.addTimeout(promise, 10);
                });

                it('should construct a basic chat message when emitted', async function () {
                    // @ts-ignore
                    const promise: Promise<[Message]> = AsyncHelpers.resolveWhenEmitterEmits({
                        emitter: client,
                        event: 'message'
                    });

                    const expectedMessage: Message = new Message(client, mockMessageData.chatMessage);

                    client.api.rtm.emit('message', mockMessageData.chatMessage);

                    const [emittedMessage] = await promise;

                    expect(emittedMessage)
                        .to.be.ok
                        .and.to.be.instanceOf(Message);

                    expect(emittedMessage.isSameAs(expectedMessage)).to.be.true;
                });
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
            this.timeout(20000);

            testClient = createClient({ rtm: true });

            return testClient.init();
        });

        after(() => testClient.destroy());

        it('should recognize the self as a bot', function () {
            expect(testClient.self.isBot, 'User is not recognized as a bot').to.be.true;
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
            expect(conversation.contains(testClient.self), '#general does not contain the bot but should').to.be.true;
        });

        it('should contain the correct #random', function () {
            const conversation = testClient.conversations.find('name', 'random');

            expect(conversation, '#random does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.CHANNEL, '#random is not a public channel');
            expect(conversation.topic.value).to.equal('Non-work banter and water cooler conversation', 'incorrect topic');
            expect(conversation.contains(testClient.self), '#random does contain the bot but should not').to.be.false;
        });

        it('should contain the correct #carabiner-private', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-private');

            expect(conversation, '#carabiner-private does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.GROUP, '#carabiner-private is not a private channel');
            expect(conversation.contains(testClient.self), '#carabiner-private does not contain the bot but should').to.be.true;
        });

        it('should contain the correct #carabiner-solitary', function () {
            const conversation = testClient.conversations.find('name', 'carabiner-solitary');

            expect(conversation, '#carabiner-solitary does not exist').to.be.ok;
            expect(conversation.type).to.equal(ConversationType.GROUP, '#carabiner-solitary is not a private channel');
            expect(conversation.topic.exists, '#carabiner-solitary has a conversation topic').to.be.false;
            expect(conversation.contains(testClient.self), '#carabiner-solitary does not contain the bot but should').to.be.true;

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
            this.timeout(10000);

            expect(testClient.api.rtm.isConnected, 'RTM is not connected').to.be.true;

            // We should have already found that general is non-null
            const conversation = testClient.conversations.find('name', 'general');

            testClient.api.rtm.once('message', (message: Message) => {
                expect(message).to.be.an.instanceOf(Message);
                expect(message.conversation).to.equal(conversation);
                expect(message.text).to.equal(mockData.text.chat);
                done();
            });

            try {
                await conversation.send(mockData.text.chat);
            } catch (e) {
                throw e;
            }
        });
    });
});