import { useRef, useState } from 'react'
import { useMockParking } from './MockParkingContext'
import { parkingSlotsByFacility } from './parkingSlotData'
import { demoReservationStatus, DEMO_NOTICE } from './demoReservations'
import { mockSlotCounts, saveMockSlotStatus, SLOT_STATUSES } from './mockSlotState'
import './OperatorDashboard.css'

export default function OperatorDashboard({ onBrowse }) {
  const { areas, records, now, slotsByFacility, manualSlots, slotError, reservationError, refresh } = useMockParking()
  const [facilityId, setFacilityId] = useState(areas[0].id)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const facility = areas.find((area) => area.id === facilityId)
  const reservations = records.filter((record) => record.facility.id === facilityId)

  async function changeStatus(slotId, status) {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setMessage('')
    setError('')
    const result = await saveMockSlotStatus(facilityId, slotId, status, parkingSlotsByFacility)
    if (result.ok) { setMessage(`${slotId} mock status saved as ${status}.`); refresh() }
    else setError(result.error)
    setSaving(false)
    savingRef.current = false
  }

  return (
    <section className="operator-dashboard" aria-labelledby="operator-dashboard-heading">
      <h1 id="operator-dashboard-heading" tabIndex={-1}>Mock parking operator dashboard</h1>
      <p className="operator-demo-notice">Simulation only — publicly accessible, with no staff authorization or secure access. All changes affect demo data in this browser only.</p>
      <p>{DEMO_NOTICE}</p>
      <div className="operator-actions"><button type="button" onClick={onBrowse}>Browse parking</button><button type="button" onClick={refresh}>Refresh dashboard</button></div>
      {(slotError || reservationError) && <div role="alert" className="operator-error">{slotError && <p>{slotError}</p>}{reservationError && <p>{reservationError}</p>}</div>}
      <div className="operator-summaries" aria-label="Facility summaries">
        {areas.map((area) => {
          const counts = mockSlotCounts(slotsByFacility[area.id])
          return <article className="operator-summary" key={area.id}>
            <h2>{area.name}</h2><p>{area.location}</p>
            <dl>{SLOT_STATUSES.map((status) => <div key={status}><dt>{status}</dt><dd>{counts[status]}</dd></div>)}</dl>
            <p>{records.filter((record) => record.facility.id === area.id && record.status !== 'cancelled').length} non-cancelled demo records</p>
          </article>
        })}
      </div>
      <label className="operator-facility-label" htmlFor="operator-facility">Manage mock facility</label>
      <select id="operator-facility" value={facilityId} disabled={saving} onChange={(event) => { setFacilityId(event.target.value); setMessage(''); setError('') }}>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select>
      <h2>Mock slots — {facility.name}</h2>
      <p>Slot counts and vehicle options are synthetic, not real facility capacity or admission policies. Active demo reservation windows show Reserved; recorded entry without exit shows Occupied. Future demo bookings remain in the records below. Manual edits never cancel reservations or override these reservation states.</p>
      <div className="operator-slot-grid">{manualSlots[facilityId].map((slot) => {
        const effective = slotsByFacility[facilityId].find((item) => item.id === slot.id).status
        return <div className="operator-slot" key={`${facilityId}-${slot.id}`}>
          <h3>{slot.id} · {slot.vehicle}</h3><p>Current simulated status: <strong>{effective}</strong></p>
          <label htmlFor={`operator-${facilityId}-${slot.id}`}>Manual mock status for {slot.id}</label>
          <select id={`operator-${facilityId}-${slot.id}`} value={slot.status} disabled={saving || Boolean(slotError)} onChange={(event) => changeStatus(slot.id, event.target.value)}>{SLOT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
        </div>
      })}</div>
      <p role="status" aria-live="polite">{saving ? 'Saving mock change…' : message}</p>
      {error && <p className="operator-error" role="alert">{error}</p>}
      <h2>Demo reservation records — {facility.name}</h2>
      {reservationError ? <p>Records unavailable. Use Refresh dashboard to retry after resolving browser storage.</p> : reservations.length === 0 ? <p>No demo reservations stored for this facility yet.</p> : <div className="operator-record-grid">{reservations.map((record) => <article className="operator-record" key={record.reference}>
        <h3>{record.reference}</h3><dl>
          <div><dt>Facility</dt><dd>{record.facility.name}</dd></div>
          <div><dt>Slot</dt><dd>{record.slot.id}</dd></div>
          <div><dt>Vehicle</dt><dd>{record.vehicle.type} · {record.vehicle.plate}</dd></div>
          <div><dt>Date</dt><dd>{record.dateTime.date}</dd></div>
          <div><dt>Time</dt><dd>{record.dateTime.arrival}–{record.dateTime.departure}</dd></div>
          <div><dt>Status</dt><dd>{demoReservationStatus(record, now)}</dd></div>
          <div><dt>Demo pass</dt><dd>{record.pass?.exitedAt ? 'Exit recorded' : record.pass?.enteredAt ? 'Entry recorded' : 'No entry recorded'}</dd></div>
        </dl>
      </article>)}</div>}
    </section>
  )
}
