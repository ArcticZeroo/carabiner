"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ObjectUtil_1 = __importDefault(require("../../lib/util/ObjectUtil"));
describe('ObjectUtil', function () {
    describe('#generateSetters', function () {
        it('generates a getter and setter value properly', function () {
            class BaseClass {
            }
            ObjectUtil_1.default.generateSetters(BaseClass, ['my_prop']);
            chai_1.expect(BaseClass.prototype).to.have.property('setMyProp');
            chai_1.expect(BaseClass.prototype.setMyProp).to.be.a('function');
            chai_1.expect(BaseClass.prototype).to.have.property('getMyProp');
            chai_1.expect(BaseClass.prototype.getMyProp).to.be.a('function');
            chai_1.expect(BaseClass.prototype).to.have.property('my_prop', null);
        });
        it('generates WORKING getters and setters', function () {
            class BaseClass {
            }
            ObjectUtil_1.default.generateSetters(BaseClass, ['my_prop']);
            const baseObj = new BaseClass();
            baseObj.setMyProp('duck');
            chai_1.expect(baseObj.getMyProp()).to.equal('duck');
            chai_1.expect(baseObj.my_prop).to.equal('duck');
        });
    });
    describe('#hasNullValue', function () {
        it('works on an object with null value', function () {
            chai_1.expect(ObjectUtil_1.default.hasNullValue({ yellow: null, peach: true })).to.be.true;
        });
        it('works on an object without null value', function () {
            chai_1.expect(ObjectUtil_1.default.hasNullValue({ yellow: false, peach: true })).to.be.false;
        });
        it('treats undefined as null', function () {
            chai_1.expect(ObjectUtil_1.default.hasNullValue({ yellow: undefined, peach: true })).to.be.true;
        });
    });
});
//# sourceMappingURL=ObjectUtil.test.js.map