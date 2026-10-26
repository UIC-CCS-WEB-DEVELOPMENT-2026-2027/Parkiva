import { useId, useRef, useState } from 'react'
import { DEMO_PASSWORD, validateDemoAuth } from './demoAuthValidation'
import './DemoAuthForm.css'

export default function DemoAuthForm({ mode, onSwitch, onComplete, onBrowse }) {
  const id = useId()
  const formRef = useRef(null)
  const [value, setValue] = useState({ name: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const registering = mode === 'register'
  const errors = submitted ? validateDemoAuth(value, mode) : {}

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    const validation = validateDemoAuth(value, mode)
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) {
      formRef.current.elements.namedItem(firstInvalid)?.focus()
      return
    }
    // Only a display name enters the in-memory session. No credentials are saved.
    const displayName = registering ? value.name.trim() : 'Demo Guest'
    setValue({ name: '', email: '' })
    onComplete({ displayName })
  }

  return (
    <section className="demo-auth" aria-labelledby="demo-auth-heading">
      <h1 id="demo-auth-heading" tabIndex={-1}>{registering ? 'Demo registration' : 'Demo login'}</h1>
      <p className="demo-auth-notice">Simulation only — no secure authentication or real account is created. Do not enter real credentials.</p>
      <p>Use an example email. The sample password is provided and cannot be edited, so this form never collects a password. {registering ? 'Registration' : 'Login'} only starts a temporary demo session that ends on refresh.</p>
      <form ref={formRef} noValidate autoComplete="off" onSubmit={submit} aria-label={registering ? 'Demo registration' : 'Demo login'}>
        {registering && <div className="demo-auth-field">
          <label htmlFor={`${id}-name`}>Demo display name</label>
          <input id={`${id}-name`} name="name" type="text" required maxLength={60} value={value.name} placeholder="Demo Driver"
            onChange={(event) => setValue({ ...value, name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
          {errors.name && <p id={`${id}-name-error`} className="demo-auth-error">{errors.name}</p>}
        </div>}
        <div className="demo-auth-field">
          <label htmlFor={`${id}-email`}>Example email address</label>
          <input id={`${id}-email`} name="email" type="email" required value={value.email} placeholder="guest@example.test"
            onChange={(event) => setValue({ ...value, email: event.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} />
          {errors.email && <p id={`${id}-email-error`} className="demo-auth-error">{errors.email}</p>}
        </div>
        <div className="demo-auth-field">
          <label htmlFor={`${id}-password`}>Sample demo password (read only)</label>
          <div className="demo-auth-password">
            <input id={`${id}-password`} type={showPassword ? 'text' : 'password'} value={DEMO_PASSWORD} readOnly autoComplete="off" aria-describedby={`${id}-password-help`} />
            <button type="button" aria-controls={`${id}-password`} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide password' : 'Show password'}</button>
          </div>
          <p id={`${id}-password-help`}>A fixed sample for previewing the form. No password is checked, transmitted, or stored.</p>
        </div>
        {Object.keys(errors).length > 0 && <p className="demo-auth-error" role="alert">Check the highlighted fields to start the simulation.</p>}
        <button className="demo-auth-submit" type="submit">{registering ? 'Register (demo)' : 'Log In (demo)'}</button>
      </form>
      <div className="demo-auth-actions">
        <button type="button" onClick={() => onSwitch(registering ? 'login' : 'register')}>{registering ? 'Go to demo login' : 'Go to demo registration'}</button>
        <button type="button" onClick={onBrowse}>Continue browsing as guest</button>
      </div>
      <p>Demo reservations stay local to this browser and are not securely linked to any account or demo session.</p>
    </section>
  )
}
