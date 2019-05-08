import { expect } from 'chai';
import ObjectUtil from '../../../lib/util/ObjectUtil';

describe('ObjectUtil', function () {
    describe('#generateSetters', function () {
        it('generates a getter and setter value properly', function () {
            interface BaseClass {
                my_prop: string;
                setMyProp(prop: string): void;
                getMyProp(): string;
            }

            class BaseClass {}

            ObjectUtil.generateSetters(BaseClass, ['my_prop']);

            expect(BaseClass.prototype).to.have.property('setMyProp');
            expect(BaseClass.prototype.setMyProp).to.be.a('function');
            expect(BaseClass.prototype).to.have.property('getMyProp');
            expect(BaseClass.prototype.getMyProp).to.be.a('function');
            expect(BaseClass.prototype).to.have.property('my_prop', null);
        });

        it('generates WORKING getters and setters', function () {
            interface BaseClass {
                my_prop: string;
                setMyProp(prop: string): void;
                getMyProp(): string;
            }

            class BaseClass {}

            ObjectUtil.generateSetters(BaseClass, ['my_prop']);

            const baseObj = new BaseClass();

            baseObj.setMyProp('duck');

            expect(baseObj.getMyProp()).to.equal('duck');
            expect(baseObj.my_prop).to.equal('duck');
        });
    });

    describe('#hasNullValue', function () {
        it('works on an object with null value', function () {
            expect(ObjectUtil.hasNullValue({ yellow: null, peach: true })).to.be.true;
        });

        it('works on an object without null value', function () {
            expect(ObjectUtil.hasNullValue({ yellow: false, peach: true })).to.be.false;
        });

        it('treats undefined as null', function () {
            expect(ObjectUtil.hasNullValue({ yellow: undefined, peach: true })).to.be.true;
        });
    });
});