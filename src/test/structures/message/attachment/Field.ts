import Field from '../../../../lib/structures/message/attachment/Field';
import mockData from '../../../mockData/field';
import { expect } from 'chai';

function assertGetterCorrect<T>(expectedValue: T, actualValue: T): void {
    expect(actualValue).to.equal(expectedValue);
}

describe('Structures', () => {
    describe('Field', () => {
        it('should have working getters and setters', () => {
            const field = new Field()
                .setTitle(mockData.title)
                .setShort(mockData.short)
                .setValue(mockData.value);

            assertGetterCorrect(mockData.title, field.getTitle());
            assertGetterCorrect(mockData.value, field.getValue());
            assertGetterCorrect(mockData.short, field.getShort());
        });

        it('should convert to JSON as the data slack wants directly', () => {
            const field = new Field()
                .setTitle(mockData.title)
                .setShort(mockData.short)
                .setValue(mockData.value);

            const expectedValue = JSON.stringify({ title: mockData.title, short: mockData.short, value: mockData.value });
            const actualValue = JSON.stringify(field);

            expect(actualValue).to.equal(expectedValue);
        });
    });
});