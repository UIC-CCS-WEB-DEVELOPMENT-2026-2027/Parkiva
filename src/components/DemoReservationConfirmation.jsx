import { DEMO_NOTICE } from './demoReservations'
import './DemoReservationConfirmation.css'
import { useState } from 'react'
import DemoParkingPass from './DemoParkingPass'

export default function DemoReservationConfirmation({ reservation, onRestart, onChooseParking }) {
  const [showPass, setShowPass] = useState(false)
  return (
    <section className="demo-confirmation" aria-label="Demo reservation confirmation">
      <p className="demo-reservation-notice">{DEMO_NOTICE}</p>
      <p>Your simulated reservation was saved in this browser only. This does not indicate real parking availability.</p>
      <dl>
        <div><dt>Demo reference</dt><dd>{reservation.reference}</dd></div>
        <div><dt>Parking facility</dt><dd>{reservation.facility.name}</dd></div>
        <div><dt>Location</dt><dd>{reservation.facility.location}</dd></div>
        <div><dt>Slot</dt><dd>{reservation.slot.id} ({reservation.slot.vehicle})</dd></div>
        <div><dt>Vehicle</dt><dd>{reservation.vehicle.type} — {reservation.vehicle.plate}</dd></div>
        {reservation.vehicle.model && <div><dt>Make/model</dt><dd>{reservation.vehicle.model}</dd></div>}
        <div><dt>Date</dt><dd>{reservation.dateTime.date}</dd></div>
        <div><dt>Arrival time</dt><dd>{reservation.dateTime.arrival}</dd></div>
        <div><dt>Departure time</dt><dd>{reservation.dateTime.departure}</dd></div>
      </dl>
      <div className="reservation-flow-actions">
        <button type="button" aria-expanded={showPass} onClick={() => setShowPass(!showPass)}>{showPass ? 'Hide demo pass' : 'View demo pass'}</button>
        <button type="button" onClick={onRestart}>Start another demo reservation</button>
        <button type="button" onClick={onChooseParking}>Back to parking selection</button>
      </div>
      {showPass && <DemoParkingPass reference={reservation.reference} />}
    </section>
  )
}
