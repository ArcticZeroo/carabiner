export default class AsyncHelpers {
    static async shouldThrowAny(promise: Promise<any>): Promise<void> {
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
    }

    static async doesThrow(promise: Promise<any>, error: new () => Error = Error): Promise<boolean> {
        try {
            await promise;
        } catch (e) {
            if (e instanceof error) {
                return true;
            }
        }
        return false;
    }

    static pause(ms: number): Promise<void> {
        return new Promise((resolve: () => void) => setTimeout(resolve, ms));
    }

    static addTimeout<T>(promise: Promise<T>, timeout: number): Promise<T | null> {
        return new Promise((resolve, reject) => {
            Promise.race([
                promise,
                new Promise((_, reject) => AsyncHelpers
                    .pause(timeout)
                    .then(() => reject(new Error(`Promise timed out in ${timeout} ms`)))
                )
            ]).then(resolve, reject);
        });
    }

    private static _timeoutSymbol = Symbol();
}