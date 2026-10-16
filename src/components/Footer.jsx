import './Footer.css'

export default function Footer() {
  return (
    <footer className="parkiva-footer">
      <p className="parkiva-footer__description">
        <span className="parkiva-footer__name">Parkiva</span>
        <span className="parkiva-footer__separator" aria-hidden="true">
          &middot;
        </span>
        <span>Public Parking Reservation &amp; Management System</span>
      </p>
      <p className="parkiva-footer__team">Parkiva Team</p>
    </footer>
  )
}
