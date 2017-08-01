const { assert } = require('chai');
const Client = require('../lib/client/Client');

describe('Carabiner', function () {
    describe('Web API', function () {
        const client = new Client(process.env.SLACK_TOKEN);

        it('should return an object when making slack requests', async function () {
            assert.typeOf((await client.api.methods.api.test()), 'object');
        });
    });
});