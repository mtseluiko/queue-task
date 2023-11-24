const express = require('express');
const AsyncQueueWithoutBroker = require('./AsyncQueueWithoutBroker');
const AsyncQueueRabbitMQ = require('./AsyncQueueRabbitMQ');
const app = express();

const PORT = process.env.PORT || 3000;
const RABBIT_MQ_URL = process.env.RABBIT_MQ_URL || 'amqp://user:pass@localhost';

const queueManager = AsyncQueueRabbitMQ; // AsyncQueueWithoutBroker;

queueManager.connect(RABBIT_MQ_URL).then(channel => {
    app.use(express.json());

    app.get('/api/:queue', async (req, res) => {
        const queueName = req.params.queue;
        const queue = await queueManager.getQueue(queueName, channel);
        const timeout = parseInt(req.query.timeout);

        const item = await queue.get(timeout);
        if (!item) {
            return res.status(204).send({ message: `The ${queueName} queue is empty`});
        }
        res.json(item);
    });

    app.post('/api/:queue', async (req, res) => {
        const queueName = req.params.queue;
        const queue = await queueManager.getQueue(queueName, channel);
        await queue.add(req.body);
        res.status(201).send({ message: `Message has added to the queue "${queueName}"` });
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
