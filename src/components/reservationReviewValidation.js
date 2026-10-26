import { validateReservationDateTime } from './reservationDateTime.js'
import { validateVehicleInformation } from './vehicleInformation.js'

export function validateReservationReview(
  { facility, slots = [], selectedId, dateTime = {}, vehicle = {} },
  now = new Date(),
) {
  const issues = []
  if (!facility?.id || !facility.name?.trim() || !facility.location?.trim()) {
    issues.push({ step: 'slots', message: 'Choose a parking facility with complete details.' })
  }
  const slot = slots.find((item) => item.id === selectedId)
  if (!slot || slot.status !== 'Available')
    issues.push({ step: 'slots', message: 'Choose an available parking slot.' })
  const timeErrors = validateReservationDateTime(
    { date: '', arrival: '', departure: '', ...dateTime },
    now,
  )
  for (const message of Object.values(timeErrors)) issues.push({ step: 'datetime', message })
  if (
    !Object.keys(timeErrors).length &&
    facility?.demoHours &&
    (dateTime.arrival < facility.demoHours.open || dateTime.departure > facility.demoHours.close)
  ) {
    issues.push({
      step: 'datetime',
      message: `Choose a visit within this listing’s preview hours: ${facility.demoHours.open}–${facility.demoHours.close}.`,
    })
  }
  const vehicleErrors = validateVehicleInformation(
    { type: '', plate: '', model: '', ...vehicle },
    facility?.vehicles || [],
    slot?.vehicle,
  )
  for (const message of Object.values(vehicleErrors)) issues.push({ step: 'vehicle', message })
  return issues
}
