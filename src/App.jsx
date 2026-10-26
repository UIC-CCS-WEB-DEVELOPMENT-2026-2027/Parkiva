import { useEffect, useRef, useState } from 'react'
import './App.css'
import ParkingDiscovery from './components/ParkingDiscovery'
import Footer from './components/Footer'
import ReservationHistory from './components/ReservationHistory'
import DemoAuthForm from './components/DemoAuthForm'
import DemoParkingPass from './components/DemoParkingPass'
import { MockParkingProvider, useMockParking } from './components/MockParkingContext'
import OperatorDashboard from './components/OperatorDashboard'
import { DemoAccountProvider, useDemoAccount } from './components/DemoAccountContext'
import {
  ReservationDraftProvider,
  useReservationDrafts,
} from './components/ReservationDraftContext'
import DriverDashboard from './components/DriverDashboard'
import HostWelcome from './components/HostWelcome'
import Icon from './components/Icon'
import useParkivaNavigation from './components/useParkivaNavigation'

export default function App() {
  return (
    <DemoAccountProvider>
      <ReservationDraftProvider>
        <AccountWorkspace />
      </ReservationDraftProvider>
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
  const { areas, loaded } = useMockParking()
  const { workspaces, update, transfer } = useReservationDrafts()
  const { route, navigate: changeRoute, closeListing } = useParkivaNavigation()
  const [guestOpen, setGuestOpen] = useState(false)
  const guestRef = useRef(null)
  const guestButtonRef = useRef(null)
  const previousView = useRef(route.page)
  const operator = account?.id === 'operator-demo'
  const view = route.page
  const auth = ['login', 'register', 'host-login', 'host-register'].includes(view)
  const hostAuth = view.startsWith('host-')
  const listing = route.listingId ? areas.find((area) => area.id === route.listingId) : null
  const discovery = ['browse', 'saved', 'parking'].includes(view)
  const savedDiscovery =
    view === 'saved' || (view === 'parking' && window.history.state?.from === '#saved')
  const unknownListing = view === 'parking' && loaded && !listing
  function navigate(path, options) {
    setGuestOpen(false)
    changeRoute(path, options)
  }
  const browse = () => navigate('browse')
  const openPass = (reference) => navigate('pass/' + reference)
  const reservations = () => navigate('reservations')
  function signInForListing(id) {
    navigate('login?returnTo=' + encodeURIComponent('parking/' + id))
  }
  function completeLogin(id) {
    const ok = login(id)
    if (!ok) return false
    if (id === 'driver-demo' && route.returnTo) {
      transfer(account?.id, id, route.returnTo.slice('parking/'.length))
      navigate(route.returnTo, { replace: true })
    } else navigate(id === 'operator-demo' ? 'operator' : 'driver', { replace: true })
    return true
  }
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
    if (unknownListing) {
      document.getElementById('not-found-heading')?.focus({ preventScroll: true })
      return
    }
    const closingListing = previousView.current === 'parking' && ['browse', 'saved'].includes(view)
    previousView.current = view
    if (closingListing) return
    const ids = {
      browse: 'parking-heading',
      saved: 'parking-heading',
      reservations: 'reservations-heading',
      driver: 'driver-dashboard-heading',
      host: 'host-welcome-heading',
      operator: operator ? 'operator-dashboard-heading' : 'host-welcome-heading',
      login: 'demo-auth-heading',
      register: 'demo-auth-heading',
      'host-login': 'demo-auth-heading',
      'host-register': 'demo-auth-heading',
      pass: 'parking-pass-page-heading',
      'not-found': 'not-found-heading',
    }
    document.getElementById(ids[view])?.focus({ preventScroll: true })
  }, [view, operator, unknownListing])
  useEffect(() => {
    const titles = {
      browse: 'Find parking in Davao',
      saved: 'Saved parking',
      reservations: 'My Reservations',
      driver: 'Your account',
      host: 'List your space',
      operator: operator ? 'Host workspace' : 'List your space',
      login: 'Sign in',
      register: 'Try Parkiva',
      'host-login': 'Host sign in',
      'host-register': 'Start hosting',
      pass: 'Parking pass',
      'not-found': 'Page not found',
    }
    document.title =
      (unknownListing
        ? 'Page not found'
        : view === 'parking'
          ? listing?.name || 'Parking details'
          : titles[view] || 'Parkiva') + ' | Parkiva'
  }, [view, listing?.name, operator, unknownListing])
  const missing = view === 'not-found' || unknownListing
  const hostWelcome = view === 'host' || (view === 'operator' && !operator)
  return (
    <div className="landing-page">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <button className="brand-button" aria-label="Parkiva home" onClick={browse}>
            <img className="navbar-logo" src="/parkiva.png" alt="Parkiva" width="60" height="60" />
          </button>
          <div className="primary-navigation">
            <button
              className="nav-button"
              aria-current={
                ['browse', 'parking'].includes(view) && !savedDiscovery ? 'page' : undefined
              }
              onClick={browse}
            >
              <Icon name="search" size={17} />
              Explore
            </button>
            <button
              className="nav-button"
              aria-current={savedDiscovery ? 'page' : undefined}
              onClick={() => navigate('saved')}
            >
              <Icon name="heart" size={17} />
              Saved
            </button>
            {operator ? (
              <button
                className="nav-button mobile-host-workspace"
                aria-current={view === 'operator' ? 'page' : undefined}
                onClick={() => navigate('operator')}
              >
                <Icon name="roof" size={17} />
                Workspace
              </button>
            ) : (
              <button
                className="nav-button"
                aria-current={view === 'reservations' || view === 'pass' ? 'page' : undefined}
                onClick={reservations}
              >
                <Icon name="calendar" size={17} />
                My Reservations
              </button>
            )}
          </div>
          <div className="nav-controls">
            <button
              className={'nav-button host-nav' + (operator ? ' host-nav--operator' : '')}
              aria-current={view === 'host' || view === 'operator' ? 'page' : undefined}
              onClick={() => navigate(operator ? 'operator' : 'host')}
            >
              <Icon name="roof" size={16} />
              {operator ? 'Host workspace' : 'List your space'}
            </button>
            {account ? (
              <div
                className="guest-control"
                ref={guestRef}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setGuestOpen(false)
                }}
              >
                <button
                  className="guest-button"
                  aria-label="Account"
                  ref={guestButtonRef}
                  aria-current={view === 'driver' ? 'page' : undefined}
                  aria-expanded={guestOpen}
                  aria-controls="guest-dropdown"
                  onClick={() => setGuestOpen(!guestOpen)}
                >
                  <Icon name="user" size={18} />
                  <span>Account</span>
                  <Icon name="chevron" size={14} />
                </button>
                {guestOpen && (
                  <div className="guest-dropdown" id="guest-dropdown">
                    <p>{operator ? 'Host' : 'Driver'} · sample account</p>
                    <button onClick={() => navigate(operator ? 'operator' : 'driver')}>
                      <Icon name="user" size={16} />
                      {operator ? 'Host workspace' : 'Your account'}
                    </button>
                    <button
                      onClick={() => {
                        window.history.replaceState(null, '', '#browse')
                        logout()
                      }}
                    >
                      <Icon name="logout" size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="sign-in-button" onClick={() => navigate('login')}>
                <Icon name="user" size={17} />
                Sign in
              </button>
            )}
          </div>
        </nav>
      </header>
      {accountError && (
        <p className="inline-notice" role="alert">
          {accountError}
        </p>
      )}
      <main className="discovery-main" id="main-content" tabIndex={-1}>
        <div hidden={!discovery || unknownListing}>
          <ParkingDiscovery
            active={discovery && !unknownListing}
            listingId={route.listingId}
            onListingOpen={(id) => navigate('parking/' + id, { overlay: true })}
            onListingClose={closeListing}
            savedView={savedDiscovery}
            onShowAll={browse}
            drafts={workspaces[account?.id || 'guest'] || {}}
            onDraftChange={(id, draft) => update(account?.id, id, draft)}
            onSignIn={!account ? signInForListing : undefined}
            onReservations={reservations}
            onViewPass={openPass}
          />
        </div>
        {view === 'reservations' && <ReservationHistory onBrowse={browse} onViewPass={openPass} />}
        {view === 'driver' &&
          (account?.id === 'driver-demo' ? (
            <DriverDashboard
              onBrowse={browse}
              onSaved={() => navigate('saved')}
              onListingOpen={(id) => navigate('parking/' + id, { overlay: true })}
              onViewPass={openPass}
            />
          ) : (
            <div className="account-required">
              <Icon name="user" size={30} />
              <h1>Your parking, all together.</h1>
              <p>Sign in to open your saved driver workspace.</p>
              <button className="button primary" onClick={() => navigate('login')}>
                Driver sign in
              </button>
              <button className="text-button" onClick={browse}>
                Back to parking
              </button>
            </div>
          ))}
        {operator && (
          <div hidden={view !== 'operator'}>
            <OperatorDashboard
              active={view === 'operator'}
              onBrowse={browse}
              onLogin={() => navigate('host-login')}
            />
          </div>
        )}
        {hostWelcome && (
          <HostWelcome
            onBrowse={browse}
            onStart={() => navigate(operator ? 'operator' : 'host-register')}
            onSignIn={() => navigate(operator ? 'operator' : 'host-login')}
          />
        )}
        {auth && (
          <DemoAuthForm
            key={hostAuth ? 'host' : 'driver'}
            audience={hostAuth ? 'host' : 'driver'}
            mode={view.endsWith('register') ? 'register' : 'login'}
            onSwitch={(mode) =>
              navigate(
                (hostAuth ? 'host-' : '') +
                  mode +
                  (route.returnTo ? '?returnTo=' + encodeURIComponent(route.returnTo) : ''),
              )
            }
            onBrowse={route.returnTo ? () => navigate(route.returnTo, { replace: true }) : browse}
            onOtherAudience={() => navigate(hostAuth ? 'login' : 'host-login')}
            onComplete={completeLogin}
          />
        )}
        {view === 'pass' && (
          <section className="parking-pass-page">
            <button className="text-button page-back" onClick={reservations}>
              <Icon name="back" size={16} />
              My Reservations
            </button>
            <h1 id="parking-pass-page-heading" tabIndex={-1}>
              Your parking pass
            </h1>
            <DemoParkingPass reference={route.reference} />
            <button className="button" onClick={browse}>
              <Icon name="search" size={16} />
              Explore parking
            </button>
          </section>
        )}
        {missing && (
          <section className="not-found">
            <Icon name="pin" size={30} />
            <h1 id="not-found-heading" tabIndex={-1}>
              That spot isn’t here.
            </h1>
            <p>The page or parking listing could not be found.</p>
            <button className="button primary" onClick={browse}>
              Explore parking
              <Icon name="arrow" size={17} />
            </button>
          </section>
        )}
      </main>
      <Footer onBrowse={browse} onHost={() => navigate('host')} onReservations={reservations} />
    </div>
  )
}
