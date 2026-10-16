process.env.DB_PATH = ':memory:'
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

const { default: app } = await import('../src/app.js')
const { default: db } = await import('../src/db.js')
const { JWT_SECRET } = await import('../src/middleware/auth.js')

let server, base
const tok = (id) => jwt.sign({ id }, JWT_SECRET)
const call = (path, { method = 'GET', token, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json() }))

before(() => {
  db.prepare("INSERT INTO users (id, username) VALUES (1,'an'),(2,'binh'),(3,'chi')").run()
  server = app.listen(0)
  base = `http://localhost:${server.address().port}`
})
after(() => server.close())

test('POST /scores: cần token, validate score', async () => {
  assert.equal((await call('/api/scores', { method: 'POST', body: { score: 5 } })).status, 401)
  for (const score of [-1, 1.5, 'abc', null, 999999])
    assert.equal((await call('/api/scores', { method: 'POST', token: tok(1), body: { score } })).status, 400)
})

test('POST /scores: newRecord + mở khoá skin', async () => {
  let r = await call('/api/scores', { method: 'POST', token: tok(1), body: { score: 12 } })
  assert.equal(r.status, 201)
  assert.equal(r.body.newRecord, true)
  assert.equal(r.body.bestScore, 12)
  assert.deepEqual(r.body.newlyUnlockedSkins.map((s) => s.id).sort(), ['blue', 'default'])

  r = await call('/api/scores', { method: 'POST', token: tok(1), body: { score: 5 } })
  assert.equal(r.body.newRecord, false)
  assert.equal(r.body.bestScore, 12)
  assert.equal(r.body.newlyUnlockedSkins.length, 0)
})

test('GET /leaderboard: công khai, sắp xếp, me', async () => {
  await call('/api/scores', { method: 'POST', token: tok(2), body: { score: 30 } })
  await call('/api/scores', { method: 'POST', token: tok(3), body: { score: 12 } })

  let r = await call('/api/leaderboard')
  assert.equal(r.status, 200)
  assert.deepEqual(r.body.leaderboard.map((x) => x.username), ['binh', 'an', 'chi']) // hoà điểm: id nhỏ trước
  assert.equal(r.body.me, null)

  r = await call('/api/leaderboard?limit=1')
  assert.equal(r.body.leaderboard.length, 1)

  r = await call('/api/leaderboard', { token: tok(3) })
  assert.equal(r.body.me.rank, 3)
})

test('GET /skins: trạng thái mở khoá', async () => {
  assert.equal((await call('/api/skins')).status, 401)
  const r = await call('/api/skins', { token: tok(1) })
  const by = Object.fromEntries(r.body.skins.map((s) => [s.id, s]))
  assert.equal(by.default.unlocked, true)
  assert.equal(by.default.equipped, true)
  assert.equal(by.blue.unlocked, true)
  assert.equal(by.red.unlocked, false)
})

test('POST /skins/equip: kiểm tra quyền sở hữu', async () => {
  let r = await call('/api/skins/equip', { method: 'POST', token: tok(1), body: { skinId: 'red' } })
  assert.equal(r.status, 403)
  r = await call('/api/skins/equip', { method: 'POST', token: tok(1), body: { skinId: 'nope' } })
  assert.equal(r.status, 404)
  r = await call('/api/skins/equip', { method: 'POST', token: tok(1), body: {} })
  assert.equal(r.status, 400)
  r = await call('/api/skins/equip', { method: 'POST', token: tok(1), body: { skinId: 'blue' } })
  assert.equal(r.status, 200)
  r = await call('/api/skins', { token: tok(1) })
  assert.equal(r.body.equippedSkin, 'blue')
  assert.equal(r.body.skins.find((s) => s.id === 'blue').equipped, true)
})

test('auth tạm: đăng ký, đăng nhập, dùng token gọi API', async () => {
  let r = await call('/api/auth/register', { method: 'POST', body: { username: 'dung', password: '123456' } })
  assert.equal(r.status, 201)
  const token = r.body.token
  assert.equal((await call('/api/auth/register', { method: 'POST', body: { username: 'dung', password: '123456' } })).status, 409)
  assert.equal((await call('/api/auth/register', { method: 'POST', body: { username: 'a', password: '123456' } })).status, 400)
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { username: 'dung', password: 'sai' } })).status, 401)
  r = await call('/api/auth/login', { method: 'POST', body: { username: 'dung', password: '123456' } })
  assert.equal(r.status, 200)
  r = await call('/api/skins', { token: r.body.token })
  assert.equal(r.status, 200)
  assert.equal(r.body.skins.find((s) => s.id === 'default').unlocked, true)
  assert.ok(token)
})
