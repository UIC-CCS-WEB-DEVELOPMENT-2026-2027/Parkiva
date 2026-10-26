import { useId, useRef, useState } from 'react'
import { validateVehicleInformation } from './vehicleInformation'
import './VehicleInformationForm.css'

export default function VehicleInformationForm({ value, onChange, supportedVehicles = [], slotVehicle, onBack, onContinue }) {
  const id = useId()
  const formRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validateVehicleInformation(value, supportedVehicles, slotVehicle) : {}

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    const validation = validateVehicleInformation(value, supportedVehicles, slotVehicle)
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) formRef.current.elements.namedItem(firstInvalid)?.focus()
    else onContinue()
  }

  return (
    <form className="vehicle-information-form" ref={formRef} noValidate onSubmit={submit} aria-label="Vehicle information">
      <p id={`${id}-supported`}>Demo vehicle options: {supportedVehicles.join(', ') || 'None'}. These are simulated, not verified admission policies. Choose a type that matches your selected demo slot.</p>
      <div className="vehicle-information-fields">
        <div>
          <label htmlFor={`${id}-type`}>Vehicle type</label>
          <select id={`${id}-type`} name="type" required value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}
            aria-invalid={Boolean(errors.type)} aria-describedby={`${id}-supported${errors.type ? ` ${id}-type-error` : ''}`}>
            <option value="">Choose vehicle type</option>
            {supportedVehicles.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors.type && <p className="vehicle-information-error" id={`${id}-type-error`}>{errors.type}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-plate`}>Plate number</label>
          <input id={`${id}-plate`} name="plate" type="text" required value={value.plate} onChange={(event) => onChange({ ...value, plate: event.target.value })}
            aria-invalid={Boolean(errors.plate)} aria-describedby={errors.plate ? `${id}-plate-error` : undefined} />
          {errors.plate && <p className="vehicle-information-error" id={`${id}-plate-error`}>{errors.plate}</p>}
        </div>
        <div className="vehicle-information-model">
          <label htmlFor={`${id}-model`}>Make/model (optional)</label>
          <input id={`${id}-model`} name="model" type="text" value={value.model} onChange={(event) => onChange({ ...value, model: event.target.value })} />
        </div>
      </div>
      {Object.keys(errors).length > 0 && <p className="vehicle-information-error" role="alert">Check the highlighted vehicle fields.</p>}
      <div className="reservation-flow-actions">
        <button type="button" onClick={onBack}>Back to date and time</button>
        <button type="submit" className="reservation-flow-primary">Review selection</button>
      </div>
    </form>
  )
}
