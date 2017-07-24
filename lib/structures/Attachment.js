const ObjectUtil = require('../util/ObjectUtil');
const config = require('../../config/attachments');

class Attachment{
    /**
     * Create a slack attachment object.
     * No build, json-ifying or any hocus-pocus necessary.
     * All of the properties on this object are the ones slack needs to see, so JSON.stringify makes it valid to send.
     * You may want to use this in conjunction with {@link Field}
     * @example
     * new Attachment()
     *  .setTitle('hello')
     *  .setText('world!')
     *  .setColor('#2196F3)
     *  .addField(new Field()...)
     */
    constructor() {}

    addField(field){
        if(!this.fields){
            this.fields = [];
        }

        this.fields.push(field);
        return this;
    }

    setFields(fields){
        this.fields = fields;
        return this;
    }

    addMarkdownField(field){
        if(!this.mrkdwn_in){
            this.mrkdwn_in = [];
        }

        this.mrkdwn_in.push(field);
        return this;
    }

    setMarkdownFields(fields){
        this.mrkdwn_in = fields;
        return this;
    }
}

ObjectUtil.generateSetters(Attachment, config.attachment_properties);

module.exports = Attachment;