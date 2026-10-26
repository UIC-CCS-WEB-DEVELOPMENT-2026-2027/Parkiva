import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MOCK_SLOTS_KEY,
  readMockSlotOverrides,
  saveMockSlotStatus,
  applyMockSlotOverrides,
  currentMockSlots,
  mockSlotCounts,
  mockFacilityAvailability,
} from '../src/components/mockSlotState.js'
import { parkingSlotsByFacility } from '../src/components/parkingSlotData.js'
import { confirmDemoReservation } from '../src/components/demoReservations.js'

const catalog = parkingSlotsByFacility
function setup() {
  const data = new Map()
  let pending = Promise.resolve()
  return {
    accountId: 'operator-demo',
    storage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
    },
    locks: {
      request: (_, callback) => {
        const next = pending.then(callback)
        pending = next.catch(() => {})
        return next
      },
    },
    now: new Date(2026, 9, 26),
  }
}
const base = catalog['davao-aldevinco-parking']
test('reads missing overrides and derives counts without mutating fixtures', () => {
  assert.deepEqual(readMockSlotOverrides(setup().storage, catalog), {})
  const slots = applyMockSlotOverrides('davao-aldevinco-parking', base, {
    'davao-aldevinco-parking': { A01: 'Occupied' },
  })
  assert.equal(base[0].status, 'Available')
  assert.deepEqual(mockSlotCounts(slots), {
    Available: 2,
    Reserved: 1,
    Occupied: 3,
    Unavailable: 0,
  })
  assert.equal(
    mockFacilityAvailability(slots.map((slot) => ({ ...slot, status: 'Occupied' }))),
    'Full',
  )
  assert.equal(mockFacilityAvailability(catalog['davao-airport-parking']), 'Limited')
})
test('persists simultaneous slot changes without losing previous overrides', async () => {
  const options = setup()
  const results = await Promise.all([
    saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Reserved', catalog, options),
    saveMockSlotStatus('davao-aldevinco-parking', 'A04', 'Occupied', catalog, options),
  ])
  assert.ok(results.every((result) => result.ok))
  assert.deepEqual(readMockSlotOverrides(options.storage, catalog)['davao-aldevinco-parking'], {
    A01: 'Reserved',
    A04: 'Occupied',
  })
})
test('rejects unknown slots/statuses and preserves corrupt or unwritable storage', async () => {
  const options = setup()
  assert.equal(
    (await saveMockSlotStatus('davao-aldevinco-parking', 'other', 'Available', catalog, options))
      .ok,
    false,
  )
  assert.equal(
    (await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'invalid', catalog, options)).ok,
    false,
  )
  options.storage.setItem(MOCK_SLOTS_KEY, 'corrupt')
  assert.equal(
    (await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Available', catalog, options)).ok,
    false,
  )
  assert.equal(options.storage.getItem(MOCK_SLOTS_KEY), 'corrupt')
  assert.equal(
    (
      await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Available', catalog, {
        ...setup(),
        storage: {
          getItem: () => null,
          setItem() {
            throw Error('quota')
          },
        },
      })
    ).ok,
    false,
  )
})
test('overlays active reservations and demo entry without treating future/cancelled/exited bookings as occupied', () => {
  const now = new Date(2026, 9, 28, 10, 30)
  const record = {
    facility: { id: 'davao-aldevinco-parking' },
    slot: { id: 'A01' },
    dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
  }
  assert.equal(
    currentMockSlots('davao-aldevinco-parking', base, [record], now)[0].status,
    'Reserved',
  )
  assert.equal(
    currentMockSlots(
      'davao-aldevinco-parking',
      base,
      [{ ...record, pass: { enteredAt: '2026-10-28T10:00:00Z' } }],
      now,
    )[0].status,
    'Occupied',
  )
  for (const altered of [
    { ...record, status: 'cancelled' },
    { ...record, pass: { exitedAt: '2026-10-28T10:10:00Z' } },
    { ...record, dateTime: { ...record.dateTime, date: '2026-10-29' } },
  ]) {
    assert.equal(
      currentMockSlots('davao-aldevinco-parking', base, [altered], now)[0].status,
      'Available',
    )
  }
})
test('confirmation rechecks persisted manual changes against a stale available slot', async () => {
  const options = setup()
  await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Occupied', catalog, options)
  const result = await confirmDemoReservation(
    {
      facility: {
        id: 'davao-aldevinco-parking',
        name: 'Aldevinco Pay Parking',
        location: 'Example District',
        vehicles: ['Car'],
      },
      slots: base,
      selectedId: 'A01',
      dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
      vehicle: { type: 'Car', plate: 'ABC', model: '' },
    },
    options,
  )
  assert.equal(result.ok, false)
  assert.match(result.error, /no longer valid/)
})
