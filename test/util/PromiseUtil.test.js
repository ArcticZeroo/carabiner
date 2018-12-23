"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const PromiseUtil_1 = __importDefault(require("../../lib/util/PromiseUtil"));
describe('PromiseUtil', function () {
    describe('#pause', function () {
        it('pauses execution for at least as long as the requested time', async function () {
            const start = Date.now();
            await PromiseUtil_1.default.pause(500);
            const waitedTime = Date.now() - start;
            // We do it this way instead of exactly 500 because
            // the way JS' event loop works means we may be
            // waiting slightly more than 500ms. For no particular
            // reason, I'm giving the program an extra 10ms to resume
            // execution.
            chai_1.expect(waitedTime).to.be.at.least(500);
            chai_1.expect(waitedTime).to.be.lessThan(510);
        });
    });
});
//# sourceMappingURL=PromiseUtil.test.js.map