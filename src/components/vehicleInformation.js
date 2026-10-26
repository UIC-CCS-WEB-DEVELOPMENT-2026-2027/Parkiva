export function validateVehicleInformation(value, supportedVehicles, slotVehicle) {
  const errors = {}
  if (!value.type) errors.type = 'Choose a vehicle type.'
  else if (!supportedVehicles.includes(value.type)) errors.type = 'This vehicle type is not supported by this parking facility.'
  else if (slotVehicle && value.type !== slotVehicle) errors.type = `The selected slot is for ${slotVehicle.toLowerCase()} vehicles. Change the vehicle type or choose a matching slot.`
  if (!value.plate.trim()) errors.plate = 'Enter a plate number.'
  return errors
}
