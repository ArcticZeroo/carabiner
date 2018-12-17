/**
 * @enum {string}
 * @type {{NOT_STARTED: string, STARTING: string, READY: string, STOPPING: string, STOPPED: string}}
 */
enum ReadyState {
    NOT_STARTED = 'not_started',
    STARTING = 'starting',
    READY = 'ready',
    STOPPING = 'stopping',
    STOPPED = 'stopped'
}

export default ReadyState;