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
export default function ParkingDiscovery({
  savedView = false,
  active = true,
  onShowAll,
  listingId,
  onListingOpen,
  onListingClose,
  drafts = {},
  onDraftChange,
  onReservations,
  onViewPass,
  onSignIn,
}) {
  const { areas, records, slotsByFacility, listingError, loaded } = useMockParking()
  const [filters, setFilters] = useState(defaults)
  const selectedId = listingId
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
  const selectedArea = areas.find((area) => area.id === selectedId)
  function open(area) {
    if (datesApplied && !drafts[area.id])
      onDraftChange(area.id, { ...createReservationDraft(), dateTime: { ...timing } })
    onListingOpen(area.id)
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
      <header className="discovery-title">
        <h1 id="parking-heading" tabIndex={-1}>
          {savedView ? 'Your saved parking spots.' : 'Find your parking spot in Davao.'}
        </h1>
      </header>
      <form
        id="parking-search"
        className="marketplace-search"
        role="search"
        aria-label="Search parking"
        noValidate
        onSubmit={search}
      >
        <label className="destination-search">
          <Icon name="search" size={20} />
          <span className="parking-sr-only">Search parking</span>
          <input
            type="search"
            placeholder="Search Davao parking"
            aria-label="Search parking"
            list="davao-neighborhoods"
            value={filters.search}
            onChange={(e) => field('search', e.target.value)}
          />
        </label>
        <datalist id="davao-neighborhoods">
          {NEIGHBORHOODS.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
        <button
          className="button primary search-submit"
          type="submit"
          aria-label="Find parking"
          title="Find parking"
        >
          <span>Find parking</span>
          <Icon name="arrow" size={19} />
        </button>
        {datesExpanded && (
          <fieldset className="search-date-fields" id="search-visit-times">
            <legend>Plan your visit</legend>
            {[
              ['date', 'Search date', 'calendar'],
              ['arrival', 'Search arrival time', 'clock'],
              ['departure', 'Search departure time', 'clock'],
            ].map(([key, label, icon]) => (
              <label key={key}>
                <span>
                  <Icon name={icon} size={15} />
                  {key === 'date' ? 'Date' : key === 'arrival' ? 'Arrive' : 'Leave'}
                </span>
                <input
                  type={key === 'date' ? 'date' : 'time'}
                  aria-label={label}
                  value={timing[key]}
                  onChange={(e) => {
                    setDatesApplied(false)
                    setTiming({ ...timing, [key]: e.target.value })
                  }}
                  aria-invalid={Boolean(timeErrors[key])}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              Apply times
            </button>
          </fieldset>
        )}
        {Object.keys(timeErrors).length > 0 && (
          <p className="search-error" role="alert">
            {Object.values(timeErrors).join(' ')}
          </p>
        )}
      </form>
      <div className="quick-filters" role="group" aria-label="Parking filters">
        <CompactSelect
          label="Vehicle type"
          icon="car"
          value={filters.vehicle}
          onChange={(e) => field('vehicle', e.target.value)}
        >
          <option value="">All vehicles</option>
          <option>Car</option>
          <option>Motorcycle</option>
        </CompactSelect>
        <CompactSelect
          label="Parking type"
          icon="roof"
          value={filters.parkingType}
          onChange={(e) => field('parkingType', e.target.value)}
        >
          <option value="">All parking</option>
          <option>Covered</option>
          <option>Open-air</option>
        </CompactSelect>
        <button
          className="button filter-toggle"
          ref={filterTrigger}
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          <Icon name="filter" size={16} />
          Filters
          {(filters.availability || filters.maxPrice) && (
            <span className="filter-active-dot" aria-label="Active filters">
              •
            </span>
          )}
        </button>
        <button
          className="button search-times-toggle"
          type="button"
          aria-expanded={datesExpanded}
          aria-controls={datesExpanded ? 'search-visit-times' : undefined}
          aria-label={datesExpanded ? 'Hide visit times' : 'Add visit times'}
          onClick={() => setDatesExpanded(!datesExpanded)}
        >
          <Icon name="calendar" size={16} />
          {datesApplied ? timing.date.slice(5) : 'Dates'}
        </button>
        <button
          className="button saved-filter"
          type="button"
          aria-pressed={filters.savedOnly}
          aria-label={filters.savedOnly ? 'Show All' : 'Saved Only'}
          onClick={() =>
            savedView && filters.savedOnly ? onShowAll() : field('savedOnly', !filters.savedOnly)
          }
        >
          <Icon name="heart" size={16} />
          {filters.savedOnly ? 'Show all' : 'Saved'}
          <span>{savedIds.length}</span>
        </button>
      </div>
      <div className="discovery-toolbar" id="listing-results">
        <p className="parking-result-count" role="status">
          {results.length} {results.length === 1 ? 'parking area' : 'parking areas'} shown
          {datesApplied && <span className="parking-sr-only"> for your selected time</span>}
        </p>
        <CompactSelect
          label="Sort By"
          icon="sort"
          className="parking-sort"
          value={filters.sortBy}
          onChange={(e) => field('sortBy', e.target.value)}
        >
          <option value="default">Recommended</option>
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="availability">Availability</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </CompactSelect>
        <button
          className="text-button parking-reset"
          aria-label="Reset Filters"
          title="Reset filters"
          type="button"
          onClick={reset}
        >
          <Icon name="reset" size={15} />
          <span>Reset</span>
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
      {selectedArea && (
        <ParkingDetailsModal
          area={selectedArea}
          reservationDraft={drafts[selectedId]}
          onDraftChange={(draft) => onDraftChange(selectedId, draft)}
          saved={savedIds.includes(selectedId)}
          onSave={() => toggleSaved(selectedId)}
          onClose={onListingClose}
          onReservations={onReservations}
          onViewPass={onViewPass}
          onSignIn={onSignIn ? () => onSignIn(selectedId) : undefined}
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
              <h2 id="filter-title">Refine your search</h2>
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
function CompactSelect({ label, icon, className = '', value, onChange, children }) {
  return (
    <label className={'compact-select ' + className}>
      <Icon name={icon} size={16} />
      <span className="parking-sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={onChange}>
        {children}
      </select>
    </label>
  )
}
