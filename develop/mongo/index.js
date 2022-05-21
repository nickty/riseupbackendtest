/* eslint-disable no-await-in-loop */
const { MongoClient } = require('mongodb');
const mkdirp = require('mkdirp');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const _ = require('lodash');

const sleepMs = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const connectWithRetry = async function (mongoUrl) {
  let numberOfRetries = 10;
  let client;
  while (!client && numberOfRetries > 0) {
    try {
      client = await MongoClient.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (err) {
      numberOfRetries -= 1;
      if (numberOfRetries <= 0) {
        throw err;
      }
      await sleepMs(1000);
    }
  }
  return client;
};

// Reference: https://github.com/meteor/meteor/blob/bf123c164fd5c7723085cf9777c02c3b59056167/tools/runners/run-mongo.js
const setupMongo = async function (options) {
  const mongoPort = options.port || '27017';
  const pathToDB = path.resolve('local', 'db');
  const bindIp = '127.0.0.1';

  if (!fs.existsSync(pathToDB)) {
    mkdirp.sync(pathToDB);
  }

  const mongoUrl = `mongodb://127.0.0.1:${mongoPort}`;
  const mongoArgs = [
    '--port',
    mongoPort,
    '--bind_ip',
    bindIp,
    '--dbpath',
    pathToDB,
    // Use an 64MB oplog rather than 256MB. Uses less space on disk and
    // initializes faster. (Not recommended for production!)
    '--oplogSize',
    64,
    '--replSet',
    'develop',
  ];

  // Use mmapv1 on 32bit platforms, as our binary doesn't support WT
  if (
    process.platform === 'win32' ||
    (process.platform === 'linux' && process.arch === 'ia32')
  ) {
    mongoArgs.push('--storageEngine', 'mmapv1', '--smallfiles');
  } else {
    // The WT journal seems to be at least 300MB, which is just too much
    // mongoArgs.push('--nojournal');
  }

  const mongoProcess = spawn('mongod', mongoArgs, {
    stdio: 'pipe',
  });

  mongoProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  const configuration = {
    _id: 'develop',
    version: 1,
    protocolVersion: 1,
    members: [
      {
        _id: 0,
        host: `${bindIp}:${mongoPort}`,
        priority: 100,
      },
    ],
  };

  const client = await connectWithRetry(mongoUrl);
  const db = client.db('develop');

  try {
    const { config } = await db.admin().command({
      replSetGetConfig: 1,
    });

    if (config && _.has(config, 'version')) {
      configuration.version = config.version + 1;
    }
  } catch (err) {
    console.log(err);
  }

  try {
    await db.admin().command({
      replSetInitiate: configuration,
    });
  } catch (err) {
    if (err.message === 'already initialized') {
      await db.admin().command({
        replSetReconfig: configuration,
        force: true,
      });
    } else {
      throw err;
    }
  }

  const writeableTimestamp = Date.now();

  while (true) {
    const { ismaster } = await db.admin().command({
      isMaster: 1,
    });

    if (ismaster) {
      try {
        await db.admin().command({
          setDefaultRWConcern: 1,
          defaultWriteConcern: { w: 1 },
        });
      } catch (err) {
        // NOTE: This may fail in Mongo 4.x, but we can ignore it.
        console.warn(err);
      }
      break;
    } else if (Date.now() - writeableTimestamp > 60 * 1000) {
      const status = await db.admin().command({
        replSetGetStatus: 1,
      });

      throw new Error(
        `Primary not writable after one minute. Last replica set status: ${JSON.stringify(
          status,
        )}`,
      );
    }

    await sleepMs(50);
  }

  await client.close();
};

setupMongo(minimist(process.argv.slice(2))).catch((err) => {
  console.log(err);
});
