import { useId, useState } from 'react'
import ParkingSlot from './ParkingSlot'
import './ParkingSlotSelection.css'

export default function ParkingSlotSelection({ slots = [] }) {
  const headingId = useId()
  const [selectedId, setSelectedId] = useState(null)
  const selectedSlot = slots.find((slot) => slot.id === selectedId && slot.status === 'Available')
  const availableCount = slots.filter((slot) => slot.status === 'Available').length

  function selectSlot(id) {
    if (slots.some((slot) => slot.id === id && slot.status === 'Available')) setSelectedId(id)
  }

  return (
    <section className="parking-slot-selection" aria-labelledby={headingId}>
      <h3 id={headingId}>Choose a parking slot</h3>
      <p>Preview a slot selection. This does not reserve a space.</p>
      <ul className="parking-slot-legend" aria-label="Slot status legend">
        {['Available', 'Reserved', 'Occupied'].map((status) => (
          <li key={status}><span className={`parking-slot-key parking-slot-key--${status.toLowerCase()}`} aria-hidden="true" />{status}</li>
        ))}
      </ul>
      {slots.length === 0 ? <p>No slot information is available for this facility.</p> : (
        <>
          <p className="parking-slot-count">{availableCount} of {slots.length} slots available</p>
          {availableCount === 0 && <p>No available slots at this facility. Reserved and occupied slots cannot be selected.</p>}
          <div className="parking-slot-grid" role="group" aria-label="Parking slots">
            {slots.map((slot) => <ParkingSlot key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onSelect={selectSlot} />)}
          </div>
        </>
      )}
      <div className="parking-slot-summary">
        <p role="status" aria-live="polite" aria-atomic="true">
          {selectedSlot ? `Selected slot: ${selectedSlot.id} (${selectedSlot.vehicle})` : 'No slot selected.'}
        </p>
        {selectedSlot && <button className="parking-slot-clear" type="button" onClick={() => setSelectedId(null)}>Clear selection</button>}
      </div>
    </section>
  )
}
