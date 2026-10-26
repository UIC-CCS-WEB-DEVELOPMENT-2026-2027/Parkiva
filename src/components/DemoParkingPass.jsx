import { getDemoStorage, isDemoStorageEvent } from './demoAccounts'
import { useEffect, useId, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { DEMO_NOTICE, DEMO_RESERVATIONS_KEY, demoReservationStatus, readDemoReservations } from './demoReservations'
import { demoPassToken, verifyDemoPass } from './demoPassVerification.js'
import './DemoParkingPass.css'

export default function DemoParkingPass({ reference, revision }) {
  const id = useId()
  const [record, setRecord] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [tokenInput, setTokenInput] = useState('')
  const [saving, setSaving] = useState(false)
  const busyRef = useRef(false)
  const [now, setNow] = useState(() => new Date())

  function refresh() {
    try {
      const matches = readDemoReservations(getDemoStorage()).filter((item) => item.reference === reference)
      if (matches.length !== 1) throw new Error('Not found')
      demoPassToken(reference)
      setRecord(matches[0])
      setLoadError('')
    } catch {
      setRecord(null)
      setLoadError('This demo pass cannot be loaded. Its reservation may be missing, invalid, or unavailable in this browser. Stored data has not been changed.')
    }
    setNow(new Date())
  }

  useEffect(() => {
    refresh()
    try { setTokenInput(demoPassToken(reference)) } catch { setTokenInput('') }
    setFeedback(null)
    const sync = (event) => { if (isDemoStorageEvent(event.key, DEMO_RESERVATIONS_KEY)) { setFeedback(null); refresh() } }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', refresh)
    const interval = window.setInterval(refresh, 30000)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', refresh); window.clearInterval(interval) }
  }, [reference, revision])

  async function verify(action) {
    if (busyRef.current) return
    busyRef.current = true
    setSaving(true)
    setFeedback(null)
    const result = await verifyDemoPass(tokenInput, action, { expectedReference: reference })
    refresh()
    setFeedback(result)
    setSaving(false)
    busyRef.current = false
  }

  const status = record ? demoReservationStatus(record, now) : ''
  const finished = Boolean(record?.pass?.exitedAt)
  const blocked = !record || status === 'Cancelled' || finished

  return (
    <section className="demo-parking-pass" aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`}>Demo parking pass</h3>
      <p className="demo-pass-warning">{DEMO_NOTICE}</p>
      <p>Frontend demonstration only — not secure or real-world access control. Anyone can edit browser data. Scanning this QR does not grant parking access.</p>
      {loadError && <p className="demo-pass-error" role="alert">{loadError}</p>}
      {record && <>
        <dl>
          <div><dt>Demo reference</dt><dd>{record.reference}</dd></div>
          <div><dt>Parking facility</dt><dd>{record.facility.name}</dd></div>
          <div><dt>Slot</dt><dd>{record.slot.id} ({record.slot.vehicle})</dd></div>
          <div><dt>Vehicle</dt><dd>{record.vehicle.type} — {record.vehicle.plate}</dd></div>
          <div><dt>Date</dt><dd>{record.dateTime.date}</dd></div>
          <div><dt>Time (local)</dt><dd>{record.dateTime.arrival}–{record.dateTime.departure}</dd></div>
          <div><dt>Reservation status</dt><dd>{status}</dd></div>
          <div><dt>Pass state</dt><dd>{finished ? 'Simulated exit recorded' : record.pass?.enteredAt ? 'Simulated entry recorded' : 'No simulated entry recorded'}</dd></div>
          {record.pass?.enteredAt && <div><dt>Demo entry</dt><dd>{new Date(record.pass.enteredAt).toLocaleString()}</dd></div>}
          {record.pass?.exitedAt && <div><dt>Demo exit</dt><dd>{new Date(record.pass.exitedAt).toLocaleString()}</dd></div>}
        </dl>
        {!blocked && <div className="demo-pass-qr">
          <QRCodeSVG value={demoPassToken(reference)} size={200} marginSize={4} level="M" role="img" aria-label="QR code containing only the demo pass reference" />
          <p>QR contents (demo reference only):</p><code>{demoPassToken(reference)}</code>
        </div>}
        {status === 'Cancelled' && <p>This reservation is cancelled. No usable demo QR or verification is available.</p>}
        {finished && <p>This demo pass has already completed simulated entry and exit.</p>}
        {status === 'Completed' && !record.pass?.enteredAt && <p>This demo pass has expired for entry.</p>}
        {!blocked && <>
          <p>Entry uses your local clock and is allowed only between the scheduled arrival and departure. Exit requires a recorded demo entry; late exits are allowed.</p>
          <label htmlFor={`${id}-token`}>Demo token to verify (paste QR contents)</label>
          <input id={`${id}-token`} type="text" value={tokenInput} disabled={saving} onChange={(event) => { setTokenInput(event.target.value); setFeedback(null) }} />
          <div className="demo-pass-actions">
            <button type="button" disabled={saving || status === 'Completed' || Boolean(record.pass?.enteredAt)} onClick={() => verify('entry')}>Simulate entry</button>
            <button type="button" disabled={saving || !record.pass?.enteredAt} onClick={() => verify('exit')}>Simulate exit</button>
          </div>
        </>}
      </>}
      <button type="button" disabled={saving} onClick={() => { setFeedback(null); refresh() }}>Refresh demo pass</button>
      {feedback && <p className={feedback.ok ? '' : 'demo-pass-error'} role={feedback.ok ? 'status' : 'alert'}>{feedback.ok ? feedback.message : feedback.error}</p>}
    </section>
  )
}
