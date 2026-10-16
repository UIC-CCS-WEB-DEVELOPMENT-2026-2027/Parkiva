import { useState } from 'react'
import { parkingAreas } from './parkingData'
import './ParkingDiscovery.css'

export default function ParkingDiscovery() {
  const [search, setSearch] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [availability, setAvailability] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const query = search.trim().toLowerCase()
  const results = parkingAreas.filter((area) =>
    `${area.name} ${area.location}`.toLowerCase().includes(query) &&
    (!vehicle || area.vehicles.includes(vehicle)) &&
    (!availability || area.availability === availability),
  )

  function resetFilters() {
    setSearch('')
    setVehicle('')
    setAvailability('')
    setExpandedId(null)
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
        <button className="parking-reset" type="button" onClick={resetFilters}>Reset Filters</button>
      </form>

      <p className="parking-result-count" role="status">{results.length} {results.length === 1 ? 'parking area' : 'parking areas'} shown</p>
      {results.length === 0 ? (
        <p className="parking-empty">No parking areas match your filters. Try another search or reset the filters.</p>
      ) : (
        <div className="parking-grid">
          {results.map((area) => {
            const expanded = expandedId === area.id
            return (
              <article className="parking-card" key={area.id} aria-labelledby={`${area.id}-name`}>
                <div className="parking-placeholder" role="img" aria-label={`Image placeholder for ${area.name}`}>Parking image placeholder</div>
                <div className="parking-card-content">
                  <h2 id={`${area.id}-name`}>{area.name}</h2>
                  <p className="parking-location">{area.location}</p>
                  <dl className="parking-facts">
                    <div><dt>Vehicles</dt><dd>{area.vehicles.join(', ')}</dd></div>
                    <div><dt>Mock status</dt><dd>{area.availability}</dd></div>
                  </dl>
                  <button className="parking-details-button" type="button" aria-expanded={expanded} aria-controls={`${area.id}-details`} onClick={() => setExpandedId(expanded ? null : area.id)}>
                    {expanded ? 'Close Details' : 'View Details'}<span className="parking-sr-only"> for {area.name}</span>
                  </button>
                  <div className="parking-details" id={`${area.id}-details`} hidden={!expanded}>
                    <p>{area.description}</p>
                    <p>{area.access}</p>
                    <p>Fictional example for demonstration only.</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
