import { getDemoStorage, isDemoStorageEvent } from './demoAccounts'
import { useEffect, useState } from 'react'
import { DEMO_NOTICE, DEMO_RESERVATIONS_KEY, readDemoReservations } from './demoReservations'
import ReservationHistoryCard from './ReservationHistoryCard'
import './ReservationHistory.css'

export default function ReservationHistory({ onBrowse }) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => new Date())

  function refresh() {
    setNow(new Date())
    try {
      setRecords(readDemoReservations(getDemoStorage()).sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt)))
      setError('')
    } catch {
      setRecords([])
      setError('Demo reservations could not be read. Browser storage may be unavailable or contain corrupted data. Your stored data has not been changed.')
    }
  }

  useEffect(() => {
    refresh()
    const sync = (event) => { if (isDemoStorageEvent(event.key, DEMO_RESERVATIONS_KEY)) refresh() }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', refresh)
      window.clearInterval(timer)
    }
  }, [])

  return (
    <section className="reservation-history" aria-labelledby="reservations-heading">
      <h1 id="reservations-heading" tabIndex={-1}>My Reservations</h1>
      <p className="demo-reservation-notice">{DEMO_NOTICE}</p>
      <p>Demo reservations saved in the current guest or demo-account workspace in this browser. This separation is simulated, not secure account storage. Times use your local time zone.</p>
      <div className="reservation-history-actions">
        <button type="button" onClick={onBrowse}>Browse parking</button>
        <button type="button" onClick={() => { setMessage(''); refresh() }}>Refresh reservations</button>
      </div>
      <p role="status" aria-live="polite">{message || (!error && `${records.length} demo ${records.length === 1 ? 'reservation' : 'reservations'}`)}</p>
      {error ? <p className="reservation-history-error reservation-history-empty" role="alert">{error} Use Refresh reservations to try again.</p> : records.length === 0 ? (
        <div className="reservation-history-empty"><h2>No demo reservations yet</h2><p>Browse parking and complete a simulated reservation to see it here.</p></div>
      ) : <div className="reservation-history-grid">{records.map((record) => <ReservationHistoryCard key={record.reference} reservation={record} now={now}
        onUpdated={(notice) => { setMessage(notice); refresh() }} />)}</div>}
    </section>
  )
}
