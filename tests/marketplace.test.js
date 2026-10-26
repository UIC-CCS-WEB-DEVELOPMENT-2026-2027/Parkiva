import test from 'node:test'
import assert from 'node:assert/strict'
import { marketplaceListings, estimatedTotal } from '../src/components/marketplaceData.js'
import { filterMarketplace } from '../src/components/marketplaceSearch.js'
import {
  HOST_LISTINGS_KEY,
  hostCatalog,
  hostSlots,
  readHostListings,
  saveHostListing,
  validateHostListing,
} from '../src/components/hostListings.js'
import {
  DEMO_RESERVATIONS_KEY,
  readBrowserReservations,
  demoReservationStatus,
  hasDemoConflict,
} from '../src/components/demoReservations.js'
import { validateReservationReview } from '../src/components/reservationReviewValidation.js'
import {
  demoPassToken,
  lookupHostDemoPass,
  normalizeDemoPassInput,
  verifyDemoPass,
} from '../src/components/demoPassVerification.js'
import { DEMO_SESSION_KEY, getDemoStorage } from '../src/components/demoAccounts.js'
import {
  currentMockSlots,
  readSharedMockOverrides,
  MOCK_SLOTS_KEY,
} from '../src/components/mockSlotState.js'

const memory = () => {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, val) => data.set(key, val),
    data,
  }
}
const locks = { request: async (_, work) => work() }
const listing = {
  name: 'Test courtyard (fictional)',
  location: 'Fictional space, Obrero, Davao City',
  neighborhood: 'Obrero',
  demoDescription: 'A fictional courtyard for browser testing.',
  hostName: 'Maria Santos',
  hostKind: 'Private space',
  vehicles: ['Car', 'Motorcycle'],
  capacity: 4,
  parkingType: 'Open-air',
  hourlyRate: 25,
  amenities: ['Lighting'],
  access: 'Illustrative entrance only.',
  demoHours: { open: '06:00', close: '22:00' },
}
const record = (patch = {}) => ({
  demo: true,
  reference: 'DEMO-cross-workspace',
  confirmedAt: '2026-10-26T00:00:00Z',
  facility: {
    id: 'demo-host-obrero-courtyard',
    name: 'A quiet courtyard in Obrero',
    location: 'Obrero, fictional preview',
  },
  slot: { id: 'P01', vehicle: 'Car' },
  dateTime: { date: '2026-10-26', arrival: '10:00', departure: '11:00' },
  vehicle: { type: 'Car', plate: 'TEST-123', model: '' },
  ...patch,
})

