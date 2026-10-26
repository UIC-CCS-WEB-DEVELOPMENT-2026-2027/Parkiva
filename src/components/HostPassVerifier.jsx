import { useEffect, useRef, useState } from 'react'
import {
  demoPassToken,
  lookupHostDemoPass,
  normalizeDemoPassInput,
  verifyDemoPass,
} from './demoPassVerification'
import { demoReservationStatus } from './demoReservations'
import { useMockParking } from './MockParkingContext'
import Icon from './Icon'

export default function HostPassVerifier() {
  const { refresh } = useMockParking()
  const [value, setValue] = useState('')
  const [record, setRecord] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [camera, setCamera] = useState(false)
  const [cameraNotice, setCameraNotice] = useState('')
  const video = useRef(null)
  const stream = useRef(null)
  const cameraRun = useRef(0)
  const busy = useRef(false)
  function stopCamera() {
    cameraRun.current += 1
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
    if (video.current) video.current.srcObject = null
    setCamera(false)
  }
  useEffect(
    () => () => {
      cameraRun.current += 1
      stream.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )
  function lookup(input = value) {
    setError('')
    setMessage('')
    setRecord(null)
    try {
      const next = lookupHostDemoPass(input).record
      setRecord(next)
      setValue(next.reference)
    } catch (err) {
      setError(err.message || 'The pass could not be read. Check browser storage and try again.')
    }
  }
  async function startCamera() {
    stopCamera()
    setCameraNotice('')
    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia ||
      !window.BarcodeDetector
    ) {
      setCameraNotice(
        'Camera QR scanning is not supported in this browser. Enter the pass reference below instead.',
      )
      return
    }
    const run = ++cameraRun.current
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats()
      if (run !== cameraRun.current) return
      if (!formats.includes('qr_code'))
        throw Error('QR decoding is unavailable. Use manual reference entry.')
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (run !== cameraRun.current) {
        media.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = media
      setCamera(true)
      video.current.srcObject = media
      await video.current.play()
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      async function scan() {
        if (run !== cameraRun.current) return
        try {
          const codes = await detector.detect(video.current)
          if (run !== cameraRun.current) return
          if (codes.length) {
            const token = codes[0].rawValue
            stopCamera()
            setValue(token)
            lookup(token)
            setCameraNotice('QR read locally. Review the pass before recording entry or exit.')
            return
          }
        } catch {
          stopCamera()
          setCameraNotice('The camera could not read a QR. Use manual reference entry.')
          return
        }
        window.setTimeout(scan, 300)
      }
      scan()
    } catch (err) {
      if (run === cameraRun.current) {
        stopCamera()
        setCameraNotice(
          err.name === 'NotAllowedError'
            ? 'Camera permission was declined. You can still enter a reference.'
            : err.message || 'Camera unavailable. Enter a reference instead.',
        )
      }
    }
  }
  async function verify(action) {
    if (busy.current) return
    busy.current = true
    setSaving(true)
    setError('')
    setMessage('')
    const reference = normalizeDemoPassInput(value)
    const result = await verifyDemoPass(reference ? demoPassToken(reference) : '', action, {
      host: true,
      expectedReference: record?.reference,
    })
    if (result.ok) {
      setRecord(result.reservation)
      setMessage(
        action === 'entry'
          ? 'Checked in. The simulated bay is now occupied.'
          : 'Checked out. The visit is completed and the simulated bay is released.',
      )
      refresh()
    } else {
      setError(result.error)
      try {
        setRecord(lookupHostDemoPass(value).record)
      } catch {
        setRecord(null)
      }
    }
    setSaving(false)
    busy.current = false
  }
  const status = record ? demoReservationStatus(record) : ''
  return (
    <section className="host-verifier" aria-labelledby="host-verification-heading">
      <div className="section-title">
        <div>
          <p className="eyebrow">WELCOME DRIVERS</p>
          <h2 id="host-verification-heading">Scan. Review. Let the visit begin.</h2>
        </div>
      </div>
      <p className="verification-disclosure">
        Frontend simulation on this browser only. This is not secure access control, cross-device
        verification, or permission to enter a real facility.
      </p>
      <div className="verification-grid">
        <div className="verification-input">
          <div className="camera-panel">
            <video
              ref={video}
              autoPlay
              muted
              playsInline
              hidden={!camera}
              aria-label="Local QR camera preview"
            />
            {!camera && (
              <>
                <Icon name="scan" size={48} />
                <p>Scan a driver’s Parkiva pass</p>
                <small>Camera opens only when you choose to start it.</small>
              </>
            )}
            <button className="button" type="button" onClick={camera ? stopCamera : startCamera}>
              {camera ? 'Stop camera' : 'Start camera'}
            </button>
          </div>
          {cameraNotice && (
            <p role="status" className="inline-notice">
              {cameraNotice}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              stopCamera()
              lookup()
            }}
          >
            <label htmlFor="host-pass-reference">Or enter a reservation reference / QR token</label>
            <input
              id="host-pass-reference"
              type="text"
              value={value}
              placeholder="DEMO-…"
              maxLength={160}
              onChange={(e) => {
                setValue(e.target.value)
                setRecord(null)
                setError('')
                setMessage('')
              }}
            />
            <button className="button primary" type="submit" disabled={saving}>
              Look up pass
              <Icon name="arrow" size={16} />
            </button>
          </form>
        </div>
        <div className="verification-result" aria-live="polite">
          {!record ? (
            <div className="verification-empty">
              <Icon name="car" size={32} />
              <h3>Ready when your driver arrives.</h3>
              <p>
                Find a pass from any demo workspace in this browser. Only assigned preview locations
                can be verified.
              </p>
            </div>
          ) : (
            <>
              <span className="reservation-history-status">{status}</span>
              <h3>{record.facility.name}</h3>
              <dl>
                <div>
                  <dt>Reference</dt>
                  <dd>{record.reference}</dd>
                </div>
                <div>
                  <dt>Bay</dt>
                  <dd>{record.slot.id}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>
                    {record.vehicle.type} · {record.vehicle.plate}
                  </dd>
                </div>
                <div>
                  <dt>Make / model</dt>
                  <dd>{record.vehicle.model || 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Visit</dt>
                  <dd>
                    {record.dateTime.date} · {record.dateTime.arrival}–{record.dateTime.departure}
                  </dd>
                </div>
              </dl>
              <p>
                {record.status === 'cancelled'
                  ? 'Cancelled — this pass cannot be used.'
                  : record.pass?.exitedAt
                    ? 'Completed — this pass has already been used.'
                    : record.pass?.enteredAt
                      ? 'Vehicle is checked in. Record an exit to release the bay.'
                      : status === 'Completed'
                        ? 'Expired — the entry window has ended.'
                        : 'Entry is allowed only within the scheduled visit window.'}
              </p>
              <div className="verification-actions">
                <button
                  className="button primary"
                  disabled={
                    saving ||
                    status === 'Cancelled' ||
                    status === 'Completed' ||
                    Boolean(record.pass?.enteredAt)
                  }
                  onClick={() => verify('entry')}
                >
                  Simulate check-in
                </button>
                <button
                  className="button"
                  disabled={
                    saving ||
                    status === 'Cancelled' ||
                    !record.pass?.enteredAt ||
                    Boolean(record.pass?.exitedAt)
                  }
                  onClick={() => verify('exit')}
                >
                  Simulate check-out
                </button>
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success-message">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
