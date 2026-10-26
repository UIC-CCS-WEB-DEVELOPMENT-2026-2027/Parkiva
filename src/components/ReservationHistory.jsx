import { getDemoStorage, isDemoStorageEvent } from './demoAccounts'
import { useEffect, useState } from 'react'
import {
  DEMO_RESERVATIONS_KEY,
  demoReservationStatus,
  readDemoReservations,
} from './demoReservations'
import { DEMO_DATA_EVENT } from './mockSlotState'
import ReservationHistoryCard from './ReservationHistoryCard'
import Icon from './Icon'
import './ReservationHistory.css'

const groups = ['All', 'Upcoming', 'Active', 'Past', 'Cancelled']
const inGroup = (record, group, now) => {
  const status = demoReservationStatus(record, now)
  return (
    group === 'All' ||
    (group === 'Active'
      ? ['In progress', 'Checked in'].includes(status)
      : group === 'Past'
        ? status === 'Completed'
        : status === group)
  )
}
export default function ReservationHistory({ onBrowse, embedded = false }) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [group, setGroup] = useState('All')
  const [now, setNow] = useState(() => new Date())
  function refresh() {
    setNow(new Date())
    try {
      setRecords(
        readDemoReservations(getDemoStorage()).sort((a, b) =>
          b.confirmedAt.localeCompare(a.confirmedAt),
        ),
      )
      setError('')
    } catch {
      setRecords([])
      setError(
        'Reservations could not be read. Browser storage may be unavailable or corrupted. Stored data has not been changed.',
      )
    }
  }
  useEffect(() => {
    refresh()
    const sync = (event) => {
      if (isDemoStorageEvent(event.key, DEMO_RESERVATIONS_KEY)) refresh()
    }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refresh)
    window.addEventListener(DEMO_DATA_EVENT, refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', refresh)
      window.removeEventListener(DEMO_DATA_EVENT, refresh)
      window.clearInterval(timer)
    }
  }, [])
  const shown = records.filter((record) => inGroup(record, group, now))
  const Heading = embedded ? 'h2' : 'h1'
  return (
    <section
      className={'reservation-history' + (embedded ? ' reservation-history-embedded' : '')}
      aria-labelledby="reservations-heading"
    >
      <div className="workspace-heading">
        <div>
          {!embedded && <p className="eyebrow">YOUR CITY PLANS</p>}
          <Heading id="reservations-heading" tabIndex={-1}>
            {embedded ? 'Your reservations' : 'My Reservations'}
          </Heading>
          <p>Keep your visits in view. Your pass is right where you need it.</p>
        </div>
        <button className="button" onClick={onBrowse}>
          <Icon name="search" size={17} />
          Browse parking
        </button>
      </div>
      <div className="history-toolbar">
        <div className="history-tabs" role="group" aria-label="Filter reservations">
          {groups.map((item) => (
            <button key={item} aria-pressed={group === item} onClick={() => setGroup(item)}>
              {item}
              <span>{records.filter((record) => inGroup(record, item, now)).length}</span>
            </button>
          ))}
        </div>
        <button
          className="text-button"
          onClick={() => {
            setMessage('')
            refresh()
          }}
        >
          Refresh reservations
        </button>
      </div>
      <p className="history-local-note">
        Only this workspace’s browser-local preview visits are shown. All reservations and passes
        are simulated. Times follow your device’s local time.
      </p>
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      {error ? (
        <p className="inline-notice" role="alert">
          {error} Use Refresh reservations to try again.
        </p>
      ) : !shown.length ? (
        <div className="reservation-history-empty">
          <Icon name="qr" size={35} />
          <h2>
            {records.length
              ? 'No ' + group.toLowerCase() + ' visits here.'
              : 'Your next visit starts with a spot.'}
          </h2>
          <p>
            {records.length
              ? 'Switch to another tab to find your reservations.'
              : 'Explore Davao parking and try a reservation. Your visit details and parking pass will appear here.'}
          </p>
          <button className="button primary" onClick={onBrowse}>
            Find parking
            <Icon name="arrow" size={17} />
          </button>
        </div>
      ) : (
        <div className="reservation-history-grid">
          {shown.map((record) => (
            <ReservationHistoryCard
              key={record.reference}
              reservation={record}
              now={now}
              onUpdated={(notice) => {
                setMessage(notice)
                refresh()
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
