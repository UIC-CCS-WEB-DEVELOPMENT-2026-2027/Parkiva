import { validateReservationReview } from './reservationReviewValidation.js'

export const DEMO_RESERVATIONS_KEY = 'parkiva-demo-reservations-v1'
export const DEMO_NOTICE = 'Demo Only — No Actual Parking Reservation Created.'

export function createReservationDraft() {
  return { step: 'slots', selectedId: null, dateTime: { date: '', arrival: '', departure: '' }, vehicle: { type: '', plate: '', model: '' }, confirmation: null }
}

const text = (value) => typeof value === 'string' && Boolean(value.trim())
function validRecord(record) {
  if (!record || !text(record.reference) || record.demo !== true || !text(record.confirmedAt) || Number.isNaN(Date.parse(record.confirmedAt))) return false
  const { facility, slot, dateTime, vehicle } = record
  if (!facility || !slot || !dateTime || !vehicle || !text(facility.id) || !text(facility.name) || !text(facility.location) || !text(slot.id) || !text(slot.vehicle)) return false
  if (!text(vehicle.type) || !text(vehicle.plate) || typeof vehicle.model !== 'string' || !['date', 'arrival', 'departure'].every((key) => typeof dateTime[key] === 'string')) return false
  return validateReservationReview({ facility: { ...facility, vehicles: [vehicle.type] }, slots: [{ ...slot, status: 'Available' }], selectedId: slot.id, dateTime, vehicle }, new Date(0)).length === 0
}

export function readDemoReservations(storage) {
  const raw = storage.getItem(DEMO_RESERVATIONS_KEY)
  if (raw === null) return []
  const data = JSON.parse(raw)
  if (data?.version !== 1 || !Array.isArray(data.reservations) || !data.reservations.every(validRecord)) {
    throw new Error('Stored demo reservation data is invalid. It has not been overwritten.')
  }
  return data.reservations
}

const plateKey = (plate) => plate.replace(/[\s-]/g, '').toUpperCase()
export function hasDemoConflict(records, candidate) {
  return records.some((record) => record.dateTime.date === candidate.dateTime.date &&
    record.dateTime.arrival < candidate.dateTime.departure && candidate.dateTime.arrival < record.dateTime.departure &&
    ((record.facility.id === candidate.facility.id && record.slot.id === candidate.slot.id) ||
      plateKey(record.vehicle.plate) === plateKey(candidate.vehicle.plate)))
}

// All tabs use the same browser lock and re-read storage immediately before writing.
// Fail closed if storage or locking is unavailable rather than showing false success.
export async function confirmDemoReservation(input, options = {}) {
  try {
    const storage = options.storage ?? globalThis.localStorage
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request) return { ok: false, error: 'This browser cannot safely save demo reservations. Try a browser with local storage and Web Locks enabled.' }
    return await locks.request(DEMO_RESERVATIONS_KEY, () => {
      const now = options.now ?? new Date()
      if (validateReservationReview(input, now).length) return { ok: false, error: 'Your selection is no longer valid. Review the slot, date/time, and vehicle information.' }
      const records = readDemoReservations(storage)
      const slot = input.slots.find((item) => item.id === input.selectedId)
      const candidate = {
        demo: true,
        reference: `DEMO-${(options.createId ?? (() => globalThis.crypto.randomUUID()))()}`,
        confirmedAt: now.toISOString(),
        facility: { id: input.facility.id, name: input.facility.name, location: input.facility.location },
        slot: { id: slot.id, vehicle: slot.vehicle },
        dateTime: { ...input.dateTime },
        vehicle: { type: input.vehicle.type, plate: input.vehicle.plate.trim(), model: input.vehicle.model.trim() },
      }
      if (hasDemoConflict(records, candidate)) return { ok: false, error: 'A stored demo reservation overlaps this slot or vehicle at that time. Choose another slot, vehicle, or time.' }
      if (records.some((record) => record.reference === candidate.reference)) return { ok: false, error: 'Could not generate a unique demo reference. Please try again.' }
      storage.setItem(DEMO_RESERVATIONS_KEY, JSON.stringify({ version: 1, reservations: [...records, candidate] }))
      return { ok: true, reservation: candidate }
    })
  } catch {
    return { ok: false, error: 'Demo reservation could not be saved. Browser storage may be unavailable, full, or contain invalid demo data. Existing data was not replaced; your selections are still here.' }
  }
}
