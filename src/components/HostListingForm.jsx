import { useRef, useState } from 'react'
import { AMENITIES, DEFAULT_RULES, NEIGHBORHOODS } from './marketplaceData'
import { saveHostListing, validateHostListing } from './hostListings'
import { useMockParking } from './MockParkingContext'
import Icon from './Icon'

const initial = {
  name: '',
  location: '',
  neighborhood: '',
  demoDescription: '',
  hostName: 'Maria Santos',
  hostKind: 'Private space',
  vehicles: ['Car'],
  capacity: 4,
  parkingType: 'Open-air',
  hourlyRate: 25,
  amenities: ['Marked bays'],
  access: '',
  demoHours: { open: '06:00', close: '22:00' },
  rules: DEFAULT_RULES,
}
export default function HostListingForm({ area, onCancel, onSaved }) {
  const { slotCatalog, setPreviewPhoto } = useMockParking()
  const [value, setValue] = useState(
    area ? { ...area, capacity: slotCatalog[area.id].length } : initial,
  )
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const form = useRef(null)
  const busy = useRef(false)
  const set = (key, val) => setValue((previous) => ({ ...previous, [key]: val }))
  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    const issues = validateHostListing(value)
    setErrors(issues)
    setError('')
    if (Object.keys(issues).length) {
      form.current.querySelector('[name="' + Object.keys(issues)[0] + '"]')?.focus()
      return
    }
    if (fileError) {
      setError(fileError)
      return
    }
    busy.current = true
    setSaving(true)
    const result = await saveHostListing(value, {
      slotCount: area ? slotCatalog[area.id].length : undefined,
    })
    if (result.ok) {
      if (file) setPreviewPhoto(result.id, file)
      onSaved(result.id)
    } else {
      setErrors(result.errors || {})
      setError(result.error)
    }
    setSaving(false)
    busy.current = false
  }
  const input = (key, label, options = {}) => (
    <div className="host-form-field">
      <label htmlFor={'host-' + key}>{label}</label>
      <input
        id={'host-' + key}
        name={key}
        value={value[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? 'host-' + key + '-error' : undefined}
        {...options}
      />
      {errors[key] && (
        <p className="form-error" id={'host-' + key + '-error'}>
          {errors[key]}
        </p>
      )}
    </div>
  )
  const textarea = (key, label) => (
    <div className="host-form-field wide">
      <label htmlFor={'host-' + key}>{label}</label>
      <textarea
        id={'host-' + key}
        name={key}
        rows="3"
        value={value[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
      />
      {errors[key] && <p className="form-error">{errors[key]}</p>}
    </div>
  )
  return (
    <section className="host-listing-editor" aria-labelledby="host-listing-heading">
      <div className="section-title">
        <div>
          <p className="eyebrow">MAKE A LITTLE ROOM</p>
          <h2 id="host-listing-heading">
            {area ? 'Edit your preview listing' : 'Tell drivers about your space'}
          </h2>
        </div>
        <button className="text-button" onClick={onCancel}>
          Cancel editing
        </button>
      </div>
      <p>
        List a fictional space with a fictional host. This creates browser-local preview inventory,
        never a real parking offer.
      </p>
      {area?.verifiedLocation && (
        <p className="inline-notice">
          The real facility’s name, address and ownership remain factual. You can edit the simulated
          inventory only; this account has no relationship with the real business.
        </p>
      )}
      <form ref={form} onSubmit={submit} noValidate aria-label="Host listing form">
        <fieldset disabled={saving}>
          <div className="host-form-grid">
            {input('name', 'Listing title', {
              required: true,
              maxLength: 100,
              disabled: area?.verifiedLocation,
            })}
            <div className="host-form-field">
              <label htmlFor="host-neighborhood">Neighborhood</label>
              <select
                id="host-neighborhood"
                name="neighborhood"
                value={value.neighborhood}
                disabled={area?.verifiedLocation}
                onChange={(e) => set('neighborhood', e.target.value)}
              >
                <option value="">Choose an area</option>
                {NEIGHBORHOODS.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
              {errors.neighborhood && <p className="form-error">{errors.neighborhood}</p>}
            </div>
            {input('location', 'Parking address (fictional for new listings)', {
              required: true,
              maxLength: 240,
              disabled: area?.verifiedLocation,
            })}
            {input('hostName', 'Host display name (fictional)', {
              required: true,
              maxLength: 60,
              disabled: area?.verifiedLocation,
            })}
            {textarea('demoDescription', 'Describe your space')}
            <div className="host-form-field">
              <label htmlFor="host-kind">Listing category</label>
              <select
                id="host-kind"
                value={value.hostKind}
                disabled={area?.verifiedLocation}
                onChange={(e) => set('hostKind', e.target.value)}
              >
                {[
                  'Private space',
                  'Independent lot',
                  'Business parking',
                  ...(area?.verifiedLocation ? ['Location preview'] : []),
                ].map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </div>
            <div className="host-form-field">
              <label htmlFor="host-parkingType">Parking type</label>
              <select
                id="host-parkingType"
                value={value.parkingType}
                onChange={(e) => set('parkingType', e.target.value)}
              >
                <option>Open-air</option>
                <option>Covered</option>
              </select>
            </div>
            {input('capacity', 'Number of simulated spaces', {
              type: 'number',
              min: 1,
              max: 30,
              required: true,
              disabled: Boolean(area),
            })}
            {input('hourlyRate', 'Simulated hourly price (₱)', {
              type: 'number',
              min: 1,
              max: 1000,
              step: 1,
              required: true,
            })}
            <div className="host-form-field wide">
              <fieldset className="host-checkboxes">
                <legend>Supported vehicles</legend>
                {['Car', 'Motorcycle'].map((type) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      name="vehicles"
                      checked={value.vehicles.includes(type)}
                      disabled={Boolean(area)}
                      onChange={(e) =>
                        set(
                          'vehicles',
                          e.target.checked
                            ? [...value.vehicles, type]
                            : value.vehicles.filter((item) => item !== type),
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </fieldset>
              {errors.vehicles && <p className="form-error">{errors.vehicles}</p>}
              {area && (
                <p className="field-help">
                  Existing bay counts and vehicle types stay fixed to preserve saved passes.
                </p>
              )}
            </div>
            <div className="host-form-field">
              <label htmlFor="host-opening">Preview opening time</label>
              <input
                id="host-opening"
                name="demoHours"
                type="time"
                value={value.demoHours.open}
                onChange={(e) => set('demoHours', { ...value.demoHours, open: e.target.value })}
              />
            </div>
            <div className="host-form-field">
              <label htmlFor="host-closing">Preview closing time</label>
              <input
                id="host-closing"
                type="time"
                value={value.demoHours.close}
                onChange={(e) => set('demoHours', { ...value.demoHours, close: e.target.value })}
              />
              {errors.demoHours && <p className="form-error">{errors.demoHours}</p>}
            </div>
            <div className="host-form-field wide">
              <fieldset className="host-checkboxes">
                <legend>Amenities (simulated)</legend>
                {AMENITIES.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={value.amenities.includes(item)}
                      onChange={(e) =>
                        set(
                          'amenities',
                          e.target.checked
                            ? [...value.amenities, item]
                            : value.amenities.filter((v) => v !== item),
                        )
                      }
                    />
                    {item}
                  </label>
                ))}
              </fieldset>
            </div>
            {textarea('access', 'Entrance instructions')}
            <div className="host-form-field wide">
              <label htmlFor="host-rules">Parking rules (one per line)</label>
              <textarea
                id="host-rules"
                rows="3"
                value={value.rules.join('\n')}
                maxLength={1500}
                onChange={(e) => set('rules', e.target.value.split('\n').slice(0, 10))}
              />
            </div>
            <div className="host-form-field wide">
              <label htmlFor="host-photo">Preview photograph (optional)</label>
              <input
                id="host-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const next = e.target.files[0]
                  setFile(null)
                  setFileError('')
                  if (!next) return
                  if (
                    !['image/jpeg', 'image/png', 'image/webp'].includes(next.type) ||
                    next.size > 2 * 1024 * 1024
                  ) {
                    setFileError('Use a JPG, PNG or WebP up to 2 MB.')
                    return
                  }
                  setFile(next)
                }}
              />
              <p className="field-help">
                Use only a photo you own or have permission to use. It is shown in this tab only and
                removed on refresh or logout. Photos are never stored in localStorage.
              </p>
              {file && <p className="field-help">{file.name} selected for this tab.</p>}
              {fileError && <p className="form-error">{fileError}</p>}
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="host-form-actions">
            <button className="button" type="button" onClick={onCancel}>
              Cancel editing
            </button>
            <button className="button primary" type="submit">
              {saving ? 'Saving…' : area ? 'Save listing changes' : 'Publish preview listing'}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}
