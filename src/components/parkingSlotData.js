import { parkingAreas } from './parkingData.js'

// Synthetic demo layouts only. These are not real capacity, bay numbers, or vehicle policies.
export const parkingSlotsByFacility = Object.fromEntries(parkingAreas.map((area, index) => {
  const statuses = index === 1 ? ['Available', 'Reserved', 'Occupied', 'Occupied']
    : index === 2 ? ['Occupied', 'Reserved', 'Occupied', 'Occupied']
      : ['Available', 'Reserved', 'Occupied', 'Available', 'Available', 'Occupied']
  const slots = statuses.map((status, slotIndex) => ({
    id: `${String.fromCharCode(65 + index)}${String(slotIndex + 1).padStart(2, '0')}`,
    vehicle: area.vehicles.length === 1 ? area.vehicles[0] : slotIndex >= 4 ? 'Motorcycle' : 'Car',
    status,
  }))
  return [area.id, slots]
}))