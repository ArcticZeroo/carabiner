import { expect } from 'chai';
import PromiseUtil from '../../lib/util/PromiseUtil';

describe('PromiseUtil', function () {
    describe('#pause', function () {
        it('pauses execution for at least as long as the requested time', async function () {
            const start = Date.now();

            await PromiseUtil.pause(500);

            const waitedTime = Date.now() - start;

            // We do it this way instead of exactly 500 because
            // the way JS' event loop works means we may be
            // waiting slightly more than 500ms. For no particular
            // reason, I'm giving the program an extra 10ms to resume
            // execution.
            expect(waitedTime).to.be.at.least(500);
            expect(waitedTime).to.be.lessThan(510);
        });
    });
});