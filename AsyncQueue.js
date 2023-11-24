
/**
 * Abstract Class AsyncQueue.
 *
 * @class AsyncQueue
 */
class AsyncQueue {
    DEFAULT_TIMEOUT = 10000;
    constructor() {
        if (this.constructor == AsyncQueue) {
            throw new Error('Abstract class');
        }
    }

    /**
     * 
     * @param {Record<string, any>} item 
     */
    async add(item) {
        throw new Error('Method must be implemented.');
    }

    /**
     * 
     * @param {number} timeout 
     */
    async get(timeout) {
        throw new Error('Method must be implemented.');
    }
    static async getQueue(name, channel) {
        throw new Error('Method must be implemented.');
    }

    static async connect() {
        return null;
    }

}

module.exports = AsyncQueue;