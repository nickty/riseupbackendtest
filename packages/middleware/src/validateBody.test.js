/* eslint-env jest */

const supertest = require('supertest');
const express = require('express');
const validateBody = require('./validateBody');

/** @type {import('express').ErrorRequestHandler} */
// eslint-disable-next-line no-unused-vars
const handleError = (err, _req, res, _next) => {
  if (err) {
    res.status(500);
    res.json({
      error: err.message,
    });
  }
};

/** @type {import('express').Router} */
let router;
/** @type {import('express').Express} */
let app;
/** @type {import('supertest').SuperTest<import('supertest').Test>} */
let request;

beforeEach(() => {
  router = express.Router();
  app = express();
  app.use(express.json());
  app.use(router);
  app.use(handleError);
  request = supertest(app);
});

test('accepts correct body', async () => {
  const handler = validateBody(
    /** @type {const} */ ({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      additionalProperties: false,
    }),
    (req, res) => {
      res.json(req.body);
    },
  );
  router.post('/', handler);
  const { body } = await request
    .post('/')
    .send({
      name: 'Test',
    })
    .expect(200);
  expect(body).toEqual({
    name: 'Test',
  });
});

test('throws error if body does not satisfy schema', async () => {
  const handler = validateBody(
    /** @type {const} */ ({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      additionalProperties: false,
    }),
    (_req, res) => {
      res.json({
        ok: true,
      });
    },
  );
  router.post('/', handler);
  const { body } = await request
    .post('/')
    .send({
      name: 123,
    })
    .expect(500);
  expect(body).toEqual({
    error: 'must be string',
  });
});
