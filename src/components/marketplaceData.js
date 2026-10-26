import { parkingAreas } from './parkingData.js'

export const NEIGHBORHOODS = [
  'Downtown',
  'Bajada',
  'Lanang',
  'Ecoland',
  'Matina',
  'Obrero',
  'Buhangin',
  'Sasa',
]
export const AMENITIES = [
  'Marked bays',
  'Lighting',
  'Covered walkway',
  'Attendant',
  'Motorcycle bays',
]
export const PARKING_TYPES = ['Open-air', 'Covered']
export const DEFAULT_RULES = [
  'Use the selected bay and keep access lanes clear.',
  'Arrive and leave within your selected time.',
  'No overnight storage or vehicle repairs.',
]
const configurations = [
  ['Downtown', 'Open-air', 35],
  ['Sasa', 'Open-air', 45],
  ['Downtown', 'Covered', 30],
  ['Ecoland', 'Open-air', 40],
  ['Lanang', 'Covered', 45],
  ['Bajada', 'Covered', 40],
  ['Bajada', 'Covered', 30],
  ['Buhangin', 'Covered', 25],
]
// Every rate, amenity, type, host assignment, and operating detail below is fictional inventory.
export const verifiedMarketplaceListings = parkingAreas.map((area, index) => ({
  ...area,
  verifiedLocation: true,
  neighborhood: configurations[index][0],
  parkingType: configurations[index][1],
  hourlyRate: configurations[index][2],
  hostName: 'Parkiva preview inventory',
  hostKind: 'Location preview',
  amenities: ['Marked bays', 'Lighting'],
  rules: DEFAULT_RULES,
  demoDescription:
    'Explore a parking plan near this Davao destination. Choose a bay, add your visit details, and try the parking pass experience.',
  demoHours: { open: '00:00', close: '23:59' },
  imageKey: configurations[index][1] === 'Covered' ? 'garage' : index % 2 ? 'aerial' : 'outdoor',
}))

export const fictionalMarketplaceListings = [
  {
    id: 'demo-host-obrero-courtyard',
    name: 'A quiet courtyard in Obrero',
    neighborhood: 'Obrero',
    parkingType: 'Open-air',
    hourlyRate: 25,
    hostName: 'Maria Santos',
    hostKind: 'Private space',
    vehicles: ['Car', 'Motorcycle'],
    imageKey: 'outdoor',
  },
  {
    id: 'demo-host-matina-carport',
    name: 'Covered carport in Matina',
    neighborhood: 'Matina',
    parkingType: 'Covered',
    hourlyRate: 30,
    hostName: 'Carlo Mendoza',
    hostKind: 'Private space',
    vehicles: ['Car'],
    imageKey: 'garage',
  },
  {
    id: 'demo-host-lanang-lot',
    name: 'A little more room in Lanang',
    neighborhood: 'Lanang',
    parkingType: 'Open-air',
    hourlyRate: 20,
    hostName: 'Ana Reyes',
    hostKind: 'Independent lot',
    vehicles: ['Car', 'Motorcycle'],
    imageKey: 'aerial',
  },
].map((area) => ({
  ...area,
  verifiedLocation: false,
  ownerAccountId: 'operator-demo',
  location: `${area.neighborhood}, Davao City · fictional address for the preview`,
  description:
    'A fictional marketplace space with a fictional host. This is not an offer to park at a real property.',
  demoDescription:
    'A simple spot for your next city errand. Pick a bay and try planning your visit with a local host.',
  access:
    'Illustrative instructions: use the marked entrance and park only in the bay on your pass. No real entrance or property is represented.',
  amenities: ['Marked bays', 'Lighting'],
  rules: DEFAULT_RULES,
  capacity: 4,
  demoHours: { open: '00:00', close: '23:59' },
  sources: [],
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area.neighborhood} Davao City`)}`,
}))

export const marketplaceListings = [...verifiedMarketplaceListings, ...fictionalMarketplaceListings]
export const pesos = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value)
export function estimatedTotal(rate, dateTime = {}) {
  const minutes = (time) => {
    const [h, m] = (time || '').split(':').map(Number)
    return h * 60 + m
  }
  const duration = minutes(dateTime.departure) - minutes(dateTime.arrival)
  return Number.isFinite(duration) && duration > 0 ? Math.ceil(duration / 60) * rate : null
}
