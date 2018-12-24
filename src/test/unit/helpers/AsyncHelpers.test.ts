import AsyncHelpers from '../../helpers/AsyncHelpers';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('AsyncHelpers', function () {
    describe('addTimeout', function () {
        it('should return the original value when the main promise completes before timeout', async function () {
            const symbol: Symbol = Symbol();
            const promise = new Promise(resolve => resolve(symbol));

            expect(AsyncHelpers.addTimeout(promise, 5000)).to.eventually.equal(symbol);
        });

        it('should throw a value when the main promise takes too long to execute', async function () {
            // intentionally empty
            const promise = new Promise(() => {});

            expect(AsyncHelpers.addTimeout(promise, 15)).to.eventually.be.rejected;
        });
    });
});