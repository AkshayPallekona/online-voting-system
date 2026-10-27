const { test, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

before(async () => {
  process.env.DB_NAME = process.env.TEST_DB_NAME || 'online_voting_system_test';
});

after(async () => {
  await pool.end();
});

test('should register a new user', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ full_name: 'Test User', email: 'test@example.com', password: 'password123' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
});

test('should prevent duplicate email', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ full_name: 'Test User', email: 'test@example.com', password: 'password123' });
  const res = await request(app)
    .post('/api/auth/register')
    .send({ full_name: 'Another', email: 'test@example.com', password: 'password123' });
  assert.strictEqual(res.status, 409);
});

test('should login successfully', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
});
