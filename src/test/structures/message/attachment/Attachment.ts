import Attachment from '../../../../lib/structures/message/attachment/Attachment';
import mockData from '../../../mockData/attachment';
import { expect } from 'chai';

describe('Structures', () => {
    describe('Attachment', () => {
        it('should have working getters and setters', () => {
            const attachment = new Attachment();

            attachment.setText(mockData.text);

            const actualResult = attachment.getText();
            expect(actualResult)
                .to.not.be.null
                .and.to.equal(mockData.text);
        });

        it('should not have a markdown field property until the method is first called', () => {
            const attachment = new Attachment();

            // noinspection BadExpressionStatementJS - expect is not supposed to be an assignment or call. OK is alright
            expect(attachment.mrkdwn_in).to.not.be.ok;

            attachment.addMarkdownField('some markdown field');

            expect(attachment.mrkdwn_in)
                .to.be.an('array')
                .with.length(1);
        });

        it('should properly add markdown fields', () => {
            const attachment = new Attachment();

            const expectedMarkdownField = 'testMarkdownField';
            attachment.addMarkdownField(expectedMarkdownField);

            expect(attachment.mrkdwn_in)
                .to.have.length(1)
                .and.to.include(expectedMarkdownField);
        });

        it('should convert to JSON as the data slack wants directly', () => {
            const attachment = new Attachment()
                .setTitle(mockData.title)
                .setText(mockData.text)
                .setColor(mockData.color);

            const expectedResult = JSON.stringify(mockData);
            const actualResult = JSON.stringify(attachment);

            expect(expectedResult)
                .to.equal(actualResult);
        });
    });
});