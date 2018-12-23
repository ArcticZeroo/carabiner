"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const StringUtil_1 = __importDefault(require("../../lib/util/StringUtil"));
describe('StringUtil', function () {
    describe('#capitalize', function () {
        it('works on an all-lowercase string', function () {
            chai_1.expect(StringUtil_1.default.capitalize('rabbit')).to.equal('Rabbit');
        });
        it('works on an all-uppercase string', function () {
            chai_1.expect(StringUtil_1.default.capitalize('MONGOOSE')).to.equal('Mongoose');
        });
        it('works on a mixed case string', function () {
            chai_1.expect(StringUtil_1.default.capitalize('sPoNgEbOb')).to.equal('Spongebob');
        });
    });
});
//# sourceMappingURL=StringUtil.test.js.map