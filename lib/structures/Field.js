const ObjectUtil = require('../util/ObjectUtil');
const config = require('../../config/attachments');

// That's right, nothing is here.
class Field {
    /**
     * Create a slack field object.
     * No build, json-ifying or any hocus-pocus necessary.
     * All of the properties on this object are the ones slack needs to see, so JSON.stringify makes it valid to send.
     * Use this in conjunction with {@link Attachment}
     * @example
     * new Field()
     *  .setShort(true)
     *  .setTitle('hi')
     *  .setValue(':)')
     */
    constructor() {}
}

ObjectUtil.generateSetters(Field, config.field_properties);

module.exports = Field;