test('distinguishes researched venues from fictional hosts without changing verified identity', () => {
  assert.equal(marketplaceListings.filter((area) => area.verifiedLocation).length, 8)
  assert.equal(marketplaceListings.filter((area) => !area.verifiedLocation).length, 3)
  assert.ok(
    marketplaceListings
      .filter((area) => area.verifiedLocation)
      .every(
        (area) =>
          area.hostKind === 'Location preview' && area.hostName === 'Parkiva preview inventory',
      ),
  )
})
test('combines neighborhood, price, vehicle, cover and saved filters before immutable sorting', () => {
  const areas = marketplaceListings.map((area) => ({ ...area, availability: 'Available' }))
  const source = areas.map((area) => area.id)
  const results = filterMarketplace(
    areas,
    {
      search: ' lanang ',
      vehicle: 'Car',
      maxPrice: 30,
      parkingType: 'Open-air',
      availability: 'Available',
      savedOnly: true,
      sortBy: 'price-asc',
    },
    ['demo-host-lanang-lot'],
  )
  assert.deepEqual(
    results.map((area) => area.id),
    ['demo-host-lanang-lot'],
  )
  assert.deepEqual(
    areas.map((area) => area.id),
    source,
  )
  assert.deepEqual(
    filterMarketplace(areas, {}).map((area) => area.id),
    source,
  )
  assert.equal(estimatedTotal(25, { arrival: '10:00', departure: '11:15' }), 50)
  assert.equal(estimatedTotal(25, { arrival: '12:00', departure: '11:00' }), null)
})
test('validates host listing fields and protects storage on rejected or failed saves', async () => {
  const raw = memory()
  assert.ok(
    Object.keys(
      validateHostListing({
        ...listing,
        vehicles: [],
        capacity: 0,
        hourlyRate: -1,
        demoHours: { open: '22:00', close: '06:00' },
      }),
    ).length >= 4,
  )
  assert.equal(
    (await saveHostListing(listing, { storage: raw, accountId: 'driver-demo', locks })).ok,
    false,
  )
  assert.equal(
    (
      await saveHostListing(
        { ...listing, capacity: 31 },
        { storage: raw, accountId: 'operator-demo', locks },
      )
    ).ok,
    false,
  )
  assert.equal(raw.getItem(HOST_LISTINGS_KEY), null)
  raw.setItem(HOST_LISTINGS_KEY, 'corrupt')
  assert.equal(
    (await saveHostListing(listing, { storage: raw, accountId: 'operator-demo', locks })).ok,
    false,
  )
  assert.equal(raw.getItem(HOST_LISTINGS_KEY), 'corrupt')
  assert.throws(() => readHostListings(raw))
  assert.equal(
    (
      await saveHostListing(listing, {
        storage: {
          getItem: () => null,
          setItem: () => {
            throw Error('quota')
          },
        },
        accountId: 'operator-demo',
        locks,
      })
    ).ok,
    false,
  )
})
test('creates and edits durable fictional inventory and preserves existing slot identity', async () => {
  const raw = memory()
  const options = { storage: raw, accountId: 'operator-demo', locks, createId: () => 'unit-test' }
  const saved = await saveHostListing(listing, options)
  assert.ok(saved.ok)
  let area = hostCatalog(readHostListings(raw)).find((area) => area.id === saved.id)
  assert.equal(area.verifiedLocation, false)
  assert.equal(hostSlots(area).length, 4)
  assert.equal((await saveHostListing({ ...area, hourlyRate: 40 }, options)).ok, true)
  area = hostCatalog(readHostListings(raw)).find((area) => area.id === saved.id)
  assert.equal(area.hourlyRate, 40)
  assert.equal((await saveHostListing({ ...area, capacity: 2 }, options)).ok, false)
  assert.equal((await saveHostListing({ ...area, id: 'davao-gmall-parking' }, options)).ok, false)
  assert.ok(!raw.getItem(HOST_LISTINGS_KEY).includes('blob:'))
})
test('rejects factual identity edits and allows only illustrative inventory changes', async () => {
  const raw = memory()
  const area = marketplaceListings.find((area) => area.id === 'davao-aldevinco-parking')
  const options = { storage: raw, accountId: 'operator-demo', locks, slotCount: 6 }
  assert.equal((await saveHostListing({ ...area, capacity: 6, hourlyRate: 55 }, options)).ok, true)
  assert.equal(
    (await saveHostListing({ ...area, capacity: 6, name: 'My actual business' }, options)).ok,
    false,
  )
  assert.equal(
    hostCatalog(readHostListings(raw)).find((item) => item.id === area.id).name,
    area.name,
  )
})
test('host checks a driver pass across partitions; duplicate transitions are blocked and bay releases on exit', async () => {
  const raw = memory()
  raw.setItem(DEMO_SESSION_KEY, JSON.stringify({ accountId: 'operator-demo' }))
  const driver = getDemoStorage(raw, 'driver-demo')
  driver.setItem(DEMO_RESERVATIONS_KEY, JSON.stringify({ version: 1, reservations: [record()] }))
  assert.equal(readBrowserReservations(raw).length, 1)
  assert.equal(
    lookupHostDemoPass('DEMO-cross-workspace', { storage: raw }).record.vehicle.plate,
    'TEST-123',
  )
  assert.equal(normalizeDemoPassInput('DEMO-cross-workspace'), 'DEMO-cross-workspace')
  assert.equal(normalizeDemoPassInput('arbitrary URL'), null)
  const options = {
    host: true,
    rawStorage: raw,
    storage: getDemoStorage(raw, 'operator-demo'),
    locks,
    now: new Date('2026-10-26T10:15:00'),
  }
  const token = demoPassToken('DEMO-cross-workspace')
  assert.equal((await verifyDemoPass(token, 'entry', options)).ok, true)
  let records = readBrowserReservations(raw)
  assert.equal(demoReservationStatus(records[0]), 'Checked in')
  const slots = [{ id: 'P01', vehicle: 'Car', status: 'Available' }]
  assert.equal(currentMockSlots('demo-host-obrero-courtyard', slots, records)[0].status, 'Occupied')
  assert.equal((await verifyDemoPass(token, 'entry', options)).ok, false)
  assert.equal((await verifyDemoPass(token, 'exit', options)).ok, true)
  assert.equal((await verifyDemoPass(token, 'exit', options)).ok, false)
  records = readBrowserReservations(raw)
  assert.equal(demoReservationStatus(records[0]), 'Completed')
  assert.equal(
    currentMockSlots('demo-host-obrero-courtyard', slots, records)[0].status,
    'Available',
  )
  assert.equal(getDemoStorage(raw, 'operator-demo').getItem(DEMO_RESERVATIONS_KEY), null)
})
test('host lookup rejects unassigned, cancelled, corrupt and ambiguous passes without rewriting history', async () => {
  const raw = memory()
  const driver = getDemoStorage(raw, 'driver-demo')
  const options = { storage: raw, accountId: 'operator-demo' }
  driver.setItem(
    DEMO_RESERVATIONS_KEY,
    JSON.stringify({
      version: 1,
      reservations: [
        record({ facility: { id: 'davao-gmall-parking', name: 'Gmall', location: 'Bajada' } }),
      ],
    }),
  )
  assert.throws(() => lookupHostDemoPass('DEMO-cross-workspace', options), /outside/)
  assert.throws(
    () => lookupHostDemoPass('DEMO-cross-workspace', { ...options, accountId: 'driver-demo' }),
    /host/,
  )
  driver.setItem(
    DEMO_RESERVATIONS_KEY,
    JSON.stringify({
      version: 1,
      reservations: [record({ status: 'cancelled', cancelledAt: '2026-10-26T00:10:00Z' })],
    }),
  )
  assert.equal(
    (
      await verifyDemoPass(demoPassToken('DEMO-cross-workspace'), 'entry', {
        host: true,
        accountId: 'operator-demo',
        rawStorage: raw,
        storage: driver,
        locks,
      })
    ).ok,
    false,
  )
  getDemoStorage(raw, null).setItem(DEMO_RESERVATIONS_KEY, driver.getItem(DEMO_RESERVATIONS_KEY))
  assert.throws(() => readBrowserReservations(raw), /Ambiguous/)
  assert.throws(() => lookupHostDemoPass('DEMO-cross-workspace', options), /ambiguous/)
})

