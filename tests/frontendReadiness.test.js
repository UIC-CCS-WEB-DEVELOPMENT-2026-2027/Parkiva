import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_RESERVATIONS_KEY, confirmDemoReservation, readDemoReservations, cancelDemoReservation } from '../src/components/demoReservations.js'
import { verifyDemoPass, demoPassToken } from '../src/components/demoPassVerification.js'

const input = {
  facility: { id: 'sample-courtyard', name: 'Sample Courtyard Parking', location: 'Example District', vehicles: ['Car'] },
  slots: [{ id: 'A01', vehicle: 'Car', status: 'Available' }], selectedId: 'A01',
  dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' }, vehicle: { type: 'Car', plate: 'ABC', model: '' },
}
function setup() {
  const data = new Map()
  let pending = Promise.resolve()
  let id = 0
  return {
    storage: { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) },
    locks: { request: (_, callback) => { const next = pending.then(callback); pending = next.catch(() => {}); return next } },
    now: new Date(2026, 9, 26), createId: () => `readiness-${++id}`,
  }
}
test('duplicate references fail closed without cancelling or rewriting ambiguous records', async () => {
  const options = setup()
  const result = await confirmDemoReservation(input, options)
  const raw = JSON.stringify({ version: 1, reservations: [result.reservation, result.reservation] })
  options.storage.setItem(DEMO_RESERVATIONS_KEY, raw)
  assert.throws(() => readDemoReservations(options.storage), /invalid/)
  assert.equal((await cancelDemoReservation(result.reservation.reference, options)).ok, false)
  assert.equal(options.storage.getItem(DEMO_RESERVATIONS_KEY), raw)
})
test('confirmation rechecks current recorded occupancy even for a later reservation period', async () => {
  const options = setup()
  const saved = await confirmDemoReservation(input, options)
  const current = { ...options, now: new Date(2026, 9, 28, 10, 30) }
  assert.ok((await verifyDemoPass(demoPassToken(saved.reservation.reference), 'entry', current)).ok)
  const later = { ...input, dateTime: { ...input.dateTime, date: '2026-10-29' } }
  assert.equal((await confirmDemoReservation(later, current)).ok, false)
  assert.ok((await verifyDemoPass(demoPassToken(saved.reservation.reference), 'exit', current)).ok)
  assert.ok((await confirmDemoReservation(later, current)).ok)
})
