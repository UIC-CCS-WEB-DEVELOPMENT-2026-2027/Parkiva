import './ParkingDemoIllustration.css'

const layouts = {
  'sample-courtyard': { label: 'Open courtyard', variant: 'courtyard' },
  'demo-arcade': { label: 'Covered bays', variant: 'covered' },
  'example-lane': { label: 'Motorcycle bays', variant: 'motorcycles' },
  'demo-square': { label: 'Open square', variant: 'square' },
}

export default function ParkingDemoIllustration({ facilityId }) {
  const layout = layouts[facilityId] || layouts['sample-courtyard']
  return (
    <figure className={`parking-demo-visual parking-demo-visual--${layout.variant}`}>
      <div className="parking-demo-scene" aria-hidden="true">
        <div className="parking-demo-scene-heading"><span className="parking-demo-sign">P</span><span>{layout.label}</span></div>
        <div className="parking-demo-bays">
          {Array.from({ length: 6 }, (_, index) => <span className="parking-demo-bay" key={index}>
            {[0, 2, 5].includes(index) && <span className="parking-demo-vehicle" />}
          </span>)}
        </div>
        <div className="parking-demo-lane"><span>Entrance</span><span>→</span></div>
      </div>
      <figcaption>Demo illustration · not a live slot map</figcaption>
    </figure>
  )
}
