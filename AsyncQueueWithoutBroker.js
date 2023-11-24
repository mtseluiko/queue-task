const AsyncQueue = require('./AsyncQueue')

class AsyncQueueWithoutBroker extends AsyncQueue {
    POLLING_TIME = 100;
    DEFAULT_TIMEOUT = 10000;
    static queues = {};
    constructor() {
        super();
        this.items = [];
    }

    async add(item) {
        this.items.push(item)
    }

    async get(timeout) {
        timeout = isNaN(timeout) ? this.DEFAULT_TIMEOUT : timeout;

        return new Promise((resolve, reject) => {
            const pollingInterval = setInterval(() => {
                if (this.items.length === 0 && timeout > 0) {
                    timeout -= this.POLLING_TIME;
                    return;
                }
                
                clearInterval(pollingInterval);
                resolve(this.items.shift() || null);
            }, this.POLLING_TIME);
        });
    }

    static async getQueue(name) {
        if (!AsyncQueueWithoutBroker.queues[name]) {
            AsyncQueueWithoutBroker.queues[name] = new AsyncQueueWithoutBroker();
        }

        return AsyncQueueWithoutBroker.queues[name];
    }   
}

module.exports = AsyncQueueWithoutBroker;