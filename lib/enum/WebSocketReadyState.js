"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum {string}
 * @type {{CONNECTING: number, OPEN: number, CLOSING: number, CLOSED: number}}
 */
var WebSocketReadyState;
(function (WebSocketReadyState) {
    WebSocketReadyState[WebSocketReadyState["CONNECTING"] = 0] = "CONNECTING";
    WebSocketReadyState[WebSocketReadyState["OPEN"] = 1] = "OPEN";
    WebSocketReadyState[WebSocketReadyState["CLOSING"] = 2] = "CLOSING";
    WebSocketReadyState[WebSocketReadyState["CLOSED"] = 3] = "CLOSED";
})(WebSocketReadyState || (WebSocketReadyState = {}));
exports.default = WebSocketReadyState;
//# sourceMappingURL=WebSocketReadyState.js.map