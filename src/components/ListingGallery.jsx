import { useState } from 'react'
import ParkingLocationVisual, { PARKING_PHOTOS } from './ParkingLocationVisual'

export default function ListingGallery({ area }) {
  const keys = [
    area.imageKey || 'outdoor',
    ...Object.keys(PARKING_PHOTOS).filter((key) => key !== area.imageKey),
  ]
  const [selected, setSelected] = useState(keys[0])
  const photo = PARKING_PHOTOS[selected]
  return (
    <div className="listing-gallery">
      <ParkingLocationVisual
        area={{
          ...area,
          imageKey: selected,
          photoUrl: selected === 'upload' ? area.photoUrl : undefined,
        }}
        eager
      />
      <div className="gallery-thumbnails" aria-label="Representative photo gallery">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={`Show representative ${key} photo`}
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
          >
            <img src={PARKING_PHOTOS[key].src} alt="" loading="lazy" width="100" height="68" />
          </button>
        ))}
        {area.photoUrl && (
          <button
            type="button"
            aria-label="Show local upload"
            aria-pressed={selected === 'upload'}
            onClick={() => setSelected('upload')}
          >
            <img src={area.photoUrl} alt="" width="100" height="68" />
          </button>
        )}
      </div>
      <p className="photo-credit">
        {selected === 'upload' ? (
          'Local upload · fictional listing · this tab only'
        ) : (
          <>
            Representative photo by{' '}
            <a href={photo.url} target="_blank" rel="noreferrer">
              {photo.author} / Pexels
            </a>
            . This does not show{' '}
            {area.verifiedLocation ? 'the listed facility' : 'an actual offered property'}.
          </>
        )}
      </p>
    </div>
  )
}
