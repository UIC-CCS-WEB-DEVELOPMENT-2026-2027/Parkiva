import { DEMO_ACCOUNTS, getDemoStorage } from './demoAccounts.js'
import { validateReservationReview } from './reservationReviewValidation.js'
import { parkingSlotsByFacility } from './parkingSlotData.js'
import {
  notifyDemoDataChanged,
  readMockSlotOverrides,
  readSharedMockOverrides,
  applyMockSlotOverrides,
  currentMockSlots,
} from './mockSlotState.js'
import { readHostListings, hostCatalog, hostSlots } from './hostListings.js'

export const DEMO_RESERVATIONS_KEY = 'parkiva-demo-reservations-v1'
export const DEMO_NOTICE = 'Demo Only — No Actual Parking Reservation Created.'

export function createReservationDraft() {
  return {
    step: 'slots',
    selectedId: null,
    dateTime: { date: '', arrival: '', departure: '' },
    vehicle: { type: '', plate: '', model: '' },
    confirmation: null,
  }
}

const text = (value) => typeof value === 'string' && Boolean(value.trim())
function validRecord(record) {
  if (
    !record ||
    !text(record.reference) ||
    record.demo !== true ||
    !text(record.confirmedAt) ||
    Number.isNaN(Date.parse(record.confirmedAt))
  )
    return false
  if (record.status !== undefined && !['confirmed', 'cancelled'].includes(record.status))
    return false
  if (
    record.status === 'cancelled' &&
    (!text(record.cancelledAt) || Number.isNaN(Date.parse(record.cancelledAt)))
  )
    return false
  if (record.pass !== undefined) {
    const pass = record.pass
    if (!pass || typeof pass !== 'object' || Array.isArray(pass)) return false
    for (const key of ['enteredAt', 'exitedAt']) {
      if (pass[key] !== undefined && (!text(pass[key]) || Number.isNaN(Date.parse(pass[key]))))
        return false
    }
    if (
      pass.exitedAt &&
      (!pass.enteredAt || Date.parse(pass.exitedAt) < Date.parse(pass.enteredAt))
    )
      return false
  }
  const { facility, slot, dateTime, vehicle } = record
  if (
    !facility ||
    !slot ||
    !dateTime ||
    !vehicle ||
    !text(facility.id) ||
    !text(facility.name) ||
    !text(facility.location) ||
    !text(slot.id) ||
    !text(slot.vehicle)
  )
    return false
  if (
    !text(vehicle.type) ||
    !text(vehicle.plate) ||
    typeof vehicle.model !== 'string' ||
    !['date', 'arrival', 'departure'].every((key) => typeof dateTime[key] === 'string')
  )
    return false
  return (
    validateReservationReview(
      {
        facility: { ...facility, vehicles: [vehicle.type] },
        slots: [{ ...slot, status: 'Available' }],
        selectedId: slot.id,
        dateTime,
        vehicle,
      },
      new Date(0),
    ).length === 0
  )
}

export function readDemoReservations(storage) {
  const raw = storage.getItem(DEMO_RESERVATIONS_KEY)
  if (raw === null) return []
  const data = JSON.parse(raw)
  if (
    data?.version !== 1 ||
    !Array.isArray(data.reservations) ||
    !data.reservations.every(validRecord) ||
    new Set(data.reservations.map((record) => record.reference)).size !== data.reservations.length
  ) {
    throw new Error('Stored demo reservation data is invalid. It has not been overwritten.')
  }
  return data.reservations
}

// Histories stay partitioned; inventory and host verification share this browser.
// Corrupt partitions fail closed rather than silently omitting conflicts.
export function readBrowserReservationSources(storage = globalThis.localStorage) {
  return [null, ...DEMO_ACCOUNTS.map((account) => account.id)].map((accountId) => {
    const scoped = getDemoStorage(storage, accountId)
    return { accountId, storage: scoped, records: readDemoReservations(scoped) }
  })
}
export function readBrowserReservations(storage = globalThis.localStorage) {
  const records = readBrowserReservationSources(storage).flatMap((source) => source.records)
  if (new Set(records.map((record) => record.reference)).size !== records.length)
    throw Error('Ambiguous reference across demo workspaces')
  return records
}

const plateKey = (plate) => plate.replace(/[\s-]/g, '').toUpperCase()
export function hasDemoConflict(records, candidate) {
  return records.some(
    (record) =>
      record.status !== 'cancelled' &&
      !record.pass?.exitedAt &&
      record.dateTime.date === candidate.dateTime.date &&
      record.dateTime.arrival < candidate.dateTime.departure &&
      candidate.dateTime.arrival < record.dateTime.departure &&
      ((record.facility.id === candidate.facility.id && record.slot.id === candidate.slot.id) ||
        plateKey(record.vehicle.plate) === plateKey(candidate.vehicle.plate)),
  )
}

