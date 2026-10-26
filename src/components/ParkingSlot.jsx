export default function ParkingSlot({ slot, selected, onSelect }) {
  const available = slot.status === 'Available'

  return (
    <button
      className={`parking-slot parking-slot--${slot.status.toLowerCase()}`}
      type="button"
      disabled={!available}
      aria-pressed={selected}
      aria-label={`Slot ${slot.id}, ${slot.vehicle}, ${slot.status}${selected ? ', selected' : ''}`}
      onClick={() => { if (available) onSelect(slot.id) }}
    >
      <strong>{slot.id}</strong>
      <span>{slot.vehicle}</span>
      <span>{slot.status}</span>
      {selected && <span className="parking-slot-selected-label">Selected</span>}
    </button>
  )
}
