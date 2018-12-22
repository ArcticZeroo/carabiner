"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Structure {
    constructor(client, data) {
        /**
         * The client used by this structure.
         * @type {Client}
         */
        this.client = client;
        if (data) {
            this.setup(data);
        }
    }
    setup() {
        /**
         * The last time at which this structure was updated, as an epoch timestamp.
         * @type {number}
         */
        this.updated = Date.now();
    }
}
exports.default = Structure;
//# sourceMappingURL=Structure.js.map