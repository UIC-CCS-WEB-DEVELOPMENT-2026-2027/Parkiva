import { useId, useRef, useState } from 'react'
import { validateReservationReview } from './reservationReviewValidation.js'
import './ReservationReview.css'

export default function ReservationReview({ facility, slots = [], selectedId, vehicle = {}, dateTime = {}, onEdit }) {
  const id = useId()
  const feedbackRef = useRef(null)
  const [checked, setChecked] = useState(false)
  const slot = slots.find((item) => item.id === selectedId)
  const issues = validateReservationReview({ facility, slots, selectedId, vehicle, dateTime })

  function checkReview(event) {
    event.preventDefault()
    const currentIssues = validateReservationReview({ facility, slots, selectedId, vehicle, dateTime })
    setChecked(currentIssues.length === 0)
    feedbackRef.current?.focus()
  }

  return (
    <form className="reservation-review" onSubmit={checkReview} aria-label="Reservation review">
      <p>Check your details before continuing. This is a frontend preview; no reservation will be made.</p>
      <section aria-labelledby={`${id}-facility`}>
        <h4 id={`${id}-facility`}>Parking facility and slot</h4>
        <dl>
          <div><dt>Facility</dt><dd>{facility?.name || 'Not selected'}</dd></div>
          <div><dt>Location</dt><dd>{facility?.location || 'Not provided'}</dd></div>
          <div><dt>Slot</dt><dd>{slot ? `${slot.id} (${slot.vehicle})` : 'Not selected'}</dd></div>
        </dl>
        <button type="button" onClick={() => onEdit('slots')}>Change slot</button>
      </section>
      <section aria-labelledby={`${id}-vehicle`}>
        <h4 id={`${id}-vehicle`}>Vehicle information</h4>
        <dl>
          <div><dt>Vehicle type</dt><dd>{vehicle.type || 'Not selected'}</dd></div>
          <div><dt>Plate number</dt><dd>{vehicle.plate?.trim() || 'Not provided'}</dd></div>
          <div><dt>Make/model</dt><dd>{vehicle.model?.trim() || 'Not provided (optional)'}</dd></div>
        </dl>
        <button type="button" onClick={() => onEdit('vehicle')}>Edit vehicle information</button>
      </section>
      <section aria-labelledby={`${id}-time`}>
        <h4 id={`${id}-time`}>Date and time</h4>
        <dl>
          <div><dt>Date</dt><dd>{dateTime.date || 'Not selected'}</dd></div>
          <div><dt>Arrival time</dt><dd>{dateTime.arrival || 'Not selected'}</dd></div>
          <div><dt>Departure time</dt><dd>{dateTime.departure || 'Not selected'}</dd></div>
        </dl>
        <p>Times use your local time zone.</p>
        <button type="button" onClick={() => onEdit('datetime')}>Edit date and time</button>
      </section>
      <div ref={feedbackRef} tabIndex={-1} className="reservation-review-feedback" aria-live="polite" aria-atomic="true">
        {issues.length > 0 ? <>
          <p className="reservation-review-error">Complete or correct these details to continue:</p>
          <ul>{issues.map((issue, index) => <li key={`${issue.step}-${index}`}>
            <button type="button" onClick={() => onEdit(issue.step)}>{issue.message}</button>
          </li>)}</ul>
        </> : checked && <p>Review complete. Preview only; no reservation has been made.</p>}
      </div>
      <div className="reservation-flow-actions">
        <button type="submit" className="reservation-flow-primary" disabled={issues.length > 0}>Continue (preview)</button>
      </div>
    </form>
  )
}
