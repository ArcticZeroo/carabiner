const ObjectUtil = require('../../../util/ObjectUtil');
const config = require('../../../../config/attachments');
const Field = require('./Field');

class Attachment{
    /**
     * Create a slack attachment object.
     * No build, json-ifying or any hocus-pocus necessary.
     * All of the properties on this object are the ones slack needs to see, so JSON.stringify makes it valid to send.
     * All methods are chainable.
     * It's essentially a builder, but you don't need to ever build it.
     *
     * @example
     * new Attachment()
     *  .setTitle('hello')
     *  .setText('world!')
     *  .setColor('#2196F3')
     *  .addField(new Field()...)
     */
    constructor() {}

    /**
     *
     * @param {Field|string} field - The field to add, or the field's title.
     * @param {string} [value] - The value of the field, if the field param is a string
     * @param {boolean} [short] - Whether the field should be short, if the field param is a string
     * @return {Attachment}
     */
    addField(field, value, short){
        if(!this.fields){
            this.fields = [];
        }

        if (field instanceof Field) {
            this.fields.push(field);
        } else {
            this.fields.push(
                new Field()
                    .setTitle(field)
                    .setValue(value)
                    .setShort(short)
            );
        }

        return this;
    }

    /**
     * Set fields on this attachment.
     * @param {Array.<Field>} fields - Fields to set.
     * @return {Attachment}
     */
    setFields(fields){
        this.fields = fields;
        return this;
    }

    /**
     * Get fields for this attachment.
     * @return {Array|Array.<Field>}
     */
    getFields() {
        return this.fields;
    }

    /**
     * Add a markdown field to this attachment.
     * @param {string} field - The slack field to add a markdown field to. Consult slack docs.
     * @return {Attachment}
     */
    addMarkdownField(field){
        if(!this.mrkdwn_in){
            this.mrkdwn_in = [];
        }

        this.mrkdwn_in.push(field);
        return this;
    }

    /**
     * Set markdown fields for this attachment.
     * @param {Array.<string>} fields - Fields to set.
     * @return {Attachment}
     */
    setMarkdownFields(fields){
        this.mrkdwn_in = fields;
        return this;
    }
}

/**
 * @name Attachment#setFallback
 * @function
 * @memberOf Attachment
 * @description Set fallback text
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setColor
 * @function
 * @memberOf Attachment
 * @description Set color
 * @param {string} val - color to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setPretext
 * @function
 * @memberOf Attachment
 * @description Set pretext
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setAuthorName
 * @function
 * @memberOf Attachment
 * @description Set author name
 * @param {string} val - name to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setAuthorLink
 * @function
 * @memberOf Attachment
 * @description Set author link
 * @param {string} val - link to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setAuthorIcon
 * @function
 * @memberOf Attachment
 * @description Set author icon
 * @param {string} val - Icon to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setTitle
 * @function
 * @memberOf Attachment
 * @description Set title
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setTitleLink
 * @function
 * @memberOf Attachment
 * @description Set title link
 * @param {string} val - link to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setText
 * @function
 * @memberOf Attachment
 * @description Set text
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setImageUrl
 * @function
 * @memberOf Attachment
 * @description Set image url
 * @param {string} val - url to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setThumbUrl
 * @function
 * @memberOf Attachment
 * @description Set thumb url
 * @param {string} val - url to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setFooter
 * @function
 * @memberOf Attachment
 * @description Set footer text
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setFooterIcon
 * @function
 * @memberOf Attachment
 * @description Set footer icon
 * @param {string} val - icon to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setTs
 * @function
 * @memberOf Attachment
 * @description Set timestamp
 * @param {string} val - text to set
 * @return {Attachment}
 */
/**
 * @name Attachment#setTimestamp
 * @function
 * @memberOf Attachment
 * @description Set timestamp
 * @param {string} val - text to set
 * @return {Attachment}
 */

/**
 * @name Attachment#getFallback
 * @function
 * @memberOf Attachment
 * @description Get fallback text
 * @return {string}
 */
/**
 * @name Attachment#getColor
 * @function
 * @memberOf Attachment
 * @description Get color
 * @return {string}
 */
/**
 * @name Attachment#getPretext
 * @function
 * @memberOf Attachment
 * @description Get pretext
 * @return {string}
 */
/**
 * @name Attachment#getAuthorName
 * @function
 * @memberOf Attachment
 * @description Get author name
 * @return {string}
 */
/**
 * @name Attachment#getAuthorLink
 * @function
 * @memberOf Attachment
 * @description Get author link
 * @return {string}
 */
/**
 * @name Attachment#getAuthorIcon
 * @function
 * @memberOf Attachment
 * @description Get author icon
 * @return {string}
 */
/**
 * @name Attachment#getTitle
 * @function
 * @memberOf Attachment
 * @description Get title
 * @return {string}
 */
/**
 * @name Attachment#getTitleLink
 * @function
 * @memberOf Attachment
 * @description Get title link
 * @return {string}
 */
/**
 * @name Attachment#getText
 * @function
 * @memberOf Attachment
 * @description Get text
 * @return {string}
 */
/**
 * @name Attachment#getImageUrl
 * @function
 * @memberOf Attachment
 * @description Get image url
 * @return {string}
 */
/**
 * @name Attachment#getThumbUrl
 * @function
 * @memberOf Attachment
 * @description Get thumb url
 * @return {string}
 */
/**
 * @name Attachment#getFooter
 * @function
 * @memberOf Attachment
 * @description Get footer text
 * @return {string}
 */
/**
 * @name Attachment#getFooterIcon
 * @function
 * @memberOf Attachment
 * @description Get footer icon
 * @return {string}
 */
/**
 * @name Attachment#getTs
 * @function
 * @memberOf Attachment
 * @description Get timestamp
 * @return {number}
 */
/**
 * @name Attachment#getTimestamp
 * @function
 * @memberOf Attachment
 * @description Get timestamp
 * @return {number}
 */
ObjectUtil.generateSetters(Attachment, config.attachment_properties);
Attachment.prototype.setTimestamp = Attachment.prototype.setTs;

module.exports = Attachment;