const uuid = require('uuid');
const amqp = require('amqplib');
const AsyncQueue = require('./AsyncQueue');

class AsyncQueueRabbitMQ extends AsyncQueue {
    static queues = {};
    DEFAULT_TIMEOUT = 10000;
    constructor(queueName, channel) {
        super();
        this.queueName = queueName;
        this.channel = channel;
    }

    async add(item) {
        await this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(item)), {
            persistent: true
        });
    }

    async get(timeout) {
        timeout = isNaN(timeout) ? this.DEFAULT_TIMEOUT : timeout;

        return new Promise(resolve => {
            let resolved = false;
            const consumerTag = uuid.v4();

            const queueTimeout = setTimeout(async () => {
                if (resolved) {
                    return;
                }
                resolved = true;
                await this.channel.cancel(consumerTag);
                resolve(null)
            }, timeout);

            this.channel.consume(this.queueName, async item => {
                if (!resolved && item !== null) {
                    clearTimeout(queueTimeout);
                    resolved = true;
                    await this.channel.cancel(consumerTag);
                    this.channel.ack(item);
                    resolve(JSON.parse(item.content.toString()));
                }
            }, {
                noAck: false,
                consumerTag: consumerTag
            });
        });
    }

    static async getQueue(name, channel) {
        if (!AsyncQueueRabbitMQ.queues[name]) {
            await channel.assertQueue(name, { durable: true });
            AsyncQueueRabbitMQ.queues[name] = new AsyncQueueRabbitMQ(name, channel);
        }

        return AsyncQueueRabbitMQ.queues[name];
    }    

    static async connect(url) {
        try {
          const connection = await amqp.connect(url);
          const channel = await connection.createChannel();
          channel.prefetch(1);
      
          return channel;
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
    }
}

module.exports = AsyncQueueRabbitMQ;