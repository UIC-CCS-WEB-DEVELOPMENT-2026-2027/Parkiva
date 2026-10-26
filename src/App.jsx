import { useEffect, useRef, useState } from 'react'
import './App.css'
import ParkingDiscovery from './components/ParkingDiscovery'
import Footer from './components/Footer'
import ReservationHistory from './components/ReservationHistory'
import DemoAuthForm from './components/DemoAuthForm'
import { MockParkingProvider } from './components/MockParkingContext'
import OperatorDashboard from './components/OperatorDashboard'
import { DemoAccountProvider, useDemoAccount } from './components/DemoAccountContext'
import DriverDashboard from './components/DriverDashboard'

export default function App() {
  return <DemoAccountProvider><AccountWorkspace /></DemoAccountProvider>
}

function AccountWorkspace() {
  const { account } = useDemoAccount()
  return <MockParkingProvider key={account?.id || 'guest'}><ParkivaApp /></MockParkingProvider>
}

function ParkivaApp() {
  const [guestOpen, setGuestOpen] = useState(false)
  const { account, login, logout, error: accountError } = useDemoAccount()
  const [view, setView] = useState(account?.id === 'operator-demo' ? 'operator' : account ? 'driver' : 'browse')
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
    if (view === 'driver') document.getElementById('driver-dashboard-heading')?.focus()
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
            {account?.id === 'driver-demo' && <button className="nav-button" aria-current={view === 'driver' ? 'page' : undefined} onClick={() => { setGuestOpen(false); setView('driver') }}>Driver Dashboard</button>}
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
                {account ? `${account.role} demo` : 'Guest'}
                <svg className="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              {guestOpen && <div className="guest-dropdown" id="guest-dropdown">
                {account ? <button onClick={logout}>Log Out (demo)</button> : <>
                  <button onClick={() => openAuth('login')}>Log In</button>
                  <button onClick={() => openAuth('register')}>Register</button>
                </>}
              </div>}
            </div>
          </div>
        </nav>
        <p className="demo-session-notice" role="status">{account ? `Simulated ${account.role} session. Only the demo account ID is saved. All data and role restrictions are browser-local demonstrations, not secure authentication or real facility management.` : ''}</p>
        {accountError && <p className="demo-session-notice" role="alert">{accountError}</p>}
      </header>
      <main className="discovery-main">
      <div hidden={view !== 'browse'}><ParkingDiscovery /></div>
      {view === 'reservations' && <ReservationHistory onBrowse={browse} />}
      {view === 'driver' && account?.id === 'driver-demo' && <DriverDashboard onBrowse={browse} />}
      {view === 'operator' && <OperatorDashboard onBrowse={browse} onLogin={() => openAuth('login')} />}
      {(view === 'login' || view === 'register') && <DemoAuthForm key={view} mode={view} onSwitch={openAuth} onBrowse={browse}
        onComplete={login} />}
      <aside className="development" aria-labelledby="development-heading">
        <h2 id="development-heading"><span className="status-dot" aria-hidden="true" />Still in Development</h2>
        <p>Student demo. Location listings are real; availability and reservations are simulated.</p>
      </aside>
      </main>
      <Footer />
    </div>
  )
}
