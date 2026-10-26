import { useEffect, useRef, useState } from 'react'
import './App.css'
import ParkingDiscovery from './components/ParkingDiscovery'
import Footer from './components/Footer'
import ReservationHistory from './components/ReservationHistory'
import DemoAuthForm from './components/DemoAuthForm'
import { MockParkingProvider } from './components/MockParkingContext'
import OperatorDashboard from './components/OperatorDashboard'

export default function App() {
  return <MockParkingProvider><ParkivaApp /></MockParkingProvider>
}

function ParkivaApp() {
  const [guestOpen, setGuestOpen] = useState(false)
  const [demoSession, setDemoSession] = useState(null)
  const [sessionNotice, setSessionNotice] = useState('')
  const [view, setView] = useState('browse')
  const guestRef = useRef(null)
  const guestButtonRef = useRef(null)

  useEffect(() => {
    if (!guestOpen) return
    function handleOutside(event) {
      if (!guestRef.current.contains(event.target)) setGuestOpen(false)
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setGuestOpen(false)
        guestButtonRef.current.focus()
      }
    }
    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [guestOpen])

  function browse() {
    setGuestOpen(false)
    setView('browse')
    requestAnimationFrame(() => {
      const heading = document.getElementById('parking-heading')
      heading?.focus({ preventScroll: true })
      heading?.scrollIntoView({ block: 'start' })
    })
  }

  useEffect(() => {
    if (view === 'reservations') {
      document.getElementById('reservations-heading')?.focus()
    }
    if (view === 'login' || view === 'register') document.getElementById('demo-auth-heading')?.focus()
    if (view === 'operator') document.getElementById('operator-dashboard-heading')?.focus()
  }, [view])

  function openAuth(mode) {
    setGuestOpen(false)
    setView(mode)
  }

  return (
    <div className="landing-page">
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <img className="navbar-logo" src="/parkiva.png" alt="Parkiva" />
          <div className="nav-controls">
            <button className="nav-button" onClick={browse} aria-current={view === 'browse' ? 'page' : undefined}>Browse</button>
            <button className="nav-button" aria-current={view === 'reservations' ? 'page' : undefined} onClick={() => { setGuestOpen(false); setView('reservations') }}>My Reservations</button>
            <button className="nav-button" aria-current={view === 'operator' ? 'page' : undefined} onClick={() => { setGuestOpen(false); setView('operator') }}>Operator Demo</button>
            <div className="guest-control" ref={guestRef} onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setGuestOpen(false)
            }}>
              <button className="nav-button guest-button" ref={guestButtonRef}
                aria-expanded={guestOpen} aria-controls="guest-dropdown"
                onClick={() => setGuestOpen(!guestOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                {demoSession ? 'Demo session' : 'Guest'}
                <svg className="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              {guestOpen && <div className="guest-dropdown" id="guest-dropdown">
                {demoSession ? <button onClick={() => { setDemoSession(null); setSessionNotice('Demo session ended. Browser-local reservations are unchanged.'); setGuestOpen(false); guestButtonRef.current?.focus() }}>End demo session</button> : <>
                  <button onClick={() => openAuth('login')}>Log In</button>
                  <button onClick={() => openAuth('register')}>Register</button>
                </>}
              </div>}
            </div>
          </div>
        </nav>
        <p className="demo-session-notice" role="status">{demoSession ? `Simulated session: ${demoSession.displayName}. This is not secure authentication. Reservations remain local to this browser, not account-linked.` : sessionNotice}</p>
      </header>
      <main className="discovery-main">
      <div hidden={view !== 'browse'}><ParkingDiscovery /></div>
      {view === 'reservations' && <ReservationHistory onBrowse={browse} />}
      {view === 'operator' && <OperatorDashboard onBrowse={browse} />}
      {(view === 'login' || view === 'register') && <DemoAuthForm key={view} mode={view} onSwitch={openAuth} onBrowse={browse}
        onComplete={(session) => { setDemoSession(session); setSessionNotice(''); browse() }} />}
      <section className="development" aria-labelledby="development-heading">
        <img className="parkiva-logo" src="/parkiva.png" alt="Parkiva logo" />
        <p className="tagline">Smarter Parking Starts Here.</p>
        <div className="accent-line" aria-hidden="true" />
        <h2 id="development-heading">Still in Development</h2>
        <p className="description">
          We're currently building Parkiva, a smarter and more convenient way
          to find and reserve parking spaces.
        </p>
        <p className="development-status">
          <span className="status-dot" aria-hidden="true" />
          Development in Progress
        </p>
      </section>
      </main>
      <Footer />
    </div>
  )
}
