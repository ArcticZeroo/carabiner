const { expect } = require('chai');
const ObjectUtil = require('../../lib/util/ObjectUtil');

describe('ObjectUtil', function () {
    describe('#generateSetters', function () {
        it('generates a getter and setter value properly', function () {
            class BaseClass {}

            ObjectUtil.generateSetters(BaseClass, ['my_prop']);

            expect(BaseClass.prototype).to.have.property('setMyProp');
            expect(BaseClass.prototype.setMyProp).to.be.a('function');
            expect(BaseClass.prototype).to.have.property('getMyProp');
            expect(BaseClass.prototype.getMyProp).to.be.a('function');
            expect(BaseClass.prototype).to.have.property('my_prop', null);
        });

        it('generates WORKING getters and setters', function () {
            class BaseClass {}

            ObjectUtil.generateSetters(BaseClass, ['my_prop']);

            const baseObj = new BaseClass();

            baseObj.setMyProp('duck');

            expect(baseObj.getMyProp()).to.equal('duck');
            expect(baseObj.my_prop).to.equal('duck');
        });
    });
});