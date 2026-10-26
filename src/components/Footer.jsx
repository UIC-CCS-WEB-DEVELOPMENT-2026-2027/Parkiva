import './Footer.css'
export default function Footer({ onBrowse, onHost, onReservations }) {
  return (
    <footer className="parkiva-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <strong>
            Parkiva<span>.</span>
          </strong>
          <p>
            A little less circling.
            <br />A little more Davao.
          </p>
          <small>Made with care by the Parkiva Team.</small>
        </div>
        <div>
          <h2>Find your way</h2>
          <button onClick={onBrowse}>Explore Davao parking</button>
          <button onClick={onReservations}>Your reservations & passes</button>
          <button onClick={onHost}>Become a parking host</button>
        </div>
        <div>
          <h2>A city with possibilities</h2>
          <p>
            Built for drivers, neighborhood hosts,
            <br />
            and parking businesses in Davao City.
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Davao+City+Philippines"
            target="_blank"
            rel="noreferrer"
          >
            Davao City, Philippines ↗
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Parkiva · Academic marketplace preview</span>
        <span>Browser-local reservations · No real bookings or payments</span>
      </div>
    </footer>
  )
}
