import Field from './Field';
import SlackUtil from '../../../util/SlackUtil';

export interface IAttachmentProperties {
    fields?: Field[];
    mrkdwn_in?: string[];
    fallback?: string;
    color?: string;
    pretext?: string;
    author_name?: string;
    author_link?: string;
    author_icon?: string;
    title?: string;
    title_link?: string;
    text?: string;
    image_url?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string;
    ts?: string;
}

export default class Attachment implements IAttachmentProperties {
    fields: Field[];
    mrkdwn_in: string[];
    fallback: string;
    color: string;
    pretext: string;
    author_name: string;
    author_link: string;
    author_icon: string;
    title: string;
    title_link: string;
    text: string;
    image_url: string;
    thumb_url: string;
    footer: string;
    footer_icon: string;
    ts: string;

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
    addField(field: Field | string, value: string, short: boolean): this {
        if (!this.fields) {
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
    setFields(fields: Field[]): this {
        this.fields = fields;
        return this;
    }

    /**
     * Get fields for this attachment.
     * @return {Array|Array.<Field>}
     */
    getFields(): Field[] {
        return this.fields;
    }

    /**
     * Add a markdown field to this attachment.
     * @param {string} field - The slack field to add a markdown field to. Consult slack docs.
     * @return {Attachment}
     */
    addMarkdownField(...field: string[]): this {
        if (!this.mrkdwn_in) {
            this.mrkdwn_in = [];
        }

        this.mrkdwn_in.push(...field);
        return this;
    }

    /**
     * Set markdown fields for this attachment.
     * @param {Array.<string>} fields - Fields to set.
     * @return {Attachment}
     */
    setMarkdownFields(fields: string[]): this {
        this.mrkdwn_in = fields;
        return this;
    }

    getFallback(): string {
        return this.fallback;
    }

    setFallback(value: string): this {
        this.fallback = value;
        return this;
    }

    getColor(): string {
        return this.color;
    }

    setColor(value: string): this {
        this.color = value;
        return this;
    }

    getPretext(): string {
        return this.pretext;
    }

    setPretext(value: string): this {
        this.pretext = value;
        return this;
    }

    getAuthorName(): string {
        return this.author_name;
    }

    setAuthorName(value: string): this {
        this.author_name = value;
        return this;
    }

    getAuthorLink(): string {
        return this.author_link;
    }

    setAuthorLink(value: string): this {
        this.author_link = value;
        return this;
    }

    getAuthorIcon(): string {
        return this.author_icon;
    }

    setAuthorIcon(value: string): this {
        this.author_icon = value;
        return this;
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(value: string): this {
        this.title = value;
        return this;
    }

    getTitleLink(): string {
        return this.title_link;
    }

    setTitleLink(value: string): this {
        this.title_link = value;
        return this;
    }

    getText(): string {
        return this.text;
    }

    setText(value: string): this {
        this.text = value;
        return this;
    }

    getImageUrl(): string {
        return this.image_url;
    }

    setImageUrl(value: string): this {
        this.image_url = value;
        return this;
    }

    getThumbUrl(): string {
        return this.thumb_url;
    }

    setThumbUrl(value: string): this {
        this.thumb_url = value;
        return this;
    }

    getFooter(): string {
        return this.footer;
    }

    setFooter(value: string): this {
        this.footer = value;
        return this;
    }

    getFooterIcon(): string {
        return this.footer_icon;
    }

    setFooterIcon(value: string): this {
        this.footer_icon = value;
        return this;
    }

    setTimestamp(value: string | Date | number): this {
        if (value instanceof Date) {
            this.ts = SlackUtil.dateToSlack(value);
        } else {
            if (typeof value === 'string') {
                this.ts = value;
            } else if (typeof value === 'number') {
                this.ts = SlackUtil.dateToSlack(new Date(value));
            } else {
                throw new TypeError('value is not of type string, date or number');
            }
        }

        return this;
    }

    getTimestamp(): Date {
        return SlackUtil.slackToDate(this.ts);
    }
}