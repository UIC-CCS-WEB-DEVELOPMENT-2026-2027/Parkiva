import { useEffect, useRef, useState } from 'react'
import ParkingSlotSelection from './ParkingSlotSelection'
import ReservationDateTimeSelection from './ReservationDateTimeSelection'
import { validateReservationDateTime } from './reservationDateTime'
import VehicleInformationForm from './VehicleInformationForm'
import { validateVehicleInformation } from './vehicleInformation'

export default function ParkingReservationFlow({ slots = [], supportedVehicles = [] }) {
  const [step, setStep] = useState('slots')
  const [selectedId, setSelectedId] = useState(null)
  const [dateTime, setDateTime] = useState({ date: '', arrival: '', departure: '' })
  const [vehicle, setVehicle] = useState({ type: '', plate: '', model: '' })
  const headingRef = useRef(null)
  const previousStep = useRef(step)
  const selectedSlot = slots.find((slot) => slot.id === selectedId && slot.status === 'Available')

  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus()
    previousStep.current = step
  }, [step])

  return (
    <section className="reservation-flow" aria-label="Mock reservation selection">
      <h3 ref={headingRef} tabIndex={-1}>
        {step === 'slots' ? 'Step 1 of 4: Parking slot' : step === 'datetime' ? 'Step 2 of 4: Date and time' : step === 'vehicle' ? 'Step 3 of 4: Vehicle information' : 'Step 4 of 4: Review selection'}
      </h3>
      {step === 'slots' && <>
        <ParkingSlotSelection slots={slots} selectedId={selectedId} onSelectionChange={setSelectedId} />
        <div className="reservation-flow-actions">
          <button className="reservation-flow-primary" type="button" disabled={!selectedSlot} onClick={() => setStep('datetime')}>Continue to date and time</button>
        </div>
      </>}
      {step === 'datetime' && <>
        <p>Selected slot: {selectedSlot?.id} ({selectedSlot?.vehicle})</p>
        <ReservationDateTimeSelection value={dateTime} onChange={setDateTime} onBack={() => setStep('slots')}
          continueLabel="Continue to vehicle information"
          onContinue={() => { if (selectedSlot && Object.keys(validateReservationDateTime(dateTime)).length === 0) setStep('vehicle') }} />
      </>}
      {step === 'vehicle' && <>
        <p>Selected slot: {selectedSlot?.id} ({selectedSlot?.vehicle})</p>
        <VehicleInformationForm value={vehicle} onChange={setVehicle} supportedVehicles={supportedVehicles} slotVehicle={selectedSlot?.vehicle}
          onBack={() => setStep('datetime')} onContinue={() => {
            if (!selectedSlot) setStep('slots')
            else if (Object.keys(validateReservationDateTime(dateTime)).length > 0) setStep('datetime')
            else if (Object.keys(validateVehicleInformation(vehicle, supportedVehicles, selectedSlot.vehicle)).length === 0) setStep('review')
          }} />
      </>}
      {step === 'review' && <>
        <dl className="reservation-flow-review">
          <div><dt>Slot</dt><dd>{selectedSlot?.id} ({selectedSlot?.vehicle})</dd></div>
          <div><dt>Date</dt><dd>{dateTime.date}</dd></div>
          <div><dt>Arrival</dt><dd>{dateTime.arrival}</dd></div>
          <div><dt>Departure</dt><dd>{dateTime.departure}</dd></div>
          <div><dt>Vehicle type</dt><dd>{vehicle.type}</dd></div>
          <div><dt>Plate number</dt><dd>{vehicle.plate.trim()}</dd></div>
          {vehicle.model.trim() && <div><dt>Make/model</dt><dd>{vehicle.model.trim()}</dd></div>}
        </dl>
        <p>Preview only. No reservation has been made.</p>
        <div className="reservation-flow-actions">
          <button type="button" onClick={() => setStep('vehicle')}>Edit vehicle information</button>
          <button type="button" onClick={() => setStep('datetime')}>Edit date and time</button>
          <button type="button" onClick={() => setStep('slots')}>Change slot</button>
        </div>
      </>}
    </section>
  )
}
