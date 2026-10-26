import { trapDialogFocus } from './dialogAccessibility'
import { useEffect, useRef, useState } from 'react'
import { useMockParking } from './MockParkingContext'
import { useParkingFavorites } from './ParkingFavorites'
import ParkingDetailsModal from './ParkingDetailsModal'
import ListingCard from './ListingCard'
import Icon from './Icon'
import { createReservationDraft, hasDemoConflict } from './demoReservations'
import { filterMarketplace } from './marketplaceSearch'
import { validateReservationDateTime } from './reservationDateTime'
import { NEIGHBORHOODS } from './marketplaceData'
import './ParkingDiscovery.css'

const defaults = {
  search: '',
  vehicle: '',
  availability: '',
  parkingType: '',
  maxPrice: '',
  sortBy: 'default',
  savedOnly: false,
}
export default function ParkingDiscovery({ savedView = false, active = true, onHost, onShowAll }) {
  const { areas, records, slotsByFacility, listingError, loaded } = useMockParking()
  const [filters, setFilters] = useState(defaults)
  const [selectedId, setSelectedId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [timing, setTiming] = useState({ date: '', arrival: '', departure: '' })
  const [timeErrors, setTimeErrors] = useState({})
  const [datesApplied, setDatesApplied] = useState(false)
  const [datesExpanded, setDatesExpanded] = useState(false)
  const { savedIds, toggleSaved } = useParkingFavorites(areas, { ready: loaded && !listingError })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterDialog = useRef(null)
  const filterTrigger = useRef(null)
  useEffect(() => {
    if (!active) {
      setSelectedId(null)
      setFiltersOpen(false)
    }
  }, [active])
  const field = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }))
  useEffect(() => {
    field('savedOnly', savedView)
  }, [savedView])
  useEffect(() => {
    if (!filtersOpen) return
    const dialog = filterDialog.current
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      filterTrigger.current?.focus()
    }
  }, [filtersOpen])

  const results = filterMarketplace(areas, filters, savedIds).filter((area) => {
    if (!datesApplied) return true
    if (timing.arrival < area.demoHours.open || timing.departure > area.demoHours.close)
      return false
    return slotsByFacility[area.id].some(
      (slot) =>
        slot.status === 'Available' &&
        (!filters.vehicle || slot.vehicle === filters.vehicle) &&
        !hasDemoConflict(records, {
          facility: area,
          slot,
          dateTime: timing,
          vehicle: { plate: '__SEARCH__' },
        }),
    )
  })
  const featured =
    !Object.entries(filters).some(([key, value]) => key !== 'sortBy' && Boolean(value)) &&
    !datesApplied
  const selectedArea = areas.find((area) => area.id === selectedId)
  function open(area) {
    if (datesApplied && !drafts[area.id])
      setDrafts((previous) => ({
        ...previous,
        [area.id]: { ...createReservationDraft(), dateTime: { ...timing } },
      }))
    setSelectedId(area.id)
  }
  function reset() {
    setFilters({ ...defaults, savedOnly: savedView })
    setTiming({ date: '', arrival: '', departure: '' })
    setDatesApplied(false)
    setTimeErrors({})
  }
  function search(event) {
    event.preventDefault()
    const requested = Object.values(timing).some(Boolean)
    const errors = requested ? validateReservationDateTime(timing) : {}
    setTimeErrors(errors)
    if (Object.keys(errors).length) return
    setDatesApplied(requested)
    document
      .getElementById('listing-results')
      ?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  const filterControls = (
    <>
      <label>
        Availability
        <select
          aria-label="Availability"
          value={filters.availability}
          onChange={(e) => field('availability', e.target.value)}
        >
          <option value="">All statuses</option>
          <option>Available</option>
          <option>Limited</option>
          <option>Full</option>
        </select>
      </label>
      <label>
        Parking type
        <select
          aria-label="Parking type"
          value={filters.parkingType}
          onChange={(e) => field('parkingType', e.target.value)}
        >
          <option value="">Covered & open-air</option>
          <option>Covered</option>
          <option>Open-air</option>
        </select>
      </label>
      <label>
        Maximum hourly rate
        <select
          aria-label="Maximum hourly rate"
          value={filters.maxPrice}
          onChange={(e) => field('maxPrice', e.target.value)}
        >
          <option value="">Any price</option>
          <option value="25">Up to ₱25</option>
          <option value="35">Up to ₱35</option>
          <option value="50">Up to ₱50</option>
        </select>
      </label>
    </>
  )
  return (
    <section className="parking-discovery" aria-labelledby="parking-heading">
      <div className="marketplace-intro">
        <div className="marketplace-intro-copy">
          <p className="eyebrow">
            <Icon name="pin" size={15} /> DAVAO CITY, PHILIPPINES
          </p>
          <h1 id="parking-heading" tabIndex={-1}>
            {savedView ? (
              'Your saved spots.'
            ) : (
              <>
                Find your spot
                <br />
                in Davao.
              </>
            )}
          </h1>
          <p>
            From a quick errand to a full day out. Explore parking around the places you’re headed.
          </p>
          <a href="#listing-results" className="text-link">
            Explore parking <Icon name="arrow" size={17} />
          </a>
        </div>
        <div className="marketplace-intro-image">
          <img
            src="/images/parking-aerial.jpg"
            width="1200"
            height="800"
            alt="Representative aerial parking photograph, not a Davao facility"
            fetchPriority="high"
          />
          <span>More time for where you’re going.</span>
          <small>Representative photography · Erik Mclean / Pexels</small>
        </div>
      </div>
      <form
        className={'marketplace-search' + (datesExpanded ? ' show-times' : '')}
        role="search"
        aria-label="Search parking"
        noValidate
        onSubmit={search}
      >
        <label className="destination-search">
          <span>
            <Icon name="pin" size={16} /> Where are you headed?
          </span>
          <input
            type="search"
            placeholder="Place, neighborhood or parking name"
            value={filters.search}
            onChange={(e) => field('search', e.target.value)}
          />
        </label>
        <label className="search-time-field" id="search-date-field">
          Date <span className="optional">optional</span>
          <input
            type="date"
            aria-label="Search date"
            value={timing.date}
            onChange={(e) => {
              setDatesApplied(false)
              setTiming({ ...timing, date: e.target.value })
            }}
            aria-invalid={Boolean(timeErrors.date)}
          />
        </label>
        <label className="search-time-field" id="search-arrival-field">
          Arrive
          <input
            type="time"
            aria-label="Search arrival time"
            value={timing.arrival}
            onChange={(e) => {
              setDatesApplied(false)
              setTiming({ ...timing, arrival: e.target.value })
            }}
            aria-invalid={Boolean(timeErrors.arrival)}
          />
        </label>
        <label className="search-time-field" id="search-departure-field">
          Leave
          <input
            type="time"
            aria-label="Search departure time"
            value={timing.departure}
            onChange={(e) => {
              setDatesApplied(false)
              setTiming({ ...timing, departure: e.target.value })
            }}
            aria-invalid={Boolean(timeErrors.departure)}
          />
        </label>
        <label>
          Vehicle type
          <select
            aria-label="Vehicle type"
            value={filters.vehicle}
            onChange={(e) => field('vehicle', e.target.value)}
          >
            <option value="">All vehicles</option>
            <option>Car</option>
            <option>Motorcycle</option>
          </select>
        </label>
        <button className="button primary search-submit" type="submit">
          <Icon name="search" size={18} />
          Find parking
        </button>
        <button
          className="search-times-toggle text-button"
          type="button"
          aria-expanded={datesExpanded}
          aria-controls="search-date-field search-arrival-field search-departure-field"
          onClick={() => setDatesExpanded(!datesExpanded)}
        >
          {datesExpanded ? 'Hide visit times' : 'Add visit times'}
          <span> · optional</span>
        </button>
        {Object.keys(timeErrors).length > 0 && (
          <p className="search-error" role="alert">
            {Object.values(timeErrors).join(' ')}
          </p>
        )}
      </form>
      <nav className="neighborhoods" aria-label="Popular Davao areas">
        <span>Explore by area</span>
        {NEIGHBORHOODS.slice(0, 6).map((area) => (
          <button
            key={area}
            type="button"
            aria-pressed={filters.search === area}
            onClick={() => field('search', filters.search === area ? '' : area)}
          >
            {area}
          </button>
        ))}
      </nav>
      <div className="discovery-heading" id="listing-results">
        <div>
          <p className="eyebrow">
            {savedView || filters.savedOnly
              ? 'YOUR SHORTLIST'
              : featured
                ? 'A GOOD PLACE TO START'
                : 'FIND THE RIGHT FIT'}
          </p>
          <h2>
            {savedView || filters.savedOnly
              ? 'Saved parking'
              : featured
                ? 'Parking around Davao'
                : 'Explore parking'}
          </h2>
          <p className="parking-result-count" role="status">
            {results.length} {results.length === 1 ? 'parking area' : 'parking areas'} shown
            {datesApplied ? ' for your selected time' : ''} · rates and availability are simulated
          </p>
        </div>
        <button
          ref={filterTrigger}
          className="button filter-toggle"
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          <Icon name="filter" size={18} />
          Filters
        </button>
      </div>
      <div className="discovery-toolbar">
        <div className="desktop-filters">{filterControls}</div>
        <label className="parking-sort">
          Sort By
          <select
            aria-label="Sort By"
            value={filters.sortBy}
            onChange={(e) => field('sortBy', e.target.value)}
          >
            <option value="default">Default Order</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="availability">Availability (Available First)</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <button
          className="button saved-filter"
          aria-pressed={filters.savedOnly}
          onClick={() =>
            savedView && filters.savedOnly ? onShowAll() : field('savedOnly', !filters.savedOnly)
          }
        >
          <Icon name="heart" size={16} />
          {filters.savedOnly ? 'Show All' : 'Saved Only'}
          <span>{savedIds.length}</span>
        </button>
        <button className="text-button parking-reset" type="button" onClick={reset}>
          Reset Filters
        </button>
      </div>
      {listingError && (
        <p role="alert" className="inline-notice">
          {listingError}
        </p>
      )}
      {results.length === 0 ? (
        <div className="parking-empty">
          <Icon name="search" size={28} />
          <h3>
            {filters.savedOnly ? 'Your next favorite is out there.' : 'No spots found this time.'}
          </h3>
          <p>
            {filters.savedOnly && savedIds.length === 0
              ? 'Save a spot with the heart button to keep it here.'
              : 'Try a nearby area, another visit time, or fewer filters.'}
          </p>
          <button className="button" onClick={reset}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="parking-grid">
          {results.map((area) => (
            <ListingCard
              key={area.id}
              area={area}
              saved={savedIds.includes(area.id)}
              onSave={toggleSaved}
              onOpen={open}
            />
          ))}
        </div>
      )}
      {featured && (
        <>
          <section className="marketplace-recommendations">
            <div className="section-title">
              <div>
                <p className="eyebrow">A DIFFERENT WAY TO PARK</p>
                <h2>Meet the neighborhood spaces.</h2>
              </div>
              <p>Try private driveways and independent lots with fictional local hosts.</p>
            </div>
            <div className="recommended-links">
              {areas
                .filter((area) => !area.verifiedLocation)
                .slice(0, 3)
                .map((area) => (
                  <button key={area.id} onClick={() => open(area)}>
                    <span className="host-avatar">
                      {area.hostName
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <span>
                      <strong>{area.name}</strong>
                      <small>
                        {area.hostName} · {area.neighborhood}
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </button>
                ))}
            </div>
          </section>
          <section className="hosting-callout">
            <div>
              <p className="eyebrow">MAKE ROOM FOR SOMETHING GOOD</p>
              <h2>A spare space. A new possibility.</h2>
              <p>See how a local host can list a space, welcome drivers, and manage visits.</p>
            </div>
            <button className="button primary" onClick={onHost}>
              Explore hosting
              <Icon name="arrow" size={18} />
            </button>
          </section>
        </>
      )}
      {selectedArea && (
        <ParkingDetailsModal
          area={selectedArea}
          reservationDraft={drafts[selectedId]}
          onDraftChange={(draft) => setDrafts((previous) => ({ ...previous, [selectedId]: draft }))}
          saved={savedIds.includes(selectedId)}
          onSave={() => toggleSaved(selectedId)}
          onClose={() => setSelectedId(null)}
        />
      )}
      {filtersOpen && (
        <dialog
          ref={filterDialog}
          className="filter-dialog"
          onKeyDown={trapDialogFocus}
          aria-labelledby="filter-title"
          onCancel={(e) => {
            e.preventDefault()
            setFiltersOpen(false)
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const r = e.currentTarget.getBoundingClientRect()
              if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
              )
                setFiltersOpen(false)
            }
          }}
        >
          <div className="filter-sheet">
            <header>
              <h2 id="filter-title">Find your kind of spot</h2>
              <button
                className="icon-button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
                autoFocus
              >
                <Icon name="close" />
              </button>
            </header>
            {filterControls}
            <p>Prices and availability are illustrative.</p>
            <div className="filter-sheet-actions">
              <button className="text-button" onClick={reset}>
                Reset Filters
              </button>
              <button className="button primary" onClick={() => setFiltersOpen(false)}>
                Show {results.length} spots
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  )
}