test('completed passes release remaining reserved time and preserve history snapshots', () => {
  const original = record({
    pass: { enteredAt: '2026-10-26T02:05:00Z', exitedAt: '2026-10-26T02:20:00Z' },
  })
  const candidate = record({
    reference: 'DEMO-new',
    dateTime: { date: '2026-10-26', arrival: '10:30', departure: '11:30' },
  })
  assert.equal(hasDemoConflict([original], candidate), false)
  assert.equal(original.dateTime.departure, '11:00')
})
test('honors preview opening hours when reviewing a visit', () => {
  const input = {
    facility: { ...listing, id: 'test' },
    slots: [{ id: 'P01', vehicle: 'Car', status: 'Available' }],
    selectedId: 'P01',
    vehicle: { type: 'Car', plate: 'TEST', model: '' },
    dateTime: { date: '2026-10-28', arrival: '05:00', departure: '07:00' },
  }
  assert.ok(
    validateReservationReview(input, new Date('2026-10-26T00:00:00')).some((issue) =>
      issue.message.includes('preview hours'),
    ),
  )
})
test('retains legacy guest inventory with newer host changes taking precedence', () => {
  const raw = memory()
  const catalog = { 'demo-host-obrero-courtyard': [{ id: 'P01' }, { id: 'P02' }] }
  raw.setItem(
    MOCK_SLOTS_KEY,
    JSON.stringify({
      version: 1,
      facilities: { 'demo-host-obrero-courtyard': { P01: 'Reserved', P02: 'Occupied' } },
    }),
  )
  getDemoStorage(raw, 'operator-demo').setItem(
    MOCK_SLOTS_KEY,
    JSON.stringify({
      version: 1,
      facilities: { 'demo-host-obrero-courtyard': { P01: 'Unavailable' } },
    }),
  )
  assert.deepEqual(readSharedMockOverrides(raw, catalog)['demo-host-obrero-courtyard'], {
    P01: 'Unavailable',
    P02: 'Occupied',
  })
  assert.ok(raw.getItem(MOCK_SLOTS_KEY).includes('Reserved'))
})
