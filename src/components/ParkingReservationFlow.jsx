import { useEffect, useRef, useState } from 'react'
import ParkingSlotSelection from './ParkingSlotSelection'
import ReservationDateTimeSelection from './ReservationDateTimeSelection'
import { validateReservationDateTime } from './reservationDateTime'

export default function ParkingReservationFlow({ slots = [] }) {
  const [step, setStep] = useState('slots')
  const [selectedId, setSelectedId] = useState(null)
  const [dateTime, setDateTime] = useState({ date: '', arrival: '', departure: '' })
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
        {step === 'slots' ? 'Step 1 of 3: Parking slot' : step === 'datetime' ? 'Step 2 of 3: Date and time' : 'Step 3 of 3: Review selection'}
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
          onContinue={() => { if (selectedSlot && Object.keys(validateReservationDateTime(dateTime)).length === 0) setStep('review') }} />
      </>}
      {step === 'review' && <>
        <dl className="reservation-flow-review">
          <div><dt>Slot</dt><dd>{selectedSlot?.id} ({selectedSlot?.vehicle})</dd></div>
          <div><dt>Date</dt><dd>{dateTime.date}</dd></div>
          <div><dt>Arrival</dt><dd>{dateTime.arrival}</dd></div>
          <div><dt>Departure</dt><dd>{dateTime.departure}</dd></div>
        </dl>
        <p>Preview only. No reservation has been made.</p>
        <div className="reservation-flow-actions">
          <button type="button" onClick={() => setStep('datetime')}>Edit date and time</button>
          <button type="button" onClick={() => setStep('slots')}>Change slot</button>
        </div>
      </>}
    </section>
  )
}
