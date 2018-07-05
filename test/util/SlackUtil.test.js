const { expect } = require('chai');
const assert = require('assert');
const SlackUtil = require('../../lib/util/SlackUtil');
const mockData = require('../mockData');

describe('SlackUtil', function () {
    describe('#convertProperties', function () {
        it('works with no underscores', function () {
            const obj = { hello: 'world' };
            const converted = SlackUtil.convertProperties(obj);

            expect(converted).to.have.property('hello', obj.hello);
        });

        it('works with one underscore', function () {
            const obj = { hello_world: 'yup' };
            const converted = SlackUtil.convertProperties(obj);

            expect(converted).to.have.property('helloWorld', obj.hello_world);
            expect(converted).not.to.have.property('hello_world');
        });

        it('works with more than one underscore', function () {
            const obj = { to_be_or_not_to_be: 'that is the question' };
            const converted = SlackUtil.convertProperties(obj);

            expect(converted).to.have.property('toBeOrNotToBe', obj.to_be_or_not_to_be);
            expect(converted).not.to.have.property('to_be_or_not_to_be');
        });
    });

    describe('#getDate', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;

            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            expect(msAtTheTimeOfWritingThisTest).to.equal(SlackUtil.getDate(msAtTheTimeOfWritingThisTest / 1000).getTime());
        });
    });

    describe('#dateToSlack', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;

            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            assert.strictEqual(SlackUtil.dateToSlack(new Date(msAtTheTimeOfWritingThisTest)), msAtTheTimeOfWritingThisTest / 1000);
        });
    });

    describe('#getNextCursor', function () {
        it('returns null when res or res.response_metadata are null', function () {
            expect(SlackUtil.getNextCursor(null)).to.be.null;
            expect(SlackUtil.getNextCursor({ hello: 'world' })).to.be.null;
        });

        it('returns null when an invalid or no cursor is provided in response metadata', function () {
            expect(SlackUtil.getNextCursor({ response_metadata: { next_cursor: null } })).to.be.null;
            expect(SlackUtil.getNextCursor(mockData.slackResponse.invalidCursor)).to.be.null;
        });

        it('returns the next cursor when it is provided', function () {
            expect(SlackUtil.getNextCursor(mockData.slackResponse.validCursor)).to.equal(mockData.slackResponse.validCursor.response_metadata.next_cursor);
        });
    });

    describe('#getNextPage', function () {
        it('returns null when the last response had no valid cursor (i.e. no args provided/null res/end of pages)', function () {
            expect(SlackUtil.getNextPage({})).to.be.null;
        });

        const limit = 50;
        const res = mockData.slackResponse.validCursor;

        it('calls the method when cursor is not null, with the proper limit and cursor', function () {
            const getData = () => null;

            return new Promise(resolve => SlackUtil.getNextPage({
                res, limit, getData,
                // This has to be async since getNextPage assumes it returns a promise
                async method () { resolve(); }
            }));
        });

        it('calls getData and returns the transformed value', async function () {
            const getData = () => mockData.pages.getDataReturn;

            const promise = new Promise(resolve => SlackUtil.getNextPage({
                res, limit, getData,
                // This has to be async since getNextPage assumes it returns a promise
                async method () { resolve(); }
            }));

            const returnValue = await promise;

            expect(returnValue).to.equal(mockData.pages.getDataReturn);
        });
    });
});