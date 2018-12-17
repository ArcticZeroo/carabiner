"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum {string}
 * @type {{NOT_STARTED: string, STARTING: string, READY: string, STOPPING: string, STOPPED: string}}
 */
var ReadyState;
(function (ReadyState) {
    ReadyState["NOT_STARTED"] = "not_started";
    ReadyState["STARTING"] = "starting";
    ReadyState["READY"] = "ready";
    ReadyState["STOPPING"] = "stopping";
    ReadyState["STOPPED"] = "stopped";
})(ReadyState || (ReadyState = {}));
exports.default = ReadyState;
//# sourceMappingURL=ReadyState.js.map