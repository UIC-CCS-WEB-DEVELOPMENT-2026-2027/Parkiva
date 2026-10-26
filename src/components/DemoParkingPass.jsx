import { getDemoStorage, isDemoStorageEvent } from './demoAccounts'
import { useEffect, useId, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  DEMO_RESERVATIONS_KEY,
  demoReservationStatus,
  readDemoReservations,
} from './demoReservations'
import { demoPassToken, verifyDemoPass } from './demoPassVerification.js'
import { DEMO_DATA_EVENT } from './mockSlotState'
import Icon from './Icon'
import './DemoParkingPass.css'

export default function DemoParkingPass({ reference, revision }) {
  const id = useId()
  const [record, setRecord] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [tokenInput, setTokenInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [copyNotice, setCopyNotice] = useState('')
  const busy = useRef(false)
  const [now, setNow] = useState(() => new Date())
  function refresh() {
    try {
      const matches = readDemoReservations(getDemoStorage()).filter(
        (item) => item.reference === reference,
      )
      if (matches.length !== 1) throw Error('Not found')
      demoPassToken(reference)
      setRecord(matches[0])
      setLoadError('')
    } catch {
      setRecord(null)
      setLoadError(
        'This pass cannot be loaded. The reservation may be missing or invalid in this browser. Existing storage was kept.',
      )
    }
    setNow(new Date())
  }
  useEffect(() => {
    refresh()
    try {
      setTokenInput(demoPassToken(reference))
    } catch {
      setTokenInput('')
    }
    setFeedback(null)
    const sync = (event) => {
      if (isDemoStorageEvent(event.key, DEMO_RESERVATIONS_KEY)) refresh()
    }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refresh)
    window.addEventListener(DEMO_DATA_EVENT, refresh)
    const interval = window.setInterval(refresh, 30000)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', refresh)
      window.removeEventListener(DEMO_DATA_EVENT, refresh)
      window.clearInterval(interval)
    }
  }, [reference, revision])
  async function verify(action) {
    if (busy.current) return
    busy.current = true
    setSaving(true)
    setFeedback(null)
    const result = await verifyDemoPass(tokenInput, action, { expectedReference: reference })
    refresh()
    setFeedback(result)
    setSaving(false)
    busy.current = false
  }
  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference)
      setCopyNotice(
        'Reference copied. Switch to the Host demo account to verify it in this browser.',
      )
    } catch {
      setCopyNotice('Copy is unavailable. Select and copy the reference shown above.')
    }
  }
  const status = record ? demoReservationStatus(record, now) : ''
  const finished = Boolean(record?.pass?.exitedAt)
  const expired = status === 'Completed' && !record?.pass?.enteredAt
  const blocked = !record || status === 'Cancelled' || finished || expired
  return (
    <section className="demo-parking-pass" aria-labelledby={id + '-heading'}>
      <header className="pass-header">
        <div>
          <Icon name="qr" size={22} />
          <h3 id={id + '-heading'}>Your parking pass</h3>
        </div>
        <span>Preview pass</span>
      </header>
      {loadError && (
        <p className="demo-pass-error" role="alert">
          {loadError}
        </p>
      )}
      {record && (
        <div className="pass-body">
          <span className="reservation-history-status">{status}</span>
          <h4>{record.facility.name}</h4>
          <p className="pass-address">{record.facility.location}</p>
          <div className="pass-main">
            {!blocked ? (
              <div className="demo-pass-qr">
                <QRCodeSVG
                  value={demoPassToken(reference)}
                  size={200}
                  marginSize={4}
                  level="M"
                  role="img"
                  aria-label="QR code containing only the demo pass reference"
                />
                <small>Present in the host’s same-browser preview</small>
              </div>
            ) : (
              <div className="pass-unavailable">
                <Icon name="qr" size={35} />
                <p>
                  {status === 'Cancelled'
                    ? 'This reservation was cancelled.'
                    : finished
                      ? 'Visit completed. This pass has been used.'
                      : 'This pass has expired for entry.'}
                </p>
              </div>
            )}
            <dl>
              <div>
                <dt>Bay</dt>
                <dd>
                  {record.slot.id} · {record.slot.vehicle}
                </dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>{record.vehicle.plate}</dd>
              </div>
              {record.vehicle.model && (
                <div>
                  <dt>Make / model</dt>
                  <dd>{record.vehicle.model}</dd>
                </div>
              )}
              <div>
                <dt>Date</dt>
                <dd>{record.dateTime.date}</dd>
              </div>
              <div>
                <dt>Visit time (local)</dt>
                <dd>
                  {record.dateTime.arrival}–{record.dateTime.departure}
                </dd>
              </div>
            </dl>
          </div>
          <div className="pass-reference">
            <span>Reservation reference</span>
            <code>{reference}</code>
            <button className="text-button" onClick={copyReference}>
              Copy reference
            </button>
          </div>
          {copyNotice && <p role="status">{copyNotice}</p>}
          {(record.pass?.enteredAt || record.pass?.exitedAt) && (
            <p className="pass-timestamps">
              {record.pass.enteredAt &&
                'Checked in: ' + new Date(record.pass.enteredAt).toLocaleString()}
              {record.pass.exitedAt &&
                ' · Checked out: ' + new Date(record.pass.exitedAt).toLocaleString()}
            </p>
          )}
          <p className="pass-disclosure">
            Preview only. This QR is a browser-local reference, not secure verification or
            permission to park. No actual parking reservation was created.
          </p>
          {!blocked && (
            <details className="pass-practice">
              <summary>Practice verification on this pass</summary>
              <p>
                Entry is allowed within the selected visit window. Exit releases the bay after a
                recorded entry. The host workspace can also verify this reference from another demo
                account in this browser.
              </p>
              <label htmlFor={id + '-token'}>Demo token to verify (paste QR contents)</label>
              <input
                id={id + '-token'}
                type="text"
                value={tokenInput}
                disabled={saving}
                onChange={(e) => {
                  setTokenInput(e.target.value)
                  setFeedback(null)
                }}
              />
              <div className="demo-pass-actions">
                <button
                  className="button"
                  disabled={saving || Boolean(record.pass?.enteredAt)}
                  onClick={() => verify('entry')}
                >
                  Simulate entry
                </button>
                <button
                  className="button"
                  disabled={saving || !record.pass?.enteredAt}
                  onClick={() => verify('exit')}
                >
                  Simulate exit
                </button>
              </div>
            </details>
          )}
        </div>
      )}
      <div className="pass-footer">
        <button
          className="text-button"
          disabled={saving}
          onClick={() => {
            setFeedback(null)
            refresh()
          }}
        >
          Refresh demo pass
        </button>
        {feedback && (
          <p
            className={feedback.ok ? 'success-message' : 'demo-pass-error'}
            role={feedback.ok ? 'status' : 'alert'}
          >
            {feedback.ok ? feedback.message : feedback.error}
          </p>
        )}
      </div>
    </section>
  )
}