export function demoReservationStatus(record, now = new Date()) {
  if (record.status === 'cancelled') return 'Cancelled'
  if (record.pass?.exitedAt) return 'Completed'
  if (record.pass?.enteredAt) return 'Checked in'
  if (new Date(`${record.dateTime.date}T${record.dateTime.departure}`) <= now) return 'Completed'
  if (new Date(`${record.dateTime.date}T${record.dateTime.arrival}`) <= now) return 'In progress'
  return 'Upcoming'
}

export async function cancelDemoReservation(reference, options = {}) {
  try {
    const storage = options.storage ?? getDemoStorage()
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request)
      return {
        ok: false,
        error:
          'This browser cannot safely update demo reservations. Browser storage and Web Locks must be available.',
      }
    return await locks.request(DEMO_RESERVATIONS_KEY, () => {
      const records = readDemoReservations(storage)
      const index = records.findIndex((record) => record.reference === reference)
      if (index < 0)
        return {
          ok: false,
          error: 'This demo reservation could not be found. Refresh your reservations.',
        }
      const now = options.now ?? new Date()
      if (demoReservationStatus(records[index], now) !== 'Upcoming')
        return {
          ok: false,
          error:
            'Only upcoming demo reservations can be cancelled. Refresh to see the current status.',
        }
      const updated = { ...records[index], status: 'cancelled', cancelledAt: now.toISOString() }
      const next = records.map((record, position) => (position === index ? updated : record))
      storage.setItem(DEMO_RESERVATIONS_KEY, JSON.stringify({ version: 1, reservations: next }))
      notifyDemoDataChanged()
      return { ok: true, reservation: updated }
    })
  } catch {
    return {
      ok: false,
      error:
        'Cancellation could not be saved. Browser storage may be unavailable, full, or contain invalid data. No cancellation was recorded.',
    }
  }
}

// All tabs use the same browser lock and re-read storage immediately before writing.
// Fail closed if storage or locking is unavailable rather than showing false success.
export async function confirmDemoReservation(input, options = {}) {
  try {
    const storage = options.storage ?? getDemoStorage()
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request)
      return {
        ok: false,
        error:
          'This browser cannot safely save demo reservations. Try a browser with local storage and Web Locks enabled.',
      }
    return await locks.request(DEMO_RESERVATIONS_KEY, () => {
      const now = options.now ?? new Date()
      const latestAreas = options.storage
        ? []
        : hostCatalog(readHostListings(globalThis.localStorage))
      const facility = options.storage
        ? input.facility
        : latestAreas.find((area) => area.id === input.facility.id)
      if (!facility)
        return {
          ok: false,
          error: 'This preview listing is no longer available. Choose another parking location.',
        }
      const catalog = options.storage
        ? parkingSlotsByFacility
        : Object.fromEntries(
            latestAreas.map((area) => [
              area.id,
              parkingSlotsByFacility[area.id] || hostSlots(area),
            ]),
          )
      const overrides = options.storage
        ? readMockSlotOverrides(storage, catalog)
        : readSharedMockOverrides(globalThis.localStorage, catalog)
      const records = readDemoReservations(storage)
      const sharedRecords = options.storage ? records : readBrowserReservations()
      const slots = currentMockSlots(
        input.facility.id,
        applyMockSlotOverrides(
          input.facility.id,
          catalog[input.facility.id] || input.slots,
          overrides,
        ),
        sharedRecords,
        now,
      )
      if (validateReservationReview({ ...input, facility, slots }, now).length)
        return {
          ok: false,
          error:
            'Your selection is no longer valid. Review the slot, date/time, and vehicle information.',
        }
      const slot = input.slots.find((item) => item.id === input.selectedId)
      const candidate = {
        demo: true,
        reference: `DEMO-${(options.createId ?? (() => globalThis.crypto.randomUUID()))()}`,
        confirmedAt: now.toISOString(),
        facility: { id: facility.id, name: facility.name, location: facility.location },
        slot: { id: slot.id, vehicle: slot.vehicle },
        dateTime: { ...input.dateTime },
        vehicle: {
          type: input.vehicle.type,
          plate: input.vehicle.plate.trim(),
          model: input.vehicle.model.trim(),
        },
      }
      if (hasDemoConflict(sharedRecords, candidate))
        return {
          ok: false,
          error:
            'A stored demo reservation overlaps this slot or vehicle at that time. Choose another slot, vehicle, or time.',
        }
      if (sharedRecords.some((record) => record.reference === candidate.reference))
        return { ok: false, error: 'Could not generate a unique demo reference. Please try again.' }
      storage.setItem(
        DEMO_RESERVATIONS_KEY,
        JSON.stringify({ version: 1, reservations: [...records, candidate] }),
      )
      notifyDemoDataChanged()
      return { ok: true, reservation: candidate }
    })
  } catch {
    return {
      ok: false,
      error:
        'Demo reservation could not be saved. Browser storage may be unavailable, full, or contain invalid demo data. Existing data was not replaced; your selections are still here.',
    }
  }
}
