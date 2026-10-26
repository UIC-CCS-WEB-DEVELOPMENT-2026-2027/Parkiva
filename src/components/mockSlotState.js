export const MOCK_SLOTS_KEY = 'parkiva-mock-slot-statuses-v1'
export const DEMO_DATA_EVENT = 'parkiva-demo-data-changed'
export const SLOT_STATUSES = ['Available', 'Reserved', 'Occupied']

export function notifyDemoDataChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DEMO_DATA_EVENT))
}

export function readMockSlotOverrides(storage, catalog) {
  const raw = storage.getItem(MOCK_SLOTS_KEY)
  if (raw === null) return {}
  const data = JSON.parse(raw)
  if (data?.version !== 1 || !data.facilities || typeof data.facilities !== 'object' || Array.isArray(data.facilities)) throw Error('Invalid mock slot data')
  for (const [facilityId, slots] of Object.entries(data.facilities)) {
    if (!catalog[facilityId] || !slots || typeof slots !== 'object' || Array.isArray(slots)) throw Error('Invalid mock facility')
    for (const [slotId, status] of Object.entries(slots)) {
      if (!catalog[facilityId].some((slot) => slot.id === slotId) || !SLOT_STATUSES.includes(status)) throw Error('Invalid mock slot')
    }
  }
  return data.facilities
}

export function applyMockSlotOverrides(facilityId, slots, overrides) {
  return slots.map((slot) => ({ ...slot, status: overrides[facilityId]?.[slot.id] ?? slot.status }))
}

export function currentMockSlots(facilityId, slots, records, now = new Date()) {
  return slots.map((slot) => {
    const relevant = records.filter((record) => record.facility.id === facilityId && record.slot.id === slot.id && record.status !== 'cancelled' && !record.pass?.exitedAt)
    const occupied = relevant.some((record) => Boolean(record.pass?.enteredAt))
    const reserved = relevant.some((record) => new Date(`${record.dateTime.date}T${record.dateTime.arrival}`) <= now && now < new Date(`${record.dateTime.date}T${record.dateTime.departure}`))
    return { ...slot, status: occupied || slot.status === 'Occupied' ? 'Occupied' : reserved ? 'Reserved' : slot.status }
  })
}

export function mockSlotCounts(slots) {
  return slots.reduce((counts, slot) => ({ ...counts, [slot.status]: counts[slot.status] + 1 }), { Available: 0, Reserved: 0, Occupied: 0 })
}

export function mockFacilityAvailability(slots) {
  const count = mockSlotCounts(slots).Available
  return count === 0 ? 'Full' : count / slots.length <= 0.25 ? 'Limited' : 'Available'
}

export async function saveMockSlotStatus(facilityId, slotId, status, catalog, options = {}) {
  try {
    if (!catalog[facilityId]?.some((slot) => slot.id === slotId) || !SLOT_STATUSES.includes(status)) return { ok: false, error: 'Choose a known facility, slot, and mock status.' }
    const storage = options.storage ?? globalThis.localStorage
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request) return { ok: false, error: 'Browser storage and Web Locks are required to save mock changes.' }
    // Share the reservation lock so confirmations see the latest slot changes.
    return await locks.request('parkiva-demo-reservations-v1', () => {
      const previous = readMockSlotOverrides(storage, catalog)
      const facilities = { ...previous, [facilityId]: { ...previous[facilityId], [slotId]: status } }
      storage.setItem(MOCK_SLOTS_KEY, JSON.stringify({ version: 1, facilities }))
      notifyDemoDataChanged()
      return { ok: true }
    })
  } catch {
    return { ok: false, error: 'Mock status could not be saved. Storage may be unavailable, full, or invalid. Existing data has not been replaced.' }
  }
}
