const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('should prevent voting without auth', async () => {
  const res = await request(app)
    .post('/api/elections/1/vote')
    .send({ candidate_id: 1 });
  assert.strictEqual(res.status, 401);
});

test('results endpoint requires auth', async () => {
  const res = await request(app).get('/api/elections/1/results');
  assert.strictEqual(res.status, 401);
});
