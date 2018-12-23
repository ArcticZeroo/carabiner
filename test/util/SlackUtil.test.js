"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const assert_1 = __importDefault(require("assert"));
const SlackUtil_1 = __importDefault(require("../../lib/util/SlackUtil"));
const mockData_1 = __importDefault(require("../mockData"));
describe('SlackUtil', function () {
    describe('#convertProperties', function () {
        it('works with no underscores', function () {
            const obj = { hello: 'world' };
            const converted = SlackUtil_1.default.convertProperties(obj);
            chai_1.expect(converted).to.have.property('hello', obj.hello);
        });
        it('works with one underscore', function () {
            const obj = { hello_world: 'yup' };
            const converted = SlackUtil_1.default.convertProperties(obj);
            chai_1.expect(converted).to.have.property('helloWorld', obj.hello_world);
            chai_1.expect(converted).not.to.have.property('hello_world');
        });
        it('works with more than one underscore', function () {
            const obj = { to_be_or_not_to_be: 'that is the question' };
            const converted = SlackUtil_1.default.convertProperties(obj);
            chai_1.expect(converted).to.have.property('toBeOrNotToBe', obj.to_be_or_not_to_be);
            chai_1.expect(converted).not.to.have.property('to_be_or_not_to_be');
        });
    });
    describe('#getDate', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;
            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            chai_1.expect(msAtTheTimeOfWritingThisTest).to.equal(SlackUtil_1.default.getDate(msAtTheTimeOfWritingThisTest / 1000).getTime());
        });
    });
    describe('#dateToSlack', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;
            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            assert_1.default.strictEqual(SlackUtil_1.default.dateToSlack(new Date(msAtTheTimeOfWritingThisTest)), msAtTheTimeOfWritingThisTest / 1000);
        });
    });
    describe('#getNextCursor', function () {
        it('returns null when res or res.response_metadata are null', function () {
            chai_1.expect(SlackUtil_1.default.getNextCursor(null)).to.be.null;
            // @ts-ignore - we intentionally want an object with weird literals
            chai_1.expect(SlackUtil_1.default.getNextCursor({ hello: 'world' })).to.be.null;
        });
        it('returns null when an invalid or no cursor is provided in response metadata', function () {
            chai_1.expect(SlackUtil_1.default.getNextCursor({ response_metadata: { next_cursor: null } })).to.be.null;
            chai_1.expect(SlackUtil_1.default.getNextCursor(mockData_1.default.slackResponse.invalidCursor)).to.be.null;
        });
        it('returns the next cursor when it is provided', function () {
            chai_1.expect(SlackUtil_1.default.getNextCursor(mockData_1.default.slackResponse.validCursor)).to.equal(mockData_1.default.slackResponse.validCursor.response_metadata.next_cursor);
        });
    });
    describe('#getNextPage', function () {
        it('returns null when the last response had no valid cursor (i.e. no args provided/null res/end of pages)', async function () {
            // @ts-ignore - Because the cursor is null we don't care that there is no method being passed,
            // it's not called after getNextCursor returns null
            chai_1.expect(await SlackUtil_1.default.getNextPage({ res: null })).to.be.null;
        });
        const limit = 50;
        const res = mockData_1.default.slackResponse.validCursor;
        it('calls the method when cursor is not null, with the proper limit and cursor', function () {
            return new Promise(resolve => SlackUtil_1.default.getNextPage({
                res, limit,
                // This has to be async since getNextPage assumes it returns a promise
                async method({ limit: methodLimit, cursor: methodCursor }) {
                    chai_1.expect(methodLimit).to.equal(limit);
                    chai_1.expect(methodCursor).to.equal(res.response_metadata.next_cursor);
                    resolve();
                }
            }));
        });
        it('returns the value provided by method() call', async function () {
            // This has to be async since getNextPage assumes it returns a promise
            const method = async () => 'hello';
            const promise = SlackUtil_1.default.getNextPage({ res, limit, method });
            const returnValue = await promise;
            chai_1.expect(returnValue).to.equal('hello');
        });
    });
    describe('#getPages', function () {
        it('properly calls the method at least once', function () {
            return new Promise(resolve => SlackUtil_1.default.getPages({
                async method() { resolve(); },
                transformData() { return { res: mockData_1.default.slackResponse.invalidCursor }; },
                combine: false
            }));
        });
        it('calls the method until cursor is null', async function () {
            let hitCount = 0;
            await SlackUtil_1.default.getPages({
                async method() {
                    if (hitCount === 2) {
                        return mockData_1.default.slackResponse.invalidCursor;
                    }
                    hitCount++;
                    return mockData_1.default.slackResponse.validCursor;
                },
                transformData() {
                    return { count: hitCount };
                },
                combine: false
            });
            chai_1.expect(hitCount).to.equal(2);
        });
        it('stops calling the method when the page limit is hit', async function () {
            const pageLimit = 5;
            let hitCount = 0;
            await SlackUtil_1.default.getPages({
                async method() {
                    if (hitCount === 10) {
                        return mockData_1.default.slackResponse.invalidCursor;
                    }
                    hitCount++;
                    return mockData_1.default.slackResponse.validCursor;
                },
                transformData() {
                    return { count: hitCount };
                },
                combine: false,
                pageLimit
            });
            chai_1.expect(hitCount).to.equal(pageLimit);
        });
        it('combines all pages when each page is an array, by flattening them one layer', async function () {
            const pageLimit = 5;
            let hitCount = 0;
            const pages = await SlackUtil_1.default.getPages({
                async method() {
                    if (hitCount === 10) {
                        return mockData_1.default.slackResponse.invalidCursor;
                    }
                    hitCount++;
                    return mockData_1.default.slackResponse.validCursor;
                },
                transformData() {
                    return [hitCount];
                },
                combine: true,
                pageLimit
            });
            chai_1.expect(pages).to.have.length(pageLimit);
            chai_1.expect(pages).to.have.members([1, 2, 3, 4, 5]);
        });
    });
});
//# sourceMappingURL=SlackUtil.test.js.map