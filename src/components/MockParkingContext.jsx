import { createContext, useContext, useEffect, useState } from 'react'
import { parkingAreas } from './parkingData'
import { parkingSlotsByFacility } from './parkingSlotData'
import { DEMO_RESERVATIONS_KEY, readDemoReservations } from './demoReservations'
import { MOCK_SLOTS_KEY, DEMO_DATA_EVENT, readMockSlotOverrides, applyMockSlotOverrides, currentMockSlots, mockFacilityAvailability } from './mockSlotState'

const MockParkingContext = createContext(null)

export function MockParkingProvider({ children }) {
  const [snapshot, setSnapshot] = useState({ overrides: {}, records: [], slotError: '', reservationError: '', now: new Date() })
  function refresh() {
    const next = { overrides: {}, records: [], slotError: '', reservationError: '', now: new Date() }
    try { next.overrides = readMockSlotOverrides(window.localStorage, parkingSlotsByFacility) }
    catch { next.slotError = 'Mock slot changes could not be read. Original example statuses are shown; saving is blocked until storage is readable.' }
    try { next.records = readDemoReservations(window.localStorage) }
    catch { next.reservationError = 'Demo reservation storage could not be read. Reservation counts may be incomplete. Stored data has not been changed.' }
    setSnapshot(next)
  }
  useEffect(() => {
    refresh()
    const sync = (event) => { if ([MOCK_SLOTS_KEY, DEMO_RESERVATIONS_KEY, null].includes(event.key)) refresh() }
    window.addEventListener('storage', sync)
    window.addEventListener(DEMO_DATA_EVENT, refresh)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener(DEMO_DATA_EVENT, refresh); window.removeEventListener('focus', refresh); window.clearInterval(timer) }
  }, [])
  const manualSlots = Object.fromEntries(Object.entries(parkingSlotsByFacility).map(([id, slots]) => [id, applyMockSlotOverrides(id, slots, snapshot.overrides)]))
  const slotsByFacility = Object.fromEntries(Object.entries(manualSlots).map(([id, slots]) => [id, currentMockSlots(id, slots, snapshot.records, snapshot.now)]))
  const areas = parkingAreas.map((area) => ({ ...area, availability: mockFacilityAvailability(slotsByFacility[area.id]) }))
  return <MockParkingContext.Provider value={{ ...snapshot, manualSlots, slotsByFacility, areas, refresh }}>{children}</MockParkingContext.Provider>
}

export function useMockParking() { return useContext(MockParkingContext) }
