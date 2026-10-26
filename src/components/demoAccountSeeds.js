import { parkingAreas } from './parkingData.js'
import { parkingSlotsByFacility } from './parkingSlotData.js'
import { localDateValue } from './reservationDateTime.js'
import { getDemoStorage, demoAccount } from './demoAccounts.js'

export function seedDemoAccount(storage, accountId, now = new Date()) {
  if (!demoAccount(accountId)) throw Error('Unknown demo account')
  const scoped = getDemoStorage(storage, accountId)
  const dateAt = (days) => { const date = new Date(now); date.setDate(date.getDate() + days); return localDateValue(date) }
  function record(facilityId, slotId, offset, suffix, extra = {}) {
    const facility = parkingAreas.find((item) => item.id === facilityId)
    const slot = parkingSlotsByFacility[facilityId].find((item) => item.id === slotId)
    return {
      demo: true, seeded: true, reference: `DEMO-${accountId}-${suffix}-${dateAt(0)}`,
      confirmedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      facility: { id: facility.id, name: facility.name, location: facility.location },
      slot: { id: slot.id, vehicle: slot.vehicle },
      vehicle: { type: slot.vehicle, plate: accountId === 'driver-demo' ? 'DEMO-DRIVER' : 'DEMO-OPERATOR', model: 'Sample vehicle' },
      dateTime: { date: dateAt(offset), arrival: '10:00', departure: '11:00' }, ...extra,
    }
  }
  const driver = accountId === 'driver-demo'
  const records = driver ? [
    record('davao-aldevinco-parking', 'A04', 2, 'upcoming'),
    record('davao-gmall-parking', 'G01', -3, 'history'),
    record('davao-sm-lanang-parking', 'E04', 1, 'cancelled', { status: 'cancelled', cancelledAt: now.toISOString() }),
  ] : [
    record('davao-aldevinco-parking', 'A01', 0, 'occupancy', { dateTime: { date: dateAt(0), arrival: '00:00', departure: '23:59' }, pass: { enteredAt: now.toISOString() } }),
    record('davao-sm-city-parking', 'D04', 1, 'upcoming'),
  ]
  // Seed only absent keys; never overwrite edits, cancellations, or corrupted data.
  if (scoped.getItem('parkiva-demo-reservations-v1') === null) scoped.setItem('parkiva-demo-reservations-v1', JSON.stringify({ version: 1, reservations: records }))
  if (scoped.getItem('parkiva-saved-parking-ids') === null) scoped.setItem('parkiva-saved-parking-ids', JSON.stringify(driver ? ['davao-aldevinco-parking', 'davao-abreeza-parking', 'davao-sm-city-parking'] : []))
  if (!driver && scoped.getItem('parkiva-mock-slot-statuses-v1') === null) scoped.setItem('parkiva-mock-slot-statuses-v1', JSON.stringify({ version: 1, facilities: { 'davao-aldevinco-parking': { A01: 'Occupied', A04: 'Reserved' } } }))
}
