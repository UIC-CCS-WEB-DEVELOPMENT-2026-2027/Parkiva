import { useMockParking } from './MockParkingContext'
import { useParkingFavorites } from './ParkingFavorites'
import ReservationHistory from './ReservationHistory'
import ParkingLocationVisual from './ParkingLocationVisual'
import Icon from './Icon'
import './DriverDashboard.css'

export default function DriverDashboard({ onBrowse, onSaved, onViewPass, onListingOpen }) {
  const { areas, ownRecords, loaded, listingError } = useMockParking()
  const { savedIds, toggleSaved } = useParkingFavorites(areas, { ready: loaded && !listingError })
  const favorites = areas.filter((area) => savedIds.includes(area.id))
  const vehicles = [
    ...new Map(ownRecords.map((record) => [record.vehicle.plate, record.vehicle])).values(),
  ]
  return (
    <section className="driver-dashboard" aria-labelledby="driver-dashboard-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">YOUR PARKIVA</p>
          <h1 id="driver-dashboard-heading" tabIndex={-1}>
            Good to see you, driver.
          </h1>
          <p>A place for your favorite spots and your next city plans.</p>
        </div>
        <button className="button primary" onClick={onBrowse}>
          Find a spot
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <div className="section-title">
        <h2>Your saved spots</h2>
        <button className="text-button" onClick={onSaved}>
          View all saved ({savedIds.length})
        </button>
      </div>
      {!favorites.length ? (
        <div className="parking-empty">
          <h3>Your shortlist starts here.</h3>
          <p>Tap the heart on any parking listing to save it for later.</p>
          <button className="button" onClick={onBrowse}>
            Explore parking
          </button>
        </div>
      ) : (
        <div className="driver-favorites">
          {favorites.slice(0, 3).map((area) => (
            <article key={area.id}>
              <ParkingLocationVisual area={area} />
              <div>
                <p>
                  {area.neighborhood} · {area.parkingType}
                </p>
                <h3>{area.name}</h3>
                <button className="text-button" onClick={() => toggleSaved(area.id)}>
                  Unsave<span className="parking-sr-only"> {area.name}</span>
                </button>
                <button className="text-button" onClick={() => onListingOpen(area.id)}>
                  View saved spot
                  <Icon name="arrow" size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <details className="driver-vehicles">
        <summary>Vehicles from your preview visits ({vehicles.length})</summary>
        {vehicles.length ? (
          vehicles.map((vehicle) => (
            <p key={vehicle.plate}>
              <Icon name="car" size={17} /> <strong>{vehicle.plate}</strong> · {vehicle.type}
              {vehicle.model && ' · ' + vehicle.model}
            </p>
          ))
        ) : (
          <p>Vehicle details appear after your first reservation.</p>
        )}
      </details>
      <ReservationHistory onBrowse={onBrowse} onViewPass={onViewPass} embedded />
    </section>
  )
}
