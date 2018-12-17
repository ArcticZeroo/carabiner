"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PromiseUtil {
    static pause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.default = PromiseUtil;
//# sourceMappingURL=PromiseUtil.js.map