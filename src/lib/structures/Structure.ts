/* eslint-disable no-empty-function */
import Client from '../client/Client';

export default abstract class Structure<T = any> {
    public readonly client: Client;
    public updated: number;

    protected constructor(client: Client, data?: T) {
        /**
         * The client used by this structure.
         * @type {Client}
         */
        this.client = client;

        if (data) {
            this.setup(data);
        }
    }

    /**
     * Use given data to set this structure up.
     */
    setup(data?: T): void;
    setup(): void {
        /**
         * The last time at which this structure was updated, as an epoch timestamp.
         * @type {number}
         */
        this.updated = Date.now();
    }

    /**
     * Update this structure. This method, when overridden by base classes, should call {@link Structure#setup}
     * @returns {Promise}
     */
    async update(): Promise<any> {}
}