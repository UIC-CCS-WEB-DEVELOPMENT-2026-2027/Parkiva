export function localDateValue(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function validateReservationDateTime(value, now = new Date()) {
  const errors = {}
  const { date, arrival, departure } = value
  const today = localDateValue(now)
  const parsedDate = new Date(`${date}T00:00:00`)
  if (!date) errors.date = 'Choose a reservation date.'
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || localDateValue(parsedDate) !== date) errors.date = 'Choose a valid date.'
  else if (date < today) errors.date = 'Choose today or a future date.'

  const validTime = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  if (!arrival) errors.arrival = 'Choose an arrival time.'
  else if (!validTime(arrival)) errors.arrival = 'Choose a valid arrival time.'
  else if (!errors.date && new Date(`${date}T${arrival}`) <= now) errors.arrival = 'Choose an arrival time in the future.'
  if (!departure) errors.departure = 'Choose a departure time.'
  else if (!validTime(departure)) errors.departure = 'Choose a valid departure time.'
  else if (validTime(arrival) && departure <= arrival) errors.departure = 'Departure must be later than arrival on the same date.'
  return errors
}
