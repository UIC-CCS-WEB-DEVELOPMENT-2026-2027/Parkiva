import test from 'node:test'
import assert from 'node:assert/strict'
import { parkingAreas, retiredParkingIds } from '../src/components/parkingData.js'
import { parkingSlotsByFacility } from '../src/components/parkingSlotData.js'
import { MOCK_SLOTS_KEY, readMockSlotOverrides } from '../src/components/mockSlotState.js'

test('has eight distinct researched Davao facilities with sources and keyless Maps searches', () => {
  assert.equal(parkingAreas.length, 8)
  assert.equal(new Set(parkingAreas.map((area) => area.id)).size, 8)
  for (const area of parkingAreas) {
    assert.ok(!retiredParkingIds.includes(area.id))
    assert.match(area.location, /Davao City/)
    assert.ok(area.sources.length >= 2)
    assert.equal(area.researchedOn, '2026-10-26')
    assert.equal(area.photoStatus, 'placeholder')
    const maps = new URL(area.googleMapsUrl)
    assert.equal(maps.hostname, 'www.google.com')
    assert.equal(maps.searchParams.get('api'), '1')
    assert.equal(maps.searchParams.get('query'), area.mapsQuery)
    assert.equal(maps.searchParams.has('key'), false)
    for (const source of area.sources) assert.equal(new URL(source.url).protocol, 'https:')
    assert.ok(parkingSlotsByFacility[area.id].every((slot) => area.vehicles.includes(slot.vehicle)))
    assert.equal('price' in area || 'capacity' in area || 'hours' in area, false)
  }
})
test('ignores retired fictional overrides without remapping them or rewriting storage', () => {
  const raw = JSON.stringify({ version: 1, facilities: {
    'sample-courtyard': { A01: 'Occupied' },
    'davao-aldevinco-parking': { A04: 'Reserved' },
  } })
  const storage = { getItem: (key) => key === MOCK_SLOTS_KEY ? raw : null }
  assert.deepEqual(readMockSlotOverrides(storage, parkingSlotsByFacility), { 'davao-aldevinco-parking': { A04: 'Reserved' } })
  assert.equal(storage.getItem(MOCK_SLOTS_KEY), raw)
  assert.throws(() => readMockSlotOverrides({ getItem: () => '{"version":1,"facilities":{"unknown":{}}}' }, parkingSlotsByFacility))
})
