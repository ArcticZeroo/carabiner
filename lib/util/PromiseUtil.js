class PromiseUtil {
    static pause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = PromiseUtil;