import Icon from './Icon'
import ParkingLocationVisual from './ParkingLocationVisual'
import { pesos } from './marketplaceData'

export default function ListingCard({ area, saved, onSave, onOpen }) {
  return (
    <article className="parking-card" aria-labelledby={`${area.id}-name`}>
      <div className="listing-card-media">
        <button
          className="listing-photo-button"
          onClick={() => onOpen(area)}
          aria-label={`View photos and details for ${area.name}`}
        >
          <ParkingLocationVisual area={area} />
        </button>
        <button
          className="parking-favorite-save"
          type="button"
          aria-label={`${saved ? 'Unsave' : 'Save'} ${area.name}`}
          title={saved ? 'Remove from saved' : 'Save parking'}
          aria-pressed={saved}
          onClick={() => onSave(area.id)}
        >
          <Icon name="heart" fill={saved ? 'currentColor' : 'white'} />
        </button>
        <span className="listing-category">
          {area.verifiedLocation ? area.category : area.hostKind}
        </span>
      </div>
      <div className="parking-card-content">
        <div className="listing-card-location">
          <span>
            <Icon name="pin" size={13} />
            {area.neighborhood} · Davao City
          </span>
          <span
            className={`availability availability--${area.availability.toLowerCase()}`}
            title={'Simulated availability: ' + area.availability}
          >
            {area.availability}
          </span>
        </div>
        <h2 id={`${area.id}-name`}>
          <button type="button" onClick={() => onOpen(area)}>
            {area.name}
          </button>
        </h2>
        <p className="listing-host">
          {area.verifiedLocation
            ? 'Location guide · no host partnership'
            : `Hosted by ${area.hostName} · fictional host`}
        </p>
        <div className="listing-amenities">
          <span>
            <Icon name={area.parkingType === 'Covered' ? 'roof' : 'sun'} size={16} />
            {area.parkingType}
          </span>
          <span>
            <Icon name="car" size={16} />
            {area.vehicles.join(' & ')}
          </span>
        </div>
        <div className="listing-card-bottom">
          <p>
            <strong>{pesos(area.hourlyRate)}</strong>
            <span> / hour</span>
            <small>Sample rate</small>
          </p>
          <button
            className="parking-details-button"
            type="button"
            aria-haspopup="dialog"
            onClick={() => onOpen(area)}
          >
            View Details<span className="parking-sr-only"> for {area.name}</span>
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}
