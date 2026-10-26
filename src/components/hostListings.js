import {
  AMENITIES,
  DEFAULT_RULES,
  NEIGHBORHOODS,
  PARKING_TYPES,
  marketplaceListings,
} from './marketplaceData.js'
import { readDemoAccountId } from './demoAccounts.js'

export const HOST_LISTINGS_KEY = 'parkiva-host-listings-v1'
const text = (value) => typeof value === 'string' && value.trim().length > 0
export function validateHostListing(value) {
  const errors = {}
  if (!text(value.name) || value.name.trim().length > 100)
    errors.name = 'Enter a title of 1–100 characters.'
  if (!text(value.location) || value.location.trim().length > 240)
    errors.location = 'Enter a fictional address of 1–240 characters.'
  if (!NEIGHBORHOODS.includes(value.neighborhood)) errors.neighborhood = 'Choose a neighborhood.'
  if (!text(value.demoDescription) || value.demoDescription.length > 1500)
    errors.demoDescription = 'Describe the space in 1–1,500 characters.'
  if (!text(value.hostName) || value.hostName.length > 60)
    errors.hostName = 'Enter a fictional host name of 1–60 characters.'
  if (
    !['Private space', 'Independent lot', 'Business parking', 'Location preview'].includes(
      value.hostKind,
    )
  )
    errors.hostKind = 'Choose a listing category.'
  if (
    !Array.isArray(value.vehicles) ||
    !value.vehicles.length ||
    value.vehicles.some((v) => !['Car', 'Motorcycle'].includes(v))
  )
    errors.vehicles = 'Choose at least one supported vehicle.'
  if (!PARKING_TYPES.includes(value.parkingType))
    errors.parkingType = 'Choose covered or open-air parking.'
  if (
    !Number.isInteger(Number(value.capacity)) ||
    Number(value.capacity) < 1 ||
    Number(value.capacity) > 30
  )
    errors.capacity = 'Use 1–30 simulated spaces.'
  if (
    !Number.isFinite(Number(value.hourlyRate)) ||
    Number(value.hourlyRate) < 1 ||
    Number(value.hourlyRate) > 1000
  )
    errors.hourlyRate = 'Use a simulated hourly price from ₱1 to ₱1,000.'
  if (!text(value.access) || value.access.length > 1000)
    errors.access = 'Add entrance instructions of 1–1,000 characters.'
  if (!Array.isArray(value.amenities) || value.amenities.some((v) => !AMENITIES.includes(v)))
    errors.amenities = 'Choose amenities from the list.'
  if (
    value.rules !== undefined &&
    (!Array.isArray(value.rules) ||
      value.rules.length > 10 ||
      value.rules.some((rule) => typeof rule !== 'string' || rule.length > 300))
  )
    errors.rules = 'Use up to 10 short parking rules.'
  const time = /^([01]\d|2[0-3]):[0-5]\d$/
  if (
    !time.test(value.demoHours?.open || '') ||
    !time.test(value.demoHours?.close || '') ||
    value.demoHours.open >= value.demoHours.close
  )
    errors.demoHours = 'Closing must be later than opening on the same day.'
  return errors
}
export function readHostListings(storage) {
  const raw = storage.getItem(HOST_LISTINGS_KEY)
  if (raw === null) return { version: 1, listings: [], edits: {} }
  const data = JSON.parse(raw)
  if (
    data?.version !== 1 ||
    !Array.isArray(data.listings) ||
    !data.edits ||
    typeof data.edits !== 'object' ||
    Array.isArray(data.edits)
  )
    throw Error('Invalid host listing storage')
  const ids = new Set(marketplaceListings.map((area) => area.id))
  for (const listing of data.listings) {
    if (
      !/^demo-host-[a-z0-9-]{1,80}$/.test(listing.id) ||
      ids.has(listing.id) ||
      listing.ownerAccountId !== 'operator-demo' ||
      listing.verifiedLocation !== false ||
      Object.keys(validateHostListing(listing)).length
    )
      throw Error('Invalid host listing')
    ids.add(listing.id)
  }
  for (const [id, edit] of Object.entries(data.edits)) {
    const original = [...marketplaceListings, ...data.listings].find((area) => area.id === id)
    if (
      !original ||
      !editableFacility(id, data.listings) ||
      !edit ||
      Object.keys(validateHostListing({ ...original, capacity: original.capacity || 6, ...edit }))
        .length
    )
      throw Error('Invalid listing edit')
    if (
      original.verifiedLocation &&
      (edit.name !== original.name ||
        edit.location !== original.location ||
        edit.hostName !== original.hostName ||
        edit.hostKind !== original.hostKind)
    )
      throw Error('Factual identity cannot be changed')
  }
  return data
}
export function editableFacility(id, custom = []) {
  return (
    ['davao-aldevinco-parking', 'davao-sm-city-parking', 'davao-sm-lanang-parking'].includes(id) ||
    fictionalIds.includes(id) ||
    custom.some((area) => area.id === id && area.ownerAccountId === 'operator-demo')
  )
}
const fictionalIds = marketplaceListings
  .filter((area) => !area.verifiedLocation)
  .map((area) => area.id)
