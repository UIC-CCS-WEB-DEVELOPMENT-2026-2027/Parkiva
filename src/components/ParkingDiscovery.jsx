import { useState } from 'react'
import { useMockParking } from './MockParkingContext'
import { parkingAreas as parkingCatalog } from './parkingData'
import { useParkingFavorites } from './ParkingFavorites'
import ParkingDetailsModal from './ParkingDetailsModal'
import './ParkingDiscovery.css'

const availabilityOrder = { Available: 0, Limited: 1, Full: 2 }

export default function ParkingDiscovery() {
  const { areas: parkingAreas } = useMockParking()
  const [search, setSearch] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [selectedArea, setSelectedArea] = useState(null)
  const [reservationDrafts, setReservationDrafts] = useState({})
  const { savedIds, toggleSaved } = useParkingFavorites(parkingCatalog)
  const [savedOnly, setSavedOnly] = useState(false)
  const query = search.trim().toLowerCase()
  const results = parkingAreas.filter((area) =>
    `${area.name} ${area.location}`.toLowerCase().includes(query) &&
    (!vehicle || area.vehicles.includes(vehicle)) &&
    (!availability || area.availability === availability) &&
    (!savedOnly || savedIds.includes(area.id)),
  )

  // Filtering creates a new array, so sorting never changes the source order.
  if (sortBy === 'name-asc') {
    results.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'name-desc') {
    results.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortBy === 'availability') {
    results.sort((a, b) => availabilityOrder[a.availability] - availabilityOrder[b.availability])
  }

  function resetFilters() {
    setSearch('')
    setVehicle('')
    setAvailability('')
    setSortBy('default')
    setSelectedArea(null)
    setSavedOnly(false)
  }

  return (
    <section className="parking-discovery" aria-labelledby="parking-heading">
      <h1 id="parking-heading" tabIndex={-1}>Browse Parking Areas</h1>
      <p className="parking-demo-note">Demonstration data only. All locations and availability are fictional.</p>

      <form className="parking-filters" role="search" aria-label="Filter parking areas" onSubmit={(event) => event.preventDefault()}>
        <label className="parking-search">
          Search parking
          <input type="search" placeholder="Parking name or location" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label>
          Vehicle type
          <select value={vehicle} onChange={(event) => setVehicle(event.target.value)}>
            <option value="">All vehicles</option>
            <option value="Car">Car</option>
            <option value="Motorcycle">Motorcycle</option>
          </select>
        </label>
        <label>
          Availability
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="">All statuses</option>
            <option value="Available">Available</option>
            <option value="Limited">Limited</option>
            <option value="Full">Full</option>
          </select>
        </label>
        <label className="parking-sort">
          Sort By
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="default">Default Order</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="availability">Availability (Available First)</option>
          </select>
        </label>
        <button className="parking-reset" type="button" onClick={resetFilters}>Reset Filters</button>
      </form>

      <div className="parking-favorites-toolbar parking-discovery-favorites">
        <p className="parking-favorites-count" role="status">{savedIds.length} {savedIds.length === 1 ? 'parking area' : 'parking areas'} saved</p>
        <button className="parking-favorites-filter" type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((value) => !value)}>
          {savedOnly ? 'Show All' : 'Saved Only'}
        </button>
      </div>
      <p className="parking-result-count" role="status">{results.length} {results.length === 1 ? 'parking area' : 'parking areas'} shown</p>
      {results.length === 0 ? (
        <p className="parking-empty">{savedOnly && savedIds.length === 0 ? 'You haven’t saved any parking areas yet.' : 'No parking areas match your filters. Try another search or reset the filters.'}</p>
      ) : (
        <div className="parking-grid">
          {results.map((area) => {
            return (
              <article className="parking-card" key={area.id} aria-labelledby={`${area.id}-name`}>
                <div className="parking-placeholder" role="img" aria-label={`Image placeholder for ${area.name}`}>Parking image placeholder</div>
                <div className="parking-card-content">
                  <h2 id={`${area.id}-name`}>{area.name}</h2>
                  <p className="parking-location">{area.location}</p>
                  <button className="parking-favorite-save" type="button" aria-pressed={savedIds.includes(area.id)} onClick={() => toggleSaved(area.id)}>
                    {savedIds.includes(area.id) ? 'Unsave' : 'Save'}<span className="parking-sr-only"> {area.name}</span>
                  </button>
                  <dl className="parking-facts">
                    <div><dt>Vehicles</dt><dd>{area.vehicles.join(', ')}</dd></div>
                    <div><dt>Mock status</dt><dd>{area.availability}</dd></div>
                  </dl>
                  <button className="parking-details-button" type="button" aria-haspopup="dialog" onClick={() => setSelectedArea(area)}>
                    View Details<span className="parking-sr-only"> for {area.name}</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {selectedArea && <ParkingDetailsModal area={parkingAreas.find((area) => area.id === selectedArea.id)} reservationDraft={reservationDrafts[selectedArea.id]}
        onDraftChange={(draft) => setReservationDrafts((previous) => ({ ...previous, [selectedArea.id]: draft }))}
        onClose={() => setSelectedArea(null)} />}
    </section>
  )
}
