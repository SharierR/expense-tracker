const { test, describe } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');

describe('Expenses API', () => {
  test('POST /api/expenses with valid data creates expense', async () => {
    const db = createDb(':memory:');
    const app = createApp(db);
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 10.5, date: '2024-01-15', category: 'food', note: 'Lunch' });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.amount, 10.5);
    db.close();
  });

  test('POST /api/expenses with invalid data returns 400', async () => {
    const db = createDb(':memory:');
    const app = createApp(db);
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: -5, date: '2024-01-15', category: 'food', note: 'Bad' });
    assert.strictEqual(res.status, 400);
    db.close();
  });

  test('GET /api/expenses returns list and supports category filter', async () => {
    const db = createDb(':memory:');
    const app = createApp(db);
    await request(app).post('/api/expenses').send({ amount: 5, date: '2024-01-15', category: 'food', note: 'A' });
    await request(app).post('/api/expenses').send({ amount: 10, date: '2024-01-16', category: 'transport', note: 'B' });
    const resAll = await request(app).get('/api/expenses');
    assert.strictEqual(resAll.status, 200);
    assert.ok(Array.isArray(resAll.body));
    assert.strictEqual(resAll.body.length, 2);
    const resFilter = await request(app).get('/api/expenses?category=food');
    assert.strictEqual(resFilter.status, 200);
    assert.strictEqual(resFilter.body.length, 1);
    db.close();
  });

  test('DELETE /api/expenses/:id removes existing and returns 404 for missing', async () => {
    const db = createDb(':memory:');
    const app = createApp(db);
    const create = await request(app).post('/api/expenses').send({ amount: 5, date: '2024-01-15', category: 'food', note: 'A' });
    const del = await request(app).delete(`/api/expenses/${create.body.id}`);
    assert.strictEqual(del.status, 204);
    const del2 = await request(app).delete(`/api/expenses/999`);
    assert.strictEqual(del2.status, 404);
    db.close();
  });

  test('GET /api/summary returns totals and monthTotal', async () => {
    const db = createDb(':memory:');
    const app = createApp(db);
    await request(app).post('/api/expenses').send({ amount: 10, date: '2024-01-15', category: 'food', note: 'A' });
    await request(app).post('/api/expenses').send({ amount: 20, date: '2024-01-20', category: 'bills', note: 'B' });
    const res = await request(app).get('/api/summary');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.hasOwnProperty('total'));
    assert.ok(res.body.hasOwnProperty('monthTotal'));
    assert.strictEqual(res.body.total, 30);
    db.close();
  });
});
