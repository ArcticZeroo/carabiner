export interface IFieldProperties {
    title?: string;
    value?: string;
    short?: boolean;
}

export default class Field implements IFieldProperties {
    title: string;
    value: string;
    short: boolean;

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

    getTitle(): string {
        return this.title;
    }

    setTitle(value: string): this {
        this.title = value;
        return this;
    }

    getValue(): string {
        return this.value;
    }

    setValue(value: string): this {
        this.value = value;
        return this;
    }

    getShort(): boolean {
        return this.short;
    }

    setShort(value: boolean): this {
        this.short = value;
        return this;
    }
}