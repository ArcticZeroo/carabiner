import { EventEmitter } from 'events';
import AsyncHelpers from '../../helpers/AsyncHelpers';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('AsyncHelpers', function () {
    describe('shouldThrowAny', function () {
        it('should throw when the promise resolves normally', function () {
            expect(AsyncHelpers.shouldThrowAny(Promise.resolve())).to.eventually.be.rejected;
        });

        it('should fulfill properly when the promise throws any exception', function () {
            expect(AsyncHelpers.shouldThrowAny(Promise.reject())).to.eventually.be.fulfilled;
        });
    });

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

    describe('resolveWhenEmitterEmits', function () {
        let emitter: EventEmitter;

        beforeEach(function () {
            if (emitter) {
                emitter.removeAllListeners();
            }

            emitter = new EventEmitter();
        });

        it('properly resolves when no expected data is passed', async function () {
            const event = 'testEvent';

            const promise = AsyncHelpers.resolveWhenEmitterEmits({ emitter, event });

            emitter.emit(event);

            return promise;
        });

        it('properly resolves when expected data is passed and matches', async function () {
            const event = 'testEvent';
            const expectedData: any[] = [true, 1, 'random string'];

            const promise = AsyncHelpers.resolveWhenEmitterEmits({ emitter, event, expectedData });

            emitter.emit(event, ...expectedData);

            return promise;
        });

        it('rejects when expected data is passed but there is no emitted data at all', async function () {
            const event = 'testEvent';
            const expectedData: any[] = [true, 1, 'random string'];

            const promise = AsyncHelpers.resolveWhenEmitterEmits({ emitter, event, expectedData });

            emitter.emit(event);

            return AsyncHelpers.shouldThrowAny(promise);
        });

        it('rejects when expected data is passed and the emitted data has the right size, but the emitted data does not match', async function () {
            const event = 'testEvent';
            const expectedData: any[] = [true, 1, 'random string'];

            const promise = AsyncHelpers.resolveWhenEmitterEmits({ emitter, event, expectedData });

            emitter.emit(event, false, -1, 'other random string');

            return AsyncHelpers.shouldThrowAny(promise);
        });

        it('rejects when expected data is passed, the emitted data has all members of the expected data, but emitted has an extra member', async function () {
            const event = 'testEvent';
            const expectedData: any[] = [true, 1, 'random string'];

            const promise = AsyncHelpers.resolveWhenEmitterEmits({ emitter, event, expectedData });

            emitter.emit(event, ...expectedData, 'another random string');

            return AsyncHelpers.shouldThrowAny(promise);
        });

        it('never resolves if the event is never emitted', async function () {
            const event = 'testEvent';

            return AsyncHelpers.shouldThrowAny(AsyncHelpers.addTimeout(AsyncHelpers.resolveWhenEmitterEmits({ emitter, event }), 10));
        });
    });
});