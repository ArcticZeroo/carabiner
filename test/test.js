const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;
chai.should();

const Client = require('../lib/client/Client');

describe('Carabiner', function () {
    describe('Web API', function () {
        const client = new Client(process.env.SLACK_TOKEN);

        it('should throw an error when slack does', async function () {
            const nullClient = new Client('invalid slack token');

            return nullClient.api.methods.api.test().should.be.rejected;
        });

        it('should return an object when making slack requests', async function () {
            return client.api.methods.api.test().should.eventually.be.an('object');
        });
    });
});