import { trapDialogFocus } from './dialogAccessibility'
import { useEffect, useRef } from 'react'
import ParkingReservationFlow from './ParkingReservationFlow'
import { useMockParking } from './MockParkingContext'
import ListingGallery from './ListingGallery'
import Icon from './Icon'
import { estimatedTotal, pesos } from './marketplaceData'
import './ParkingDetailsModal.css'

export default function ParkingDetailsModal({
  area,
  onClose,
  reservationDraft,
  onDraftChange,
  saved,
  onSave,
}) {
  const { slotsByFacility, slotError, reservationError } = useMockParking()
  const dialogRef = useRef(null)
  const flowRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true })
    }
  }, [])
  function backdrop(event) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      onClose()
  }
  const total = estimatedTotal(area.hourlyRate, reservationDraft?.dateTime)
  return (
    <dialog
      ref={dialogRef}
      className="parking-details-modal"
      aria-labelledby="parking-details-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={backdrop}
      onKeyDown={trapDialogFocus}
    >
      <header className="parking-details-modal-header">
        <span>
          <Icon name="pin" size={16} />
          {area.neighborhood} · Davao City
        </span>
        <div>
          <button className="button details-save" onClick={onSave} aria-pressed={saved}>
            <Icon name="heart" size={16} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            className="parking-details-modal-close icon-button"
            onClick={onClose}
            autoFocus
            aria-label="Close parking details"
          >
            <Icon name="close" />
          </button>
        </div>
      </header>
      <div className="parking-details-modal-content">
        <div className="listing-detail-title">
          <p className="eyebrow">{area.verifiedLocation ? area.category : area.hostKind}</p>
          <h2 id="parking-details-title">{area.name}</h2>
          <p className="parking-details-modal-location">{area.location}</p>
        </div>
        <ListingGallery area={area} />
        <div className="listing-detail-columns">
          <div className="listing-detail-information">
            <section className="listing-host-section">
              <span className="host-avatar">
                {area.verifiedLocation
                  ? 'P'
                  : area.hostName
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')}
              </span>
              <div>
                <h3>
                  {area.verifiedLocation
                    ? 'A researched Davao location'
                    : 'Hosted by ' + area.hostName}
                </h3>
                <p>
                  {area.verifiedLocation
                    ? 'Preview inventory, independent of the real facility.'
                    : 'Fictional local host · marketplace preview'}
                </p>
              </div>
            </section>
            <div className="detail-feature-row">
              <span>
                <Icon name="car" />
                {area.vehicles.join(' & ')}
              </span>
              <span>
                <Icon name={area.parkingType === 'Covered' ? 'roof' : 'sun'} />
                {area.parkingType}
              </span>
              <span className={'availability availability--' + area.availability.toLowerCase()}>
                {area.availability}
              </span>
            </div>
            <section>
              <h3>A little about this space</h3>
              <p>{area.demoDescription}</p>
            </section>
            <section>
              <h3>What’s included</h3>
              <ul className="amenity-list">
                {area.amenities.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={17} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="detail-fine-print">
                Amenities, prices, vehicle options, bay layouts and operating details are
                illustrative.
              </p>
            </section>
            <section>
              <h3>Getting in & parking well</h3>
              <p>{area.access}</p>
              <ul className="parking-rules">
                {area.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <p>
                Preview hours: {area.demoHours.open}–{area.demoHours.close}. This does not describe
                real opening hours.
              </p>
            </section>
            <section>
              <h3>Location & directions</h3>
              <p>
                {area.verifiedLocation
                  ? area.description
                  : 'This fictional listing represents a neighborhood only. No actual property is offered.'}
              </p>
              <a
                className="button parking-map-link"
                href={area.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="pin" size={16} />
                {area.verifiedLocation
                  ? 'Open in Google Maps'
                  : 'Explore the neighborhood in Maps'}{' '}
                ?
              </a>
              {area.verifiedLocation && (
                <details className="parking-location-sources">
                  <summary>Location sources & verification</summary>
                  <p>
                    Researched {area.researchedOn}. These sources establish location and parking
                    existence, not current access, hours, prices or partnership. Maps searches the
                    premises, not a verified entrance.
                  </p>
                  <ul>
                    {area.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label} ?
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </section>
          </div>
          <aside className="listing-reservation-panel" aria-label="Reservation panel" ref={flowRef}>
            <div className="reservation-panel-price">
              <p>
                <strong>{pesos(area.hourlyRate)}</strong> / hour
              </p>
              <span>Illustrative price · no payment</span>
            </div>
            {total !== null && (
              <p className="estimated-total">
                Estimated visit total <strong>{pesos(total)}</strong>
                <small>Rounded up to whole hours. No charge is made.</small>
              </p>
            )}
            {(slotError || reservationError) && (
              <p className="inline-notice" role="alert">
                {slotError} {reservationError}
              </p>
            )}
            <ParkingReservationFlow
              key={area.id}
              facility={area}
              slots={slotsByFacility[area.id]}
              supportedVehicles={area.vehicles}
              draft={reservationDraft}
              onDraftChange={onDraftChange}
              onChooseParking={onClose}
            />
          </aside>
        </div>
      </div>
    </dialog>
  )
}
