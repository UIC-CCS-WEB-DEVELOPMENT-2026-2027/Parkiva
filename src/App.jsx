import { useEffect, useRef, useState } from 'react'
import './App.css'

export default function App() {
  const [guestOpen, setGuestOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const guestRef = useRef(null)
  const guestButtonRef = useRef(null)
  const developmentRef = useRef(null)

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
    developmentRef.current.focus({ preventScroll: true })
    developmentRef.current.scrollIntoView({ block: 'center' })
  }

  return (
    <div className="landing-page">
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <img className="navbar-logo" src="/parkiva.png" alt="Parkiva" />
          <div className="nav-controls">
            <button className="nav-button" onClick={browse}>Browse</button>
            <div className="guest-control" ref={guestRef} onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setGuestOpen(false)
            }}>
              <button className="nav-button guest-button" ref={guestButtonRef}
                aria-expanded={guestOpen} aria-controls="guest-dropdown"
                onClick={() => { setNotice(''); setGuestOpen(!guestOpen) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                Guest
                <svg className="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              {guestOpen && <div className="guest-dropdown" id="guest-dropdown">
                <button onClick={() => setNotice('Log In — Coming Soon')}>Log In</button>
                <button onClick={() => setNotice('Register — Coming Soon')}>Register</button>
                <p className="auth-notice" role="status">{notice}</p>
              </div>}
            </div>
          </div>
        </nav>
      </header>
      <main className="development" ref={developmentRef} tabIndex={-1} aria-labelledby="development-heading">
        <img className="parkiva-logo" src="/parkiva.png" alt="Parkiva logo" />
        <p className="tagline">Smarter Parking Starts Here.</p>
        <div className="accent-line" aria-hidden="true" />
        <h1 id="development-heading">Still in Development</h1>
        <p className="description">
          We're currently building Parkiva, a smarter and more convenient way
          to find and reserve parking spaces.
        </p>
        <p className="development-status">
          <span className="status-dot" aria-hidden="true" />
          Development in Progress
        </p>
      </main>
      <footer className="page-footer">
        <p>
        Parkiva <span aria-hidden="true">&middot;</span> Public Parking Reservation
        &amp; Management System
        </p>
        <p>Parkiva Team</p>
      </footer>
    </div>
  )
}