export function hostCatalog(data) {
  return [...marketplaceListings, ...data.listings].map((area) => ({
    ...area,
    ...data.edits[area.id],
  }))
}
export function hostSlots(area) {
  return Array.from({ length: Number(area.capacity) || 4 }, (_, index) => ({
    id: `P${String(index + 1).padStart(2, '0')}`,
    vehicle: area.vehicles.length === 1 ? area.vehicles[0] : index % 3 === 2 ? 'Motorcycle' : 'Car',
    status: 'Available',
  }))
}
export async function saveHostListing(value, options = {}) {
  try {
    const storage = options.storage ?? globalThis.localStorage
    if ((options.accountId ?? readDemoAccountId(storage)) !== 'operator-demo')
      return { ok: false, error: 'Use the host demo account to manage preview listings.' }
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request)
      return {
        ok: false,
        error: 'This browser needs local storage and Web Locks to save a listing.',
      }
    return await locks.request('parkiva-demo-reservations-v1', () => {
      const data = readHostListings(storage)
      const original = hostCatalog(data).find((area) => area.id === value.id)
      if (value.id && (!original || !editableFacility(value.id, data.listings)))
        return { ok: false, error: 'This listing is outside the assigned host preview.' }
      const listing = {
        name: value.name?.trim(),
        location: value.location?.trim(),
        neighborhood: value.neighborhood,
        demoDescription: value.demoDescription?.trim(),
        hostName: value.hostName?.trim(),
        hostKind: value.hostKind,
        vehicles: value.vehicles,
        parkingType: value.parkingType,
        capacity: Number(value.capacity),
        hourlyRate: Number(value.hourlyRate),
        amenities: value.amenities,
        access: value.access?.trim(),
        demoHours: value.demoHours,
        rules: (value.rules || DEFAULT_RULES).map((rule) => rule.trim()).filter(Boolean),
      }
      // Existing slot IDs and vehicle compatibility stay stable for saved reservations.
      if (
        original &&
        (listing.capacity !== (original.capacity || options.slotCount || 6) ||
          JSON.stringify(listing.vehicles) !== JSON.stringify(original.vehicles))
      )
        return {
          ok: false,
          error:
            'Existing bay count and vehicle types cannot change while saved passes may reference them.',
        }
      if (
        original?.verifiedLocation &&
        (listing.name !== original.name ||
          listing.location !== original.location ||
          listing.hostName !== original.hostName ||
          listing.hostKind !== original.hostKind)
      )
        return {
          ok: false,
          error:
            'Real location names, addresses and ownership claims cannot be edited in this preview.',
        }
      const errors = validateHostListing(listing)
      if (Object.keys(errors).length)
        return { ok: false, error: 'Check the listing fields.', errors }
      const id = original?.id ?? `demo-host-${(options.createId ?? (() => crypto.randomUUID()))()}`
      if (!original && hostCatalog(data).some((area) => area.id === id))
        return {
          ok: false,
          error: 'A unique listing identifier could not be created. Please try again.',
        }
      const next = original
        ? { ...data, edits: { ...data.edits, [id]: listing } }
        : {
            ...data,
            listings: [
              ...data.listings,
              {
                ...listing,
                id,
                ownerAccountId: 'operator-demo',
                verifiedLocation: false,
                description: 'Fictional host and property created in this browser preview.',
                imageKey: listing.parkingType === 'Covered' ? 'garage' : 'outdoor',
                sources: [],
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.neighborhood} Davao City`)}`,
              },
            ],
          }
      storage.setItem(HOST_LISTINGS_KEY, JSON.stringify(next))
      if (typeof window !== 'undefined')
        window.dispatchEvent(new Event('parkiva-demo-data-changed'))
      return { ok: true, id }
    })
  } catch {
    return {
      ok: false,
      error:
        'The listing could not be saved. Browser storage may be full, unavailable, or invalid. Existing data has been kept.',
    }
  }
}
