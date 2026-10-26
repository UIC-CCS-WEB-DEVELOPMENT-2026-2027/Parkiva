import test from 'node:test'
import assert from 'node:assert/strict'
import { demoPassToken, referenceFromDemoToken, verifyDemoPass } from '../src/components/demoPassVerification.js'
import { DEMO_RESERVATIONS_KEY, readDemoReservations } from '../src/components/demoReservations.js'

const record = {
  demo: true, reference: 'DEMO-pass-test', confirmedAt: '2026-10-20T00:00:00.000Z',
  facility: { id: 'demo', name: 'Demo Parking', location: 'Example District' },
  slot: { id: 'A01', vehicle: 'Car' }, vehicle: { type: 'Car', plate: 'ABC123', model: '' },
  dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
}
function setup(records = [record]) {
  let raw = JSON.stringify({ version: 1, reservations: records })
  let pending = Promise.resolve()
  return {
    now: new Date(2026, 9, 28, 10, 30),
    storage: { getItem: () => raw, setItem: (_, value) => { raw = value } },
    locks: { request: (_, callback) => { const next = pending.then(callback); pending = next.catch(() => {}); return next } },
  }
}
const token = demoPassToken(record.reference)
test('token contains only namespaced demo reference and rejects invalid payloads', () => {
  assert.equal(token, 'parkiva-demo-pass:v1:DEMO-pass-test')
  assert.equal(referenceFromDemoToken(token), record.reference)
  for (const value of ['invalid', 'https://example.test', token + ':extra', 'parkiva-demo-pass:v1:']) assert.equal(referenceFromDemoToken(value), null)
})
test('records entry and exit in existing storage and rejects duplicate events', async () => {
  const options = setup()
  assert.equal((await verifyDemoPass(token, 'exit', options)).ok, false)
  assert.ok((await verifyDemoPass(token, 'entry', options)).ok)
  assert.equal((await verifyDemoPass(token, 'entry', options)).ok, false)
  assert.ok((await verifyDemoPass(token, 'exit', { ...options, now: new Date(2026, 9, 28, 12) })).ok)
  assert.equal((await verifyDemoPass(token, 'exit', options)).ok, false)
  const saved = readDemoReservations(options.storage)[0]
  assert.ok(saved.pass.enteredAt && saved.pass.exitedAt)
  assert.deepEqual(saved.vehicle, record.vehicle)
})
test('rejects early and expired entry, cancelled, unknown, and mismatched passes', async () => {
  for (const now of [new Date(2026, 9, 28, 9, 59), new Date(2026, 9, 28, 11)]) {
    assert.equal((await verifyDemoPass(token, 'entry', { ...setup(), now })).ok, false)
  }
  assert.equal((await verifyDemoPass(token, 'entry', setup([{ ...record, status: 'cancelled', cancelledAt: '2026-10-21T00:00:00Z' }]))).ok, false)
  assert.equal((await verifyDemoPass(token, 'entry', setup([]))).ok, false)
  assert.equal((await verifyDemoPass(token, 'entry', { ...setup(), expectedReference: 'DEMO-other' })).ok, false)
})
test('serializes two simultaneous entry attempts', async () => {
  const options = setup()
  const results = await Promise.all([verifyDemoPass(token, 'entry', options), verifyDemoPass(token, 'entry', options)])
  assert.equal(results.filter((result) => result.ok).length, 1)
})
test('fails safely on corrupted storage, invalid pass metadata, unavailable locks, or quota errors', async () => {
  const options = setup()
  options.storage.setItem(DEMO_RESERVATIONS_KEY, 'corrupt')
  assert.equal((await verifyDemoPass(token, 'entry', options)).ok, false)
  assert.equal(options.storage.getItem(DEMO_RESERVATIONS_KEY), 'corrupt')
  const invalid = setup([{ ...record, pass: { exitedAt: '2026-10-28T10:00:00Z' } }])
  assert.equal((await verifyDemoPass(token, 'entry', invalid)).ok, false)
  assert.equal((await verifyDemoPass(token, 'entry', { ...setup(), locks: {} })).ok, false)
  const original = setup()
  const raw = original.storage.getItem(DEMO_RESERVATIONS_KEY)
  assert.equal((await verifyDemoPass(token, 'entry', { ...original, storage: { getItem: () => raw, setItem() { throw Error('quota') } } })).ok, false)
  assert.equal(readDemoReservations(original.storage)[0].pass, undefined)
})
