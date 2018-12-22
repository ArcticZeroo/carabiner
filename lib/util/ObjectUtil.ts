import StringUtil from './StringUtil';

export default class ObjectUtil {
    /**
     * Object utilities.
     */
    private constructor() {}

    /**
     * Generates setters on an object when given an underscore'd property, and returns the new object.
     * This does not clone the original object, so you can probably ignore the return value.
     * @example
     * const obj = ObjectUtil.generateSetters({}, ['my_property']);
     * obj.getMyProperty() // null
     * obj.setMyProperty('cat')
     * obj.getMyProperty() // 'cat'
     * obj.my_property // 'cat'
     * @param obj
     * @param iterator
     * @return {object}
     */
    static generateSetters<T>(obj: any, iterator: IterableIterator<any>) {
        for (const item of iterator) {
            obj.prototype[item] = null;

            const methodName = item.split('_').map(StringUtil.capitalize).join('');

            obj.prototype[`set${methodName}`] = function(val: T) {
                this[item] = val;
                return this;
            };

            obj.prototype[`get${methodName}`] = function(): T {
                return this[item];
            };
        }

        return obj;
    }

    /**
     * Returns whether or not the given
     * object has any null values as its
     * enumerable properties.
     * @param {object} obj
     * @return {boolean}
     */
    static hasNullValue(obj: any) {
        for (const key of Object.keys(obj)) {
            // noinspection EqualityComparisonWithCoercionJS
            if (obj[key] == null) {
                return true;
            }
        }

        return false;
    }
}