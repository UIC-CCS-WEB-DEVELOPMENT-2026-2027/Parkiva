import Icon from './Icon'
import { DEMO_NOTICE } from './demoReservations'
import './DemoReservationConfirmation.css'
import { useState } from 'react'
import DemoParkingPass from './DemoParkingPass'

export default function DemoReservationConfirmation({
  reservation,
  onRestart,
  onChooseParking,
  onReservations,
  onViewPass,
}) {
  const [showPass, setShowPass] = useState(false)
  return (
    <section className="demo-confirmation" aria-label="Demo reservation confirmation">
      <p className="demo-reservation-notice">{DEMO_NOTICE}</p>
      <p>
        Your simulated reservation was saved in this browser only. This does not indicate real
        parking availability.
      </p>
      <dl>
        <div>
          <dt>Demo reference</dt>
          <dd>{reservation.reference}</dd>
        </div>
        <div>
          <dt>Parking facility</dt>
          <dd>{reservation.facility.name}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{reservation.facility.location}</dd>
        </div>
        <div>
          <dt>Slot</dt>
          <dd>
            {reservation.slot.id} ({reservation.slot.vehicle})
          </dd>
        </div>
        <div>
          <dt>Vehicle</dt>
          <dd>
            {reservation.vehicle.type} — {reservation.vehicle.plate}
          </dd>
        </div>
        {reservation.vehicle.model && (
          <div>
            <dt>Make/model</dt>
            <dd>{reservation.vehicle.model}</dd>
          </div>
        )}
        <div>
          <dt>Date</dt>
          <dd>{reservation.dateTime.date}</dd>
        </div>
        <div>
          <dt>Arrival time</dt>
          <dd>{reservation.dateTime.arrival}</dd>
        </div>
        <div>
          <dt>Departure time</dt>
          <dd>{reservation.dateTime.departure}</dd>
        </div>
      </dl>
      <div className="reservation-flow-actions">
        <button
          type="button"
          aria-expanded={onViewPass ? undefined : showPass}
          onClick={() => (onViewPass ? onViewPass(reservation.reference) : setShowPass(!showPass))}
        >
          <Icon name="qr" size={17} />
          {showPass ? 'Hide parking pass' : 'View QR pass'}
        </button>
        {onReservations && (
          <button type="button" onClick={onReservations}>
            <Icon name="calendar" size={17} />
            My Reservations
          </button>
        )}
        <button type="button" onClick={onRestart}>
          <Icon name="plus" size={16} />
          Reserve another spot
        </button>
        <button type="button" onClick={onChooseParking}>
          <Icon name="back" size={16} />
          Back to listings
        </button>
      </div>
      {showPass && <DemoParkingPass reference={reservation.reference} />}
    </section>
  )
}
