import { useMockParking } from './MockParkingContext'
import { useParkingFavorites } from './ParkingFavorites'
import { parkingAreas } from './parkingData'
import ReservationHistory from './ReservationHistory'
import './DriverDashboard.css'

export default function DriverDashboard({ onBrowse }) {
  const { areas } = useMockParking()
  const { savedIds, toggleSaved } = useParkingFavorites(parkingAreas)
  const favorites = areas.filter((area) => savedIds.includes(area.id))
  return <section className="driver-dashboard" aria-labelledby="driver-dashboard-heading">
    <h1 id="driver-dashboard-heading" tabIndex={-1}>Driver demo dashboard</h1>
    <p>This is a simulated Driver account. Favorites and reservations use a separate browser-local demo workspace, not a secure account or real booking service.</p>
    <h2>Saved parking locations</h2>
    {favorites.length === 0 ? <p>No saved locations yet. Browse parking to add favorites.</p> : <div className="driver-favorites">{favorites.map((area) => <article key={area.id}>
      <h3>{area.name}</h3><p>{area.location}</p><p>Simulated availability: {area.availability}</p>
      <button type="button" onClick={() => toggleSaved(area.id)}>Unsave<span className="parking-sr-only"> {area.name}</span></button>
    </article>)}</div>}
    <div className="reservation-history-actions"><button type="button" onClick={onBrowse}>Browse parking</button></div>
    <ReservationHistory onBrowse={onBrowse} />
  </section>
}
