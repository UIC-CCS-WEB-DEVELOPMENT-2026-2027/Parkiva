import './App.css'

export default function App() {
  return (
    <div className="landing-page">
      <main className="development" aria-labelledby="development-heading">
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
