import { useState } from 'react'
import './ParkingLocationVisual.css'

export const PARKING_PHOTOS = {
  aerial: {
    src: '/images/parking-aerial.jpg',
    author: 'Erik Mclean',
    url: 'https://www.pexels.com/photo/aerial-view-of-cars-on-the-parking-lot-9083321/',
  },
  garage: {
    src: '/images/parking-garage.jpg',
    author: 'Anastasiya Badun',
    url: 'https://www.pexels.com/photo/view-of-cars-parked-in-a-garage-16551615/',
  },
  outdoor: {
    src: '/images/parking-outdoor.jpg',
    author: 'White Noiise',
    url: 'https://www.pexels.com/photo/aerial-view-of-organized-parking-lot-with-cars-28958898/',
  },
}
export default function ParkingLocationVisual({ area = {}, eager = false }) {
  const [failedSource, setFailedSource] = useState('')
  const photo = PARKING_PHOTOS[area.imageKey] || PARKING_PHOTOS.outdoor
  const src = area.photoUrl || photo.src
  const failed = failedSource === src
  return (
    <figure className="parking-location-visual">
      {failed ? (
        <div className="photo-fallback" role="img" aria-label="Parking illustration">
          <span>P</span>
          <i />
          <i />
          <i />
        </div>
      ) : (
        <img
          src={src}
          alt="Representative parking scene, not a photo of this location"
          width="800"
          height="540"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSource(src)}
        />
      )}
      <figcaption>
        {failed
          ? 'Original parking illustration'
          : area.photoUrl
            ? 'Local preview photo'
            : 'Representative photo'}
      </figcaption>
    </figure>
  )
}
