const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('should get elections list', async () => {
  const res = await request(app).get('/api/elections');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.elections));
});

test('should require admin for creating election', async () => {
  const res = await request(app)
    .post('/api/elections')
    .send({ title: 'Test', start_time: '2026-01-01T00:00:00', end_time: '2026-12-31T00:00:00' });
  assert.strictEqual(res.status, 401);
});
