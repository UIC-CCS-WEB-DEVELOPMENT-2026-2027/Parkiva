import Icon from './Icon'
import { useId, useRef, useState } from 'react'
import { localDateValue, validateReservationDateTime } from './reservationDateTime'
import './ReservationDateTimeSelection.css'

export default function ReservationDateTimeSelection({
  value,
  onChange,
  onContinue,
  onBack,
  continueLabel = 'Review selection',
}) {
  const id = useId()
  const formRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validateReservationDateTime(value) : {}

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    const validation = validateReservationDateTime(value)
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) formRef.current.elements.namedItem(firstInvalid)?.focus()
    else onContinue()
  }

  return (
    <form
      className="reservation-datetime"
      ref={formRef}
      noValidate
      onSubmit={submit}
      aria-label="Reservation date and time"
    >
      <p>Choose your arrival and departure on the same date. Times use your local time zone.</p>
      <div className="reservation-datetime-fields">
        {[
          { name: 'date', label: 'Reservation date', type: 'date' },
          { name: 'arrival', label: 'Arrival time', type: 'time' },
          { name: 'departure', label: 'Departure time', type: 'time' },
        ].map(({ name, label, type }) => (
          <div className="reservation-datetime-field" key={name}>
            <label htmlFor={`${id}-${name}`}>
              <Icon name={type === 'date' ? 'calendar' : 'clock'} size={16} />
              {label}
            </label>
            <input
              id={`${id}-${name}`}
              name={name}
              type={type}
              required
              min={type === 'date' ? localDateValue() : undefined}
              value={value[name]}
              onChange={(event) => onChange({ ...value, [name]: event.target.value })}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
            />
            {errors[name] && (
              <p className="reservation-datetime-error" id={`${id}-${name}-error`}>
                {errors[name]}
              </p>
            )}
          </div>
        ))}
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="reservation-datetime-error" role="alert">
          Check the highlighted date and time fields.
        </p>
      )}
      <div className="reservation-flow-actions">
        <button type="button" onClick={onBack}>
          <Icon name="back" size={16} />
          Back to slots
        </button>
        <button type="submit" className="reservation-flow-primary">
          {continueLabel}
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </form>
  )
}
