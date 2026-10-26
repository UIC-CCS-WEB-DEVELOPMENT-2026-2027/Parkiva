import Icon from './Icon'
import ParkingLocationVisual from './ParkingLocationVisual'
import './HostWelcome.css'

export default function HostWelcome({ onStart, onSignIn, onBrowse }) {
  return (
    <section className="host-welcome" aria-labelledby="host-welcome-heading">
      <button className="text-button host-back" onClick={onBrowse}>
        <Icon name="back" size={16} />
        Back to parking
      </button>
      <div className="host-welcome-layout">
        <div>
          <p className="auth-audience">
            <Icon name="roof" size={18} />
            PARKIVA FOR HOSTS
          </p>
          <h1 id="host-welcome-heading" tabIndex={-1}>
            A parking space.
            <br />A little more possibility.
          </h1>
          <p className="host-welcome-intro">Earn from your unused parking space.</p>
          <ol className="hosting-steps">
            <li>
              <Icon name="plus" />
              <span>
                Add your space<small>A driveway, a few bays, or a parking business.</small>
              </span>
            </li>
            <li>
              <Icon name="calendar" />
              <span>
                Set the details<small>Choose availability, rates and parking rules.</small>
              </span>
            </li>
            <li>
              <Icon name="scan" />
              <span>
                Welcome your drivers<small>Manage visits and check parking passes.</small>
              </span>
            </li>
          </ol>
          <div className="host-welcome-actions">
            <button className="button primary" onClick={onStart}>
              Start hosting
              <Icon name="arrow" size={17} />
            </button>
            <button className="text-button" onClick={onSignIn}>
              Host sign in
            </button>
          </div>
          <p className="host-welcome-note">
            Sample hosting experience. No real property offer, earnings or business ownership is
            created.
          </p>
        </div>
        <ParkingLocationVisual area={{ imageKey: 'garage' }} eager />
      </div>
    </section>
  )
}
