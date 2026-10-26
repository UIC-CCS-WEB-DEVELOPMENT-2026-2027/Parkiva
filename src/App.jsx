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
import Icon from './components/Icon'

export default function App() {
  return (
    <DemoAccountProvider>
      <AccountWorkspace />
    </DemoAccountProvider>
  )
}
function AccountWorkspace() {
  const { account } = useDemoAccount()
  return (
    <MockParkingProvider key={account?.id || 'guest'}>
      <ParkivaApp />
    </MockParkingProvider>
  )
}
function ParkivaApp() {
  const { account, login, logout, error: accountError } = useDemoAccount()
  const home = account?.id === 'operator-demo' ? 'operator' : account ? 'driver' : 'browse'
  function currentRoute() {
    const route = window.location.hash.slice(1)
    if (['browse', 'saved', 'reservations', 'operator'].includes(route)) return route
    if (!account && ['login', 'register'].includes(route)) return route
    if (account?.id === 'driver-demo' && route === 'driver') return route
    return home
  }
  const [view, setView] = useState(currentRoute)
  const [guestOpen, setGuestOpen] = useState(false)
  const guestRef = useRef(null)
  const guestButtonRef = useRef(null)
  function navigate(next) {
    setGuestOpen(false)
    setView(next)
    if (window.location.hash !== '#' + next) window.history.pushState(null, '', '#' + next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const browse = () => navigate('browse')
  useEffect(() => {
    const back = () => {
      setGuestOpen(false)
      setView(currentRoute())
    }
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [])
  useEffect(() => {
    if (!guestOpen) return
    const outside = (event) => {
      if (!guestRef.current?.contains(event.target)) setGuestOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') {
        setGuestOpen(false)
        guestButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [guestOpen])
  useEffect(() => {
    const ids = {
      browse: 'parking-heading',
      saved: 'parking-heading',
      reservations: 'reservations-heading',
      driver: 'driver-dashboard-heading',
      operator: 'operator-dashboard-heading',
      login: 'demo-auth-heading',
      register: 'demo-auth-heading',
    }
    document.getElementById(ids[view])?.focus({ preventScroll: true })
    document.title =
      (view === 'browse'
        ? 'Find parking in Davao'
        : {
            saved: 'Saved parking',
            reservations: 'My Reservations',
            driver: 'Your dashboard',
            operator: 'Host workspace',
            login: 'Demo login',
            register: 'Try Parkiva',
          }[view]) + ' | Parkiva'
  }, [view])
  return (
    <div className="landing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <button className="brand-button" aria-label="Parkiva home" onClick={browse}>
            <img className="navbar-logo" src="/parkiva.png" alt="Parkiva" width="72" height="72" />
          </button>
          <div className="primary-navigation">
            <button
              className="nav-button"
              aria-current={view === 'browse' ? 'page' : undefined}
              onClick={browse}
            >
              <Icon name="search" size={18} />
              Browse
            </button>
            <button
              className="nav-button"
              aria-current={view === 'saved' ? 'page' : undefined}
              onClick={() => navigate('saved')}
            >
              <Icon name="heart" size={18} />
              Saved
            </button>
            <button
              className="nav-button"
              aria-current={view === 'reservations' ? 'page' : undefined}
              onClick={() => navigate('reservations')}
            >
              <Icon name="qr" size={18} />
              My Reservations
            </button>
            {account?.id === 'driver-demo' && (
              <button
                className="nav-button"
                aria-current={view === 'driver' ? 'page' : undefined}
                onClick={() => navigate('driver')}
              >
                <Icon name="user" size={18} />
                Driver Dashboard
              </button>
            )}
          </div>
          <div className="nav-controls">
            <button
              className="nav-button host-nav"
              aria-current={view === 'operator' ? 'page' : undefined}
              onClick={() => navigate('operator')}
            >
              {account?.id === 'operator-demo' ? 'Host workspace' : 'Explore hosting'}
              <Icon name="arrow" size={16} />
            </button>
            <div
              className="guest-control"
              ref={guestRef}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setGuestOpen(false)
              }}
            >
              <button
                className="guest-button"
                ref={guestButtonRef}
                aria-expanded={guestOpen}
                aria-controls="guest-dropdown"
                onClick={() => setGuestOpen(!guestOpen)}
              >
                <Icon name="user" size={18} />
                <span>
                  {account
                    ? account.id === 'driver-demo'
                      ? 'Driver · demo'
                      : 'Host · demo'
                    : 'Guest'}
                </span>
                <Icon name="menu" size={16} />
              </button>
              {guestOpen && (
                <div className="guest-dropdown" id="guest-dropdown">
                  {account ? (
                    <>
                      <p>{account.role} demo account</p>
                      <button
                        onClick={() =>
                          navigate(account.id === 'driver-demo' ? 'driver' : 'operator')
                        }
                      >
                        Your workspace
                      </button>
                      <button
                        onClick={() => {
                          window.history.replaceState(null, '', '#browse')
                          logout()
                        }}
                      >
                        Log Out (demo)
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => navigate('login')}>Log In</button>
                      <button onClick={() => navigate('register')}>Register</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <div className="preview-disclosure">
        <span className="preview-dot" aria-hidden="true" />
        <p>
          Marketplace preview. Prices, availability, hosts and bookings are simulated.{' '}
          <span>No real parking access or payments.</span>
        </p>
      </div>
      {accountError && (
        <p className="inline-notice" role="alert">
          {accountError}
        </p>
      )}
      <main className="discovery-main" id="main-content" tabIndex={-1}>
        <div hidden={view !== 'browse' && view !== 'saved'}>
          <ParkingDiscovery
            active={view === 'browse' || view === 'saved'}
            savedView={view === 'saved'}
            onShowAll={browse}
            onHost={() => navigate('operator')}
          />
        </div>
        {view === 'reservations' && <ReservationHistory onBrowse={browse} />}
        {view === 'driver' && (
          <DriverDashboard onBrowse={browse} onSaved={() => navigate('saved')} />
        )}
        {view === 'operator' && (
          <OperatorDashboard onBrowse={browse} onLogin={() => navigate('login')} />
        )}
        {(view === 'login' || view === 'register') && (
          <DemoAuthForm
            key={view}
            mode={view}
            onSwitch={navigate}
            onBrowse={browse}
            onComplete={(id) => {
              const ok = login(id)
              if (ok)
                window.history.replaceState(
                  null,
                  '',
                  id === 'driver-demo' ? '#driver' : '#operator',
                )
              return ok
            }}
          />
        )}
      </main>
      <Footer
        onBrowse={browse}
        onHost={() => navigate('operator')}
        onReservations={() => navigate('reservations')}
      />
    </div>
  )
}
