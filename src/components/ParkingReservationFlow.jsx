import { useEffect, useRef, useState } from 'react'
import ParkingSlotSelection from './ParkingSlotSelection'
import ReservationDateTimeSelection from './ReservationDateTimeSelection'
import { validateReservationDateTime } from './reservationDateTime'
import VehicleInformationForm from './VehicleInformationForm'
import ReservationReview from './ReservationReview.jsx'
import { validateReservationReview } from './reservationReviewValidation.js'
import { createReservationDraft, confirmDemoReservation, DEMO_NOTICE } from './demoReservations'
import DemoReservationConfirmation from './DemoReservationConfirmation'

export default function ParkingReservationFlow({ facility, slots = [], supportedVehicles = [], draft, onDraftChange, onChooseParking }) {
  const [localDraft, setLocalDraft] = useState(createReservationDraft)
  const current = draft ?? localDraft
  const { step, selectedId, dateTime, vehicle, confirmation } = current
  function update(patch) {
    const next = { ...current, ...patch }
    setLocalDraft(next)
    onDraftChange?.(next)
  }
  const setStep = (value) => update({ step: value })
  const setSelectedId = (value) => { setFlowNotice(''); update({ selectedId: value }) }
  const setDateTime = (value) => update({ dateTime: value })
  const setVehicle = (value) => update({ vehicle: value })
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [saveError, setSaveError] = useState('')
  const [flowNotice, setFlowNotice] = useState('')
  const headingRef = useRef(null)
  const previousStep = useRef(step)
  const selectedSlot = slots.find((slot) => slot.id === selectedId && slot.status === 'Available')

  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus()
    previousStep.current = step
  }, [step])

  async function confirm() {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    const result = await confirmDemoReservation({ facility, slots, selectedId, dateTime, vehicle })
    if (result.ok) update({ step: 'confirmation', confirmation: result.reservation })
    else setSaveError(result.error)
    savingRef.current = false
    setSaving(false)
  }

  return (
    <section className="reservation-flow" aria-label="Mock reservation selection">
      <h3 ref={headingRef} tabIndex={-1}>
        {step === 'confirmation' ? 'Demo reservation confirmation' : step === 'slots' ? 'Step 1 of 4: Parking slot' : step === 'datetime' ? 'Step 2 of 4: Date and time' : step === 'vehicle' ? 'Step 3 of 4: Vehicle information' : 'Step 4 of 4: Review selection'}
      </h3>
      {step !== 'confirmation' && <p className="demo-reservation-notice">{DEMO_NOTICE}</p>}
      {flowNotice && <p role="alert">{flowNotice}</p>}
      {step === 'slots' && <>
        <ParkingSlotSelection slots={slots} selectedId={selectedId} onSelectionChange={setSelectedId} />
        <div className="reservation-flow-actions">
          <button type="button" onClick={onChooseParking}>Change parking facility</button>
          <button className="reservation-flow-primary" type="button" disabled={!selectedSlot} onClick={() => setStep('datetime')}>Continue to date and time</button>
        </div>
      </>}
      {step === 'datetime' && <>
        <p>Selected slot: {selectedSlot?.id} ({selectedSlot?.vehicle})</p>
        <ReservationDateTimeSelection value={dateTime} onChange={setDateTime} onBack={() => setStep('slots')}
          continueLabel="Continue to vehicle information"
          onContinue={() => {
            if (!selectedSlot) {
              setFlowNotice('Your selected slot is no longer available in this demo. Choose another slot; your date/time and vehicle information have been kept.')
              setStep('slots')
            } else if (Object.keys(validateReservationDateTime(dateTime)).length === 0) setStep('vehicle')
          }} />
      </>}
      {step === 'vehicle' && <>
        <p>Selected slot: {selectedSlot?.id} ({selectedSlot?.vehicle})</p>
        <VehicleInformationForm value={vehicle} onChange={setVehicle} supportedVehicles={supportedVehicles} slotVehicle={selectedSlot?.vehicle}
          onBack={() => setStep('datetime')} onContinue={() => {
            const issues = validateReservationReview({ facility, slots, selectedId, dateTime, vehicle })
            if (issues.length) setStep(issues[0].step)
            else setStep('review')
          }} />
      </>}
      {step === 'review' && <ReservationReview facility={facility} slots={slots} selectedId={selectedId} vehicle={vehicle} dateTime={dateTime}
        onEdit={(value) => { setSaveError(''); setStep(value) }} onConfirm={confirm} saving={saving} saveError={saveError} />}
      {step === 'confirmation' && confirmation && <DemoReservationConfirmation reservation={confirmation}
        onRestart={() => { const next = createReservationDraft(); setFlowNotice(''); setLocalDraft(next); onDraftChange?.(next) }} onChooseParking={onChooseParking} />}
    </section>
  )
}
