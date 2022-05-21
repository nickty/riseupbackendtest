const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');

const kafka = new Kafka({
  brokers: ['localhost:9092'],
});

async function run() {
  const consumer = kafka.consumer({
    groupId: 'project-summary',
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: 'db.develop.participations.change_event',
  });
  await consumer.run({
    eachMessage: async () => {
      const mongo = await MongoClient.connect('mongodb://localhost:27017');
      const collection = mongo.db('develop').collection('participations');
      await collection
        .aggregate([
          {
            $group: {
              _id: {
                projectId: '$projectId',
                state: '$state',
              },
              total: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: '$_id.projectId',
              participations: {
                $push: {
                  state: '$_id.state',
                  total: '$total',
                },
              },
            },
          },
          {
            $out: 'summary',
          },
        ])
        .toArray();
      await mongo.close();
    },
  });
}

run();
