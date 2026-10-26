import { getDemoStorage } from './demoAccounts'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { marketplaceListings } from './marketplaceData'
import { parkingSlotsByFacility } from './parkingSlotData'
import { readBrowserReservations, readDemoReservations } from './demoReservations'
import {
  DEMO_DATA_EVENT,
  readSharedMockOverrides,
  applyMockSlotOverrides,
  currentMockSlots,
  mockFacilityAvailability,
} from './mockSlotState'
import { readHostListings, hostCatalog, hostSlots } from './hostListings'

const MockParkingContext = createContext(null)

export function MockParkingProvider({ children }) {
  const [snapshot, setSnapshot] = useState({
    catalog: marketplaceListings,
    overrides: {},
    records: [],
    ownRecords: [],
    slotError: '',
    reservationError: '',
    listingError: '',
    now: new Date(),
    loaded: false,
  })
  const [previewPhotos, setPreviewPhotos] = useState({})
  const photoUrls = useRef({})
  function setPreviewPhoto(id, file) {
    if (photoUrls.current[id]) URL.revokeObjectURL(photoUrls.current[id])
    photoUrls.current[id] = URL.createObjectURL(file)
    setPreviewPhotos({ ...photoUrls.current })
  }
  function refresh() {
    const next = {
      catalog: marketplaceListings,
      overrides: {},
      records: [],
      ownRecords: [],
      slotError: '',
      reservationError: '',
      listingError: '',
      now: new Date(),
      loaded: true,
    }
    try {
      next.catalog = hostCatalog(readHostListings(globalThis.localStorage))
    } catch {
      next.listingError =
        'Saved host listings could not be read. Original listings are shown; existing browser data has not been replaced.'
    }
    const catalogSlots = Object.fromEntries(
      next.catalog.map((area) => [area.id, parkingSlotsByFacility[area.id] || hostSlots(area)]),
    )
    try {
      next.overrides = readSharedMockOverrides(globalThis.localStorage, catalogSlots)
    } catch {
      next.slotError =
        'Slot changes could not be read. Original statuses are shown; saving is blocked until storage is readable.'
    }
    try {
      next.records = readBrowserReservations()
      next.ownRecords = readDemoReservations(getDemoStorage())
    } catch {
      next.reservationError =
        'Reservation storage could not be read. Shared counts may be incomplete; confirmation is blocked until storage is readable.'
    }
    setSnapshot(next)
  }
  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener(DEMO_DATA_EVENT, refresh)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(DEMO_DATA_EVENT, refresh)
      window.removeEventListener('focus', refresh)
      window.clearInterval(timer)
      Object.values(photoUrls.current).forEach(URL.revokeObjectURL)
    }
  }, [])
  const slotCatalog = Object.fromEntries(
    snapshot.catalog.map((area) => [area.id, parkingSlotsByFacility[area.id] || hostSlots(area)]),
  )
  const manualSlots = Object.fromEntries(
    Object.entries(slotCatalog).map(([id, slots]) => [
      id,
      applyMockSlotOverrides(id, slots, snapshot.overrides),
    ]),
  )
  const slotsByFacility = Object.fromEntries(
    Object.entries(manualSlots).map(([id, slots]) => [
      id,
      currentMockSlots(id, slots, snapshot.records, snapshot.now),
    ]),
  )
  const areas = snapshot.catalog.map((area) => ({
    ...area,
    photoUrl: previewPhotos[area.id],
    availability: mockFacilityAvailability(slotsByFacility[area.id]),
  }))
  return (
    <MockParkingContext.Provider
      value={{
        ...snapshot,
        manualSlots,
        slotsByFacility,
        slotCatalog,
        areas,
        refresh,
        setPreviewPhoto,
      }}
    >
      {children}
    </MockParkingContext.Provider>
  )
}

export function useMockParking() {
  return useContext(MockParkingContext)
}
