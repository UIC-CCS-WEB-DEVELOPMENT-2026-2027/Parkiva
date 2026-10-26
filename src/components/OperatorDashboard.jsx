import { useRef, useState } from 'react'
import { useMockParking } from './MockParkingContext'
import { demoReservationStatus } from './demoReservations'
import { mockSlotCounts, saveMockSlotStatus, SLOT_STATUSES } from './mockSlotState'
import { useDemoAccount } from './DemoAccountContext'
import { editableFacility } from './hostListings'
import { pesos } from './marketplaceData'
import ParkingLocationVisual from './ParkingLocationVisual'
import HostListingForm from './HostListingForm'
import HostPassVerifier from './HostPassVerifier'
import Icon from './Icon'
import './OperatorDashboard.css'

export default function OperatorDashboard({ onBrowse, onLogin }) {
  const { account } = useDemoAccount()
  const {
    areas: allAreas,
    records,
    now,
    slotsByFacility,
    slotCatalog,
    manualSlots,
    slotError,
    reservationError,
    listingError,
    refresh,
  } = useMockParking()
  const operator = account?.id === 'operator-demo'
  const areas = allAreas.filter((area) =>
    editableFacility(
      area.id,
      allAreas.filter((item) => item.ownerAccountId === 'operator-demo'),
    ),
  )
  const [facilityId, setFacilityId] = useState(areas[0]?.id || '')
  const [tab, setTab] = useState('overview')
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const busy = useRef(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reservationFilter, setReservationFilter] = useState('All')
  const facility = areas.find((area) => area.id === facilityId) || areas[0]
  const assigned = records.filter((record) => areas.some((area) => area.id === record.facility.id))
  const selectedRecords = assigned.filter(
    (record) =>
      record.facility.id === facility?.id &&
      (reservationFilter === 'All' || demoReservationStatus(record, now) === reservationFilter),
  )
  const totals = areas.reduce(
    (counts, area) => {
      const values = mockSlotCounts(slotsByFacility[area.id])
      for (const key of SLOT_STATUSES) counts[key] += values[key]
      return counts
    },
    { Available: 0, Reserved: 0, Occupied: 0, Unavailable: 0 },
  )
  const totalSlots = Object.values(totals).reduce((sum, value) => sum + value, 0)
  async function changeStatus(slotId, status) {
    if (busy.current || !operator) return
    busy.current = true
    setSaving(true)
    setMessage('')
    setError('')
    const result = await saveMockSlotStatus(facility.id, slotId, status, slotCatalog)
    if (result.ok) {
      setMessage(slotId + ' is now ' + status.toLowerCase() + ' in the preview.')
      refresh()
    } else setError(result.error)
    setSaving(false)
    busy.current = false
  }
  function startEdit(area) {
    setEditor(area || 'new')
    setTab('listings')
    setMessage('')
    setError('')
  }
  return (
    <section className="operator-dashboard" aria-labelledby="operator-dashboard-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">PARKIVA FOR HOSTS</p>
          <h1 id="operator-dashboard-heading" tabIndex={-1}>
            {operator ? 'A good day starts here.' : 'Make more of your parking space.'}
          </h1>
          <p>
            {operator
              ? 'Your spaces, your next arrivals, and the little details that keep things moving.'
              : 'Try the tools for a private parking host or a local parking business.'}
          </p>
        </div>
        <button className="button primary" onClick={operator ? () => startEdit(null) : onLogin}>
          <Icon name="plus" size={18} />
          {operator ? 'Add a listing' : 'Try the host account'}
        </button>
      </div>
      <p className="host-disclosure">
        Host preview · Fictional listings and training assignments only. This account does not own
        or manage the real businesses listed here. All changes stay in this browser.
      </p>
      {!operator && (
        <div className="host-guest-intro">
          <div>
            <Icon name="roof" size={32} />
            <h2>
              A driveway or a whole parking lot.
              <br />
              There’s room for both.
            </h2>
            <p>
              List a fictional space, plan your bays, review incoming visits and practice scanning a
              driver’s pass. Guest browsing stays open to everyone.
            </p>
            <div className="host-guest-actions">
              <button className="button primary" onClick={onLogin}>
                Use operator demo login
              </button>
              <button className="button" onClick={onBrowse}>
                Browse parking
              </button>
            </div>
          </div>
          <ParkingLocationVisual area={{ imageKey: 'garage' }} eager />
        </div>
      )}
      {(slotError || reservationError || listingError) && (
        <div role="alert" className="inline-notice">
          {slotError} {reservationError} {listingError}
        </div>
      )}
      <div className="host-statistics">
        <div>
          <span>Spaces in your preview</span>
          <strong>{totalSlots}</strong>
          <small>Across {areas.length} listings</small>
        </div>
        <div>
          <span>Available now</span>
          <strong>{totals.Available}</strong>
          <small>Illustrative bays</small>
        </div>
        <div>
          <span>Occupied</span>
          <strong>{totals.Occupied}</strong>
          <small>
            {totalSlots ? Math.round((totals.Occupied / totalSlots) * 100) : 0}% occupancy
          </small>
        </div>
        <div>
          <span>Incoming & active visits</span>
          <strong>
            {
              assigned.filter((record) =>
                ['Upcoming', 'In progress', 'Checked in'].includes(
                  demoReservationStatus(record, now),
                ),
              ).length
            }
          </strong>
          <small>Same-browser records</small>
        </div>
      </div>
      <div className="workspace-tabs" role="group" aria-label="Host workspace views">
        {[
          ['overview', 'Overview'],
          ['listings', 'My listings'],
          ['slots', 'Spaces & availability'],
          ['reservations', 'Reservations'],
          ...(operator ? [['verification', 'Verify a pass']] : []),
        ].map(([id, label]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {id === 'verification' && <Icon name="qr" size={17} />} {label}
          </button>
        ))}
      </div>
      {tab === 'overview' && (
        <>
          <div className="section-title">
            <div>
              <p className="eyebrow">YOUR DAY, AT A GLANCE</p>
              <h2>Keep your spaces moving.</h2>
            </div>
            <button className="text-button" onClick={refresh}>
              Refresh dashboard
            </button>
          </div>
          <div className="host-overview-grid">
            <div>
              <h3>Next in your preview</h3>
              {assigned
                .filter((record) =>
                  ['Upcoming', 'In progress', 'Checked in'].includes(
                    demoReservationStatus(record, now),
                  ),
                )
                .slice(0, 4)
                .map((record) => (
                  <article className="host-arrival" key={record.reference}>
                    <span className="host-avatar">
                      <Icon name="car" size={20} />
                    </span>
                    <div>
                      <strong>{record.vehicle.plate}</strong>
                      <p>
                        {record.facility.name} · {record.slot.id}
                      </p>
                      <small>
                        {record.dateTime.date} · {record.dateTime.arrival}–
                        {record.dateTime.departure}
                      </small>
                    </div>
                    <span className="arrival-status">{demoReservationStatus(record, now)}</span>
                  </article>
                ))}
              {!assigned.length && (
                <p className="host-empty">
                  No incoming visits yet. Try reserving a preview space as a guest or driver.
                </p>
              )}
            </div>
            <div className="host-quick-actions">
              <h3>Make yourself at home</h3>
              <button onClick={() => setTab('listings')}>
                <Icon name="roof" />
                <span>
                  Review your listings<small>Details, rates and preview hours</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
              <button onClick={() => setTab('slots')}>
                <Icon name="car" />
                <span>
                  Arrange your spaces<small>Update bay availability</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
              <button onClick={operator ? () => setTab('verification') : onLogin}>
                <Icon name="qr" />
                <span>
                  Welcome a driver<small>Scan or enter a parking pass</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </>
      )}
      <div hidden={tab !== 'listings'}>
        {editor ? (
          <HostListingForm
            key={editor === 'new' ? 'new' : editor.id}
            area={editor === 'new' ? null : editor}
            onCancel={() => setEditor(null)}
            onSaved={(id) => {
              refresh()
              setFacilityId(id)
              setEditor(null)
              setMessage('Your preview listing was saved. You can find it in public discovery.')
            }}
          />
        ) : (
          <>
            <div className="section-title">
              <div>
                <p className="eyebrow">YOUR CORNER OF DAVAO</p>
                <h2>Listings with a little possibility.</h2>
              </div>
              {operator && (
                <button className="button" onClick={() => startEdit(null)}>
                  <Icon name="plus" size={16} />
                  Add a listing
                </button>
              )}
            </div>
            <div className="host-listing-grid">
              {areas.map((area) => (
                <article key={area.id} className="host-listing-card">
                  <ParkingLocationVisual area={area} />
                  <div>
                    <span className="host-listing-category">
                      {area.neighborhood} ·{' '}
                      {area.verifiedLocation ? 'Training inventory' : 'Fictional property'}
                    </span>
                    <h3>{area.name}</h3>
                    <p>
                      {pesos(area.hourlyRate)} / hour · {area.parkingType} ·{' '}
                      {slotCatalog[area.id].length} preview bays
                    </p>
                    <div className="host-card-actions">
                      <button
                        className="button"
                        disabled={!operator || Boolean(listingError)}
                        onClick={() => startEdit(area)}
                      >
                        Edit listing<span className="parking-sr-only"> {area.name}</span>
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          setFacilityId(area.id)
                          setTab('slots')
                        }}
                      >
                        Manage spaces
                        <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      {(tab === 'slots' || tab === 'reservations') && facility && (
        <>
          <div className="host-facility-toolbar">
            <label htmlFor="operator-facility">
              Choose a preview listing
              <select
                id="operator-facility"
                value={facility.id}
                onChange={(e) => {
                  setFacilityId(e.target.value)
                  setMessage('')
                  setError('')
                }}
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
            <p>
              Changes apply to shared preview inventory in this browser. Manual status changes never
              cancel an existing visit.
            </p>
          </div>
          {tab === 'slots' ? (
            <>
              <h2 className="host-subheading">Spaces at {facility.name}</h2>
              <div className="slot-count-row">
                {SLOT_STATUSES.map((status) => (
                  <span key={status}>
                    <i className={'status-marker ' + status.toLowerCase()} />
                    {status}
                    <strong>{mockSlotCounts(slotsByFacility[facility.id])[status]}</strong>
                  </span>
                ))}
              </div>
              <div className="operator-slot-grid">
                {manualSlots[facility.id].map((slot) => {
                  const effective = slotsByFacility[facility.id].find(
                    (item) => item.id === slot.id,
                  ).status
                  return (
                    <article
                      className={'operator-slot status-' + effective.toLowerCase()}
                      key={facility.id + slot.id}
                    >
                      <div>
                        <Icon name="car" size={22} />
                        <h3>{slot.id}</h3>
                      </div>
                      <p>
                        {slot.vehicle} ? <strong>{effective}</strong>
                      </p>
                      <label htmlFor={'operator-' + facility.id + '-' + slot.id}>
                        Set status for {slot.id}
                      </label>
                      <select
                        id={'operator-' + facility.id + '-' + slot.id}
                        value={slot.status}
                        disabled={!operator || saving || Boolean(slotError)}
                        onChange={(e) => changeStatus(slot.id, e.target.value)}
                      >
                        {SLOT_STATUSES.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      {effective !== slot.status && (
                        <small>A current visit determines the displayed state.</small>
                      )}
                    </article>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="host-record-heading">
                <h2 className="host-subheading">Visit records</h2>
                <label>
                  Status
                  <select
                    value={reservationFilter}
                    onChange={(e) => setReservationFilter(e.target.value)}
                  >
                    {['All', 'Upcoming', 'In progress', 'Checked in', 'Completed', 'Cancelled'].map(
                      (status) => (
                        <option key={status}>{status}</option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              {reservationError ? (
                <p className="host-empty">
                  Records are unavailable. Resolve browser storage and refresh to try again.
                </p>
              ) : !selectedRecords.length ? (
                <p className="host-empty">No visits match this listing and status yet.</p>
              ) : (
                <div className="host-records">
                  {selectedRecords.map((record) => (
                    <article className="host-record" key={record.reference}>
                      <div>
                        <span className="reservation-history-status">
                          {demoReservationStatus(record, now)}
                        </span>
                        <h3>{record.vehicle.plate}</h3>
                        <p>
                          {record.vehicle.type} · {record.vehicle.model || 'Model not provided'}
                        </p>
                      </div>
                      <dl>
                        <div>
                          <dt>Bay</dt>
                          <dd>{record.slot.id}</dd>
                        </div>
                        <div>
                          <dt>Visit</dt>
                          <dd>
                            {record.dateTime.date} · {record.dateTime.arrival}–
                            {record.dateTime.departure}
                          </dd>
                        </div>
                        <div>
                          <dt>Reference</dt>
                          <dd>{record.reference}</dd>
                        </div>
                      </dl>
                      {operator && (
                        <p className="field-help">
                          Open ?Verify a pass? and enter this reference to practice entry or exit.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
      {tab === 'verification' && operator && <HostPassVerifier />}
      <p role="status" className="host-feedback">
        {saving ? 'Saving status?' : message}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </section>
  )
}
