import test from 'node:test'
import assert from 'node:assert/strict'
import { confirmDemoReservation, readDemoReservations, DEMO_RESERVATIONS_KEY } from '../src/components/demoReservations.js'

const input = {
  facility: { id: 'example', name: 'Example Parking', location: 'Example District', vehicles: ['Car'] },
  slots: [{ id: 'A01', vehicle: 'Car', status: 'Available' }, { id: 'A02', vehicle: 'Car', status: 'Available' }],
  selectedId: 'A01', dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
  vehicle: { type: 'Car', plate: 'ABC-123', model: '' },
}
function setup() {
  let raw = null
  let counter = 0
  let pending = Promise.resolve()
  const storage = { getItem: (key) => key === DEMO_RESERVATIONS_KEY ? raw : null, setItem: (_, value) => { raw = value } }
  const locks = { request: (_, callback) => { const result = pending.then(callback); pending = result.catch(() => {}); return result } }
  return { storage, locks, now: new Date(2026, 9, 26), createId: () => `test-${++counter}` }
}
test('saves complete demo snapshots with unique references and reads them back', async () => {
  const options = setup()
  const first = await confirmDemoReservation(input, options)
  const second = await confirmDemoReservation({ ...input, dateTime: { ...input.dateTime, arrival: '11:00', departure: '12:00' } }, options)
  assert.ok(first.ok && second.ok)
  assert.notEqual(first.reservation.reference, second.reservation.reference)
  assert.equal(readDemoReservations(options.storage).length, 2)
  assert.equal(first.reservation.demo, true)
})
test('blocks slot overlaps, containing ranges, and normalized plate conflicts', async () => {
  const options = setup()
  await confirmDemoReservation(input, options)
  for (const dateTime of [input.dateTime, { ...input.dateTime, arrival: '09:00', departure: '12:00' }, { ...input.dateTime, arrival: '10:30', departure: '11:30' }]) {
    assert.equal((await confirmDemoReservation({ ...input, vehicle: { ...input.vehicle, plate: 'OTHER' }, dateTime }, options)).ok, false)
  }
  assert.equal((await confirmDemoReservation({ ...input, selectedId: 'A02', vehicle: { ...input.vehicle, plate: 'abc 123' } }, options)).ok, false)
  assert.equal(readDemoReservations(options.storage).length, 1)
})
test('permits different slots with different plates and different dates', async () => {
  const options = setup()
  await confirmDemoReservation(input, options)
  assert.ok((await confirmDemoReservation({ ...input, selectedId: 'A02', vehicle: { ...input.vehicle, plate: 'OTHER' } }, options)).ok)
  assert.ok((await confirmDemoReservation({ ...input, dateTime: { ...input.dateTime, date: '2026-10-29' } }, options)).ok)
})
test('serializes simultaneous confirmations so only one conflicting booking succeeds', async () => {
  const options = setup()
  const results = await Promise.all([confirmDemoReservation(input, options), confirmDemoReservation(input, options)])
  assert.equal(results.filter((result) => result.ok).length, 1)
  assert.equal(readDemoReservations(options.storage).length, 1)
})
test('fails safely on corrupt data, denied storage, quota failures, and unavailable locking', async () => {
  for (const raw of ['broken json', '{"version":1,"reservations":[null]}', '{"version":2,"reservations":[]}']) {
    const options = setup()
    options.storage.setItem(DEMO_RESERVATIONS_KEY, raw)
    assert.equal((await confirmDemoReservation(input, options)).ok, false)
    assert.equal(options.storage.getItem(DEMO_RESERVATIONS_KEY), raw)
  }
  const options = setup()
  assert.equal((await confirmDemoReservation(input, { ...options, storage: { getItem() { throw Error('denied') } } })).ok, false)
  assert.equal((await confirmDemoReservation(input, { ...options, storage: { getItem: () => null, setItem() { throw Error('quota') } } })).ok, false)
  assert.equal((await confirmDemoReservation(input, { ...options, locks: {} })).ok, false)
})
test('revalidates input and refuses duplicate reference IDs', async () => {
  const options = setup()
  assert.equal((await confirmDemoReservation({ ...input, vehicle: { ...input.vehicle, plate: '' } }, options)).ok, false)
  assert.equal(readDemoReservations(options.storage).length, 0)
  options.createId = () => 'same'
  await confirmDemoReservation(input, options)
  assert.equal((await confirmDemoReservation({ ...input, dateTime: { ...input.dateTime, date: '2026-10-29' } }, options)).ok, false)
})
