import test from 'node:test'
import assert from 'node:assert/strict'
import { cancelDemoReservation, confirmDemoReservation, demoReservationStatus, readDemoReservations, DEMO_RESERVATIONS_KEY } from '../src/components/demoReservations.js'

const input = {
  facility: { id: 'demo', name: 'Demo Parking', location: 'Example District', vehicles: ['Car'] },
  slots: [{ id: 'A01', vehicle: 'Car', status: 'Available' }], selectedId: 'A01',
  vehicle: { type: 'Car', plate: 'ABC 123', model: '' }, dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
}
function setup() {
  let raw = null
  let id = 0
  let pending = Promise.resolve()
  return {
    now: new Date(2026, 9, 26), createId: () => `history-${++id}`,
    storage: { getItem: () => raw, setItem: (_, value) => { raw = value } },
    locks: { request: (_, callback) => { const next = pending.then(callback); pending = next.catch(() => {}); return next } },
  }
}
test('derives upcoming, in progress, completed, and cancelled demo statuses', () => {
  const record = { dateTime: input.dateTime }
  assert.equal(demoReservationStatus(record, new Date(2026, 9, 28, 9, 59)), 'Upcoming')
  assert.equal(demoReservationStatus(record, new Date(2026, 9, 28, 10)), 'In progress')
  assert.equal(demoReservationStatus(record, new Date(2026, 9, 28, 11)), 'Completed')
  assert.equal(demoReservationStatus({ ...record, status: 'cancelled' }), 'Cancelled')
})
test('reads missing data safely and retains compatibility with old confirmed records', async () => {
  const options = setup()
  assert.deepEqual(readDemoReservations(options.storage), [])
  await confirmDemoReservation(input, options)
  assert.equal(readDemoReservations(options.storage)[0].status, undefined)
})
test('persists cancellation and permits a new booking of the released slot', async () => {
  const options = setup()
  const first = await confirmDemoReservation(input, options)
  const result = await cancelDemoReservation(first.reservation.reference, options)
  assert.ok(result.ok)
  assert.equal(result.reservation.status, 'cancelled')
  assert.equal(readDemoReservations(options.storage)[0].cancelledAt, options.now.toISOString())
  assert.ok((await confirmDemoReservation(input, options)).ok)
  assert.equal(readDemoReservations(options.storage).length, 2)
})
test('refuses unknown, already cancelled, started, and completed reservations', async () => {
  const options = setup()
  const first = await confirmDemoReservation(input, options)
  assert.equal((await cancelDemoReservation('missing', options)).ok, false)
  for (const now of [new Date(2026, 9, 28, 10), new Date(2026, 9, 29)]) {
    assert.equal((await cancelDemoReservation(first.reservation.reference, { ...options, now })).ok, false)
  }
  await cancelDemoReservation(first.reservation.reference, options)
  assert.equal((await cancelDemoReservation(first.reservation.reference, options)).ok, false)
})
test('rejects corrupt data and cancellation write failures without changing stored data', async () => {
  const options = setup()
  options.storage.setItem(DEMO_RESERVATIONS_KEY, 'broken')
  assert.equal((await cancelDemoReservation('missing', options)).ok, false)
  assert.equal(options.storage.getItem(DEMO_RESERVATIONS_KEY), 'broken')
  options.storage.setItem(DEMO_RESERVATIONS_KEY, null)
  const first = await confirmDemoReservation(input, options)
  const raw = options.storage.getItem(DEMO_RESERVATIONS_KEY)
  const brokenStorage = { getItem: () => raw, setItem() { throw Error('Quota exceeded') } }
  assert.equal((await cancelDemoReservation(first.reservation.reference, { ...options, storage: brokenStorage })).ok, false)
  assert.equal(options.storage.getItem(DEMO_RESERVATIONS_KEY), raw)
  assert.equal((await cancelDemoReservation(first.reservation.reference, { ...options, locks: {} })).ok, false)
})
test('serializes duplicate cancellation attempts and preserves other reservations', async () => {
  const options = setup()
  const first = await confirmDemoReservation(input, options)
  await confirmDemoReservation({ ...input, dateTime: { ...input.dateTime, date: '2026-10-29' } }, options)
  const results = await Promise.all([cancelDemoReservation(first.reservation.reference, options), cancelDemoReservation(first.reservation.reference, options)])
  assert.equal(results.filter((result) => result.ok).length, 1)
  assert.equal(readDemoReservations(options.storage)[1].status, undefined)
})
