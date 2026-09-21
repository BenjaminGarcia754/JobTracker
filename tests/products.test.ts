import assert from 'node:assert/strict';
import { test, before, beforeEach, after } from 'node:test';
import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import { createDatabase } from '../src/config/database.js';
import { createMigrator } from '../src/database/migrator.js';
import { initProductModel } from '../src/features/products/product.model.js';
import { env } from '../src/config/env.js';
import request from 'supertest';
import { createApp } from '../src/app.js';

const databaseName = 'starter_test_' + randomUUID().replaceAll('-', '');
const database = createDatabase(databaseName);
let created = false;
let admin: mysql.Connection | undefined;
before(async () => {
  admin = await mysql.createConnection({ host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD });
  await admin.query('CREATE DATABASE ' + databaseName + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  created = true;
  await createMigrator(database).up();
  initProductModel(database);
});
beforeEach(async () => { await database.model('Product').destroy({ where: {}, truncate: true }); });
after(async () => {
  await database.close();
  try { if (created) await admin?.query('DROP DATABASE ' + databaseName); }
  finally { await admin?.end(); }
});

test('CRUD persists changes, paginates, and returns 404 after deletion', async () => {
  const api = request(createApp(database));
  const created = await api.post('/api/products').send({ name: ' Teclado ', price_cents: 2599, stock: 3 }).expect(201);
  const { id } = created.body.data;
  assert.equal(created.body.data.name, 'Teclado');
  assert.equal(created.body.data.description, null);
  assert.equal(created.headers.location, `/api/products/${id}`);
  const list = await api.get('/api/products?page=1&per_page=1').expect(200);
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.meta.total, 1);
  assert.equal(list.body.meta.per_page, 1);
  await api.get(`/api/products/${id}`).expect(200);
  const updated = await api.patch(`/api/products/${id}`).send({ stock: 0, description: 'USB' }).expect(200);
  assert.equal(updated.body.data.stock, 0);
  assert.equal(updated.body.data.price_cents, 2599);
  assert.equal(updated.body.data.description, 'USB');
  await api.delete(`/api/products/${id}`).expect(204);
  const missing = await api.get(`/api/products/${id}`).expect(404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
  await api.patch(`/api/products/${id}`).send({ stock: 1 }).expect(404);
  await api.delete(`/api/products/${id}`).expect(404);
});

test('rejects invalid bodies, params and query without changing stored products', async () => {
  const api = request(createApp(database));
  for (const body of [{}, { name: ' ', price_cents: 1 }, { name: 'X', price_cents: -1 }, { name: 'X', price_cents: 1.5 }, { name: 'X', price_cents: '1' }, { name: 'X', price_cents: 1, admin: true }]) {
    const result = await api.post('/api/products').send(body).expect(422);
    assert.equal(result.body.error.code, 'VALIDATION_ERROR');
    assert.ok(result.body.error.details.length);
  }
  await api.get('/api/products/nope').expect(422);
  for (const query of ['page=0', 'page=1.5', 'per_page=101', 'page=', 'page=1&page=2', 'extra=1']) {
    await api.get(`/api/products?${query}`).expect(422);
  }
  const created = await api.post('/api/products').send({ name: 'X', price_cents: 0 }).expect(201);
  const path = `/api/products/${created.body.data.id}`;
  await api.patch(path).send({}).expect(422);
  await api.patch(path).send({ name: null }).expect(422);
  assert.equal((await api.get('/api/products')).body.meta.total, 1);
});

test('returns JSON for malformed JSON and unknown routes; products survive app recreation', async () => {
  const api = request(createApp(database));
  const bad = await api.post('/api/products').set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(bad.body.error.code, 'BAD_REQUEST');
  await api.get('/unknown').expect('Content-Type', /json/).expect(404);
  await api.post('/api/products').send({ name: 'X', price_cents: 1 }).expect(201);
  assert.equal((await request(createApp(database)).get('/api/products')).body.meta.total, 1);
});

test('malformed URL and unsupported encoding retain client error statuses', async () => {
  const api = request(createApp(database));
  const malformed = await api.get('/api/products/%').expect(400);
  assert.equal(malformed.body.error.code, 'BAD_REQUEST');
  await api.post('/api/products').set('Content-Type', 'application/json; charset=invalid').send('{}').expect(415);
});

test('products survive a separate MySQL connection and migrations can roll back and reapply', async () => {
  const response = await request(createApp(database)).post('/api/products').send({ name: 'Persistente', price_cents: 99 }).expect(201);
  const secondConnection = createDatabase(databaseName);
  try {
    const stored = await request(createApp(secondConnection)).get('/api/products/' + response.body.data.id).expect(200);
    assert.equal(stored.body.data.name, 'Persistente');
    assert.equal(stored.body.data.price_cents, 99);
  } finally { await secondConnection.close(); }
  const migrator = createMigrator(database);
  await migrator.down();
  assert.equal((await migrator.pending()).length, 1);
  const tables = await database.getQueryInterface().showAllTables();
  assert.equal(tables.includes('products'), false);
  await migrator.up();
  assert.equal((await migrator.pending()).length, 0);
  const list = await request(createApp(database)).get('/api/products').expect(200);
  assert.deepEqual(list.body.data, []);
});
