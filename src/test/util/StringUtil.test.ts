import { expect } from 'chai';
import StringUtil from '../../lib/util/StringUtil';

describe('StringUtil', function () {
    describe('#capitalize', function () {
        it('works on an all-lowercase string', function () {
            expect(StringUtil.capitalize('rabbit')).to.equal('Rabbit');
        });

        it('works on an all-uppercase string', function () {
            expect(StringUtil.capitalize('MONGOOSE')).to.equal('Mongoose');
        });

        it('works on a mixed case string', function () {
            expect(StringUtil.capitalize('sPoNgEbOb')).to.equal('Spongebob');
        });
    });
});