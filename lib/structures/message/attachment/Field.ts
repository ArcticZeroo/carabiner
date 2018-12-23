const ObjectUtil = require('../../../util/ObjectUtil');
const config = require('../../../../config/attachments');

// That's right, nothing is here.
class Field {
    /**
     * Create a slack field object.
     * No build, json-ifying or any hocus-pocus necessary.
     * All of the properties on this object are the ones slack needs to see, so JSON.stringify makes it valid to send.
     * Use this in conjunction with {@link Attachment}
     * All methods are chainable.
     * @example
     * new Field()
     *  .setShort(true)
     *  .setTitle('hi')
     *  .setValue(':)')
     */
    constructor() {}
}

/**
 * @name Field#setTitle
 * @function
 * @memberOf Field
 * @description Set title text
 * @param {string} val - text to set
 * @return {Field}
 */
/**
 * @name Field#setValue
 * @function
 * @memberOf Field
 * @description Set the value of this field
 * @param {string} val - text to set
 * @return {Field}
 */
/**
 * @name Field#setShort
 * @function
 * @memberOf Field
 * @description Set whether this field should be short
 * @param {boolean} val - Whether this field should be considered 'short'
 * @return {Field}
 */

/**
 * @name Field#getTitle
 * @function
 * @memberOf Field
 * @description Get title text
 * @return {string}
 */
/**
 * @name Field#getValue
 * @function
 * @memberOf Field
 * @description Get value text
 * @return {string}
 */
/**
 * @name Field#getShort
 * @function
 * @memberOf Field
 * @description Get whether this field is short
 * @return {boolean}
 */

ObjectUtil.generateSetters(Field, config.fieldProperties);

export default Field;