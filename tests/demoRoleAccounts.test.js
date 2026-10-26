import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_ACCOUNTS, DEMO_SESSION_KEY, OPERATOR_DEMO_FACILITIES, validateRoleLogin, getDemoStorage, readDemoAccountId, canManageDemoFacility } from '../src/components/demoAccounts.js'
import { seedDemoAccount } from '../src/components/demoAccountSeeds.js'
import { parkingAreas } from '../src/components/parkingData.js'
import { parkingSlotsByFacility } from '../src/components/parkingSlotData.js'
import { DEMO_RESERVATIONS_KEY, readDemoReservations } from '../src/components/demoReservations.js'
import { MOCK_SLOTS_KEY, saveMockSlotStatus } from '../src/components/mockSlotState.js'

function storage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key), data }
}
test('only the two exact public demo credential pairs start a simulated role', () => {
  for (const account of DEMO_ACCOUNTS) assert.equal(validateRoleLogin(account).account.id, account.id)
  assert.equal(validateRoleLogin({ email: 'driver@parkiva.demo', password: 'OperatorDemo123!' }).account, null)
  assert.deepEqual(Object.keys(validateRoleLogin({ email: '', password: '' }).errors), ['email', 'password'])
  assert.equal(validateRoleLogin({ email: 'invalid', password: 'x' }).account, null)
})
test('restores only known account identifiers and scopes data without changing guest keys', () => {
  const raw = storage()
  raw.setItem(DEMO_RESERVATIONS_KEY, 'guest-data')
  raw.setItem(DEMO_SESSION_KEY, JSON.stringify({ role: 'admin' }))
  assert.equal(readDemoAccountId(raw), null)
  raw.setItem(DEMO_SESSION_KEY, JSON.stringify({ accountId: 'driver-demo' }))
  assert.equal(readDemoAccountId(raw), 'driver-demo')
  getDemoStorage(raw).setItem(DEMO_RESERVATIONS_KEY, 'driver-data')
  getDemoStorage(raw, 'operator-demo').setItem(DEMO_RESERVATIONS_KEY, 'operator-data')
  assert.equal(raw.getItem(DEMO_RESERVATIONS_KEY), 'guest-data')
  assert.equal(getDemoStorage(raw, 'driver-demo').getItem(DEMO_RESERVATIONS_KEY), 'driver-data')
  assert.equal(getDemoStorage(raw, 'operator-demo').getItem(DEMO_RESERVATIONS_KEY), 'operator-data')
})
test('preloads verified facilities, separate histories, favorites and operator occupancy without stored passwords', () => {
  const raw = storage()
  for (const account of DEMO_ACCOUNTS) seedDemoAccount(raw, account.id, new Date(2026, 9, 26, 12))
  const driver = getDemoStorage(raw, 'driver-demo')
  const operator = getDemoStorage(raw, 'operator-demo')
  assert.equal(readDemoReservations(driver).length, 3)
  assert.equal(readDemoReservations(operator).length, 2)
  assert.equal(JSON.parse(driver.getItem('parkiva-saved-parking-ids')).length, 3)
  assert.ok(operator.getItem(MOCK_SLOTS_KEY))
  for (const scoped of [driver, operator]) for (const record of readDemoReservations(scoped)) {
    const facility = parkingAreas.find((item) => item.id === record.facility.id)
    assert.equal(record.facility.name, facility.name)
    assert.equal(record.facility.location, facility.location)
  }
  const allData = JSON.stringify([...raw.data])
  assert.ok(!allData.includes('DriverDemo123!') && !allData.includes('OperatorDemo123!'))
})
test('does not reseed or overwrite edited/corrupted account data on subsequent login', () => {
  const raw = storage()
  seedDemoAccount(raw, 'driver-demo')
  const scoped = getDemoStorage(raw, 'driver-demo')
  scoped.setItem('parkiva-saved-parking-ids', '[]')
  scoped.setItem(DEMO_RESERVATIONS_KEY, 'corrupt')
  seedDemoAccount(raw, 'driver-demo')
  assert.equal(scoped.getItem('parkiva-saved-parking-ids'), '[]')
  assert.equal(scoped.getItem(DEMO_RESERVATIONS_KEY), 'corrupt')
})
test('operator assignments use verified IDs and reject guest, driver and outside-facility edits', async () => {
  assert.ok(OPERATOR_DEMO_FACILITIES.every((id) => parkingAreas.some((area) => area.id === id)))
  assert.equal(canManageDemoFacility('operator-demo', 'davao-gmall-parking'), false)
  const raw = storage()
  const options = { storage: raw, locks: { request: (_, run) => run() } }
  for (const accountId of [null, 'driver-demo']) assert.equal((await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Available', parkingSlotsByFacility, { ...options, accountId })).ok, false)
  assert.equal((await saveMockSlotStatus('davao-gmall-parking', 'G01', 'Occupied', parkingSlotsByFacility, { ...options, accountId: 'operator-demo' })).ok, false)
  assert.equal(raw.getItem(MOCK_SLOTS_KEY), null)
  assert.ok((await saveMockSlotStatus('davao-aldevinco-parking', 'A01', 'Available', parkingSlotsByFacility, { ...options, accountId: 'operator-demo' })).ok)
})
