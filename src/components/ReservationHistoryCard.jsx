import { useEffect, useId, useRef, useState } from 'react'
import { cancelDemoReservation, demoReservationStatus } from './demoReservations'

export default function ReservationHistoryCard({ reservation, now, onUpdated }) {
  const id = useId()
  const [details, setDetails] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const busyRef = useRef(false)
  const cancelRef = useRef(null)
  const keepRef = useRef(null)
  const headingRef = useRef(null)
  const status = demoReservationStatus(reservation, now)

  useEffect(() => { if (confirming) keepRef.current?.focus() }, [confirming])

  function keep() {
    setConfirming(false)
    requestAnimationFrame(() => cancelRef.current?.focus())
  }

  async function cancel() {
    if (busyRef.current) return
    busyRef.current = true
    setSaving(true)
    setError('')
    const result = await cancelDemoReservation(reservation.reference)
    if (result.ok) {
      setConfirming(false)
      onUpdated(`Demo reservation ${reservation.reference} cancelled.`)
      headingRef.current?.focus()
    } else setError(result.error)
    setSaving(false)
    busyRef.current = false
  }

  return (
    <article className="reservation-history-card" aria-labelledby={`${id}-title`}>
      <div className="reservation-history-card-heading">
        <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>{reservation.facility.name}</h2>
        <span className={`reservation-history-status reservation-history-status--${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
      </div>
      <dl>
        <div><dt>Demo reference</dt><dd>{reservation.reference}</dd></div>
        <div><dt>Slot</dt><dd>{reservation.slot.id} ({reservation.slot.vehicle})</dd></div>
        <div><dt>Vehicle</dt><dd>{reservation.vehicle.type} — {reservation.vehicle.plate}</dd></div>
        <div><dt>Date</dt><dd>{reservation.dateTime.date}</dd></div>
        <div><dt>Time (local)</dt><dd>{reservation.dateTime.arrival}–{reservation.dateTime.departure}</dd></div>
      </dl>
      <div className="reservation-history-actions">
        <button type="button" aria-expanded={details} aria-controls={`${id}-details`} onClick={() => setDetails(!details)}>{details ? 'Hide details' : 'View details'}<span className="parking-sr-only"> for {reservation.reference}</span></button>
        {status === 'Upcoming' && <button ref={cancelRef} type="button" disabled={confirming || saving} onClick={() => { setError(''); setConfirming(true) }}>Cancel demo reservation<span className="parking-sr-only"> {reservation.reference}</span></button>}
      </div>
      <div id={`${id}-details`} hidden={!details}>
        <dl>
          <div><dt>Location</dt><dd>{reservation.facility.location}</dd></div>
          <div><dt>Make/model</dt><dd>{reservation.vehicle.model || 'Not provided'}</dd></div>
          <div><dt>Demo saved</dt><dd>{new Date(reservation.confirmedAt).toLocaleString()}</dd></div>
          {reservation.cancelledAt && <div><dt>Cancelled</dt><dd>{new Date(reservation.cancelledAt).toLocaleString()}</dd></div>}
        </dl>
        <p>Stored in this browser only. This does not represent a real booking or real availability.</p>
      </div>
      {confirming && <div className="reservation-history-confirm" role="group" aria-labelledby={`${id}-cancel`} onKeyDown={(event) => { if (event.key === 'Escape' && !saving) { event.preventDefault(); keep() } }}>
        <p id={`${id}-cancel`}>Cancel demo reservation {reservation.reference}? This releases its simulated slot and vehicle time in this browser.</p>
        <div className="reservation-history-actions">
          <button ref={keepRef} type="button" disabled={saving} onClick={keep}>Keep reservation</button>
          <button type="button" disabled={saving || status !== 'Upcoming'} onClick={cancel}>{saving ? 'Saving cancellation…' : 'Confirm cancellation'}</button>
        </div>
      </div>}
      {error && <p className="reservation-history-error" role="alert">{error}</p>}
    </article>
  )
}
