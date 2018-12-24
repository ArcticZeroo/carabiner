/**
 * @enum {string}
 * @type {{CONNECTING: number, OPEN: number, CLOSING: number, CLOSED: number}}
 */
enum WebSocketReadyState  {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}

export default WebSocketReadyState;