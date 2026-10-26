import { useEffect, useRef } from 'react'
import ParkingReservationFlow from './ParkingReservationFlow'
import { useMockParking } from './MockParkingContext'
import './ParkingDetailsModal.css'

export default function ParkingDetailsModal({ area, onClose, reservationDraft, onDraftChange }) {
  const { slotsByFacility, slotError, reservationError } = useMockParking()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [])

  function closeFromBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
  }

  function keepKeyboardFocus(event) {
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')]
      .filter((node) => node.getClientRects().length > 0)
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (!first) { event.preventDefault(); return }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="parking-details-modal"
      aria-labelledby="parking-details-title"
      aria-describedby="parking-details-description"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={closeFromBackdrop}
      onKeyDown={keepKeyboardFocus}
    >
      <div className="parking-details-modal-content">
        <header className="parking-details-modal-header">
          <h2 id="parking-details-title">{area.name}</h2>
          <button className="parking-details-modal-close" type="button" onClick={onClose} autoFocus aria-label="Close parking details">Close</button>
        </header>
        <p className="parking-details-modal-location">{area.location}</p>
        <dl className="parking-details-modal-facts">
          <div><dt>Availability (mock)</dt><dd>{area.availability}</dd></div>
          <div><dt>Supported vehicles</dt><dd>{area.vehicles.join(', ')}</dd></div>
        </dl>
        <section aria-labelledby="parking-details-about">
          <h3 id="parking-details-about">About this parking area</h3>
          <p id="parking-details-description">{area.description}</p>
        </section>
        <section aria-labelledby="parking-details-entrance">
          <h3 id="parking-details-entrance">Entrance information</h3>
          <p>{area.access}</p>
        </section>
        {(slotError || reservationError) && <p role="alert">{slotError} {reservationError}</p>}
        <ParkingReservationFlow key={area.id} facility={area} slots={slotsByFacility[area.id]} supportedVehicles={area.vehicles}
          draft={reservationDraft} onDraftChange={onDraftChange} onChooseParking={onClose} />
        <p className="parking-details-modal-note">Fictional example for demonstration only. Availability is not live.</p>
      </div>
    </dialog>
  )
}
