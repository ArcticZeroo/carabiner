import { expect } from 'chai';

import SlackUtil from '../../../lib/util/SlackUtil';
import mockData from '../../mockData/primary';

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

    describe('#slackToDate', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;

            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            expect(msAtTheTimeOfWritingThisTest).to.equal(SlackUtil.slackToDate((msAtTheTimeOfWritingThisTest / 1000).toFixed(6)).getTime());
        });
    });

    describe('#dateToSlack', function () {
        it('converts a date properly', function () {
            const msAtTheTimeOfWritingThisTest = 1530817774278;

            // Slack dates are the same as Date.now() / 1000 basically
            // this is simple math yes, but could become more complex in the future somehow. idunno
            expect(SlackUtil.dateToSlack(new Date(msAtTheTimeOfWritingThisTest))).to.equal((msAtTheTimeOfWritingThisTest / 1000).toFixed(6));
        });
    });

    describe('#getNextCursor', function () {
        it('returns null when res or res.response_metadata are null', function () {
            expect(SlackUtil.getNextCursor(null)).to.be.null;
            // @ts-ignore - we intentionally want an object with weird literals
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
        it('returns null when the last response had no valid cursor (i.e. no args provided/null res/end of pages)', async function () {
            // @ts-ignore - Because the cursor is null we don't care that there is no method being passed,
            // it's not called after getNextCursor returns null
            expect(await SlackUtil.getNextPage({ res: null })).to.be.null;
        });

        const limit = 50;
        const res = mockData.slackResponse.validCursor;

        it('calls the method when cursor is not null, with the proper limit and cursor', function () {
            return new Promise(resolve => SlackUtil.getNextPage({
                res, limit,
                // This has to be async since getNextPage assumes it returns a promise
                async method({ limit: methodLimit, cursor: methodCursor }) {
                    expect(methodLimit).to.equal(limit);
                    expect(methodCursor).to.equal(res.response_metadata.next_cursor);
                    resolve();
                }
            }));
        });

        it('returns the value provided by method() call', async function () {
            // This has to be async since getNextPage assumes it returns a promise
            const method = async () => 'hello';

            const promise = SlackUtil.getNextPage({ res, limit, method });

            const returnValue = await promise;

            expect(returnValue).to.equal('hello');
        });
    });

    describe('#getPages', function () {
        it('properly calls the method at least once', function () {
            return new Promise(resolve => SlackUtil.getPages({
                async method() { resolve(); },
                transformData() { return { res: mockData.slackResponse.invalidCursor }; },
                combine: false
            }));
        });

        it('calls the method until cursor is null', async function () {
            let hitCount = 0;

            await SlackUtil.getPages({
                async method() {
                    if (hitCount === 2) {
                        return mockData.slackResponse.invalidCursor;
                    }

                    hitCount++;

                    return mockData.slackResponse.validCursor;
                },
                transformData() {
                    return { count: hitCount };
                },
                combine: false
            });

            expect(hitCount).to.equal(2);
        });

        it('stops calling the method when the page limit is hit', async function () {
            const pageLimit = 5;
            let hitCount = 0;

            await SlackUtil.getPages({
                async method() {
                    if (hitCount === 10) {
                        return mockData.slackResponse.invalidCursor;
                    }

                    hitCount++;

                    return mockData.slackResponse.validCursor;
                },
                transformData() {
                    return { count: hitCount };
                },
                combine: false,
                pageLimit
            });

            expect(hitCount).to.equal(pageLimit);
        });

        it('combines all pages when each page is an array, by flattening them one layer', async function () {
            const pageLimit = 5;
            let hitCount = 0;

            const pages = await SlackUtil.getPages({
                async method() {
                    if (hitCount === 10) {
                        return mockData.slackResponse.invalidCursor;
                    }

                    hitCount++;

                    return mockData.slackResponse.validCursor;
                },
                transformData() {
                    return [ hitCount ];
                },
                combine: true,
                pageLimit
            });

            expect(pages).to.have.length(pageLimit);
            expect(pages).to.have.members([1, 2, 3, 4, 5]);
        });
    });
});