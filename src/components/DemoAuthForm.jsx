import { useId, useRef, useState } from 'react'
import { DEMO_ACCOUNTS, validateRoleLogin } from './demoAccounts'
import { validateDemoAuth } from './demoAuthValidation'
import './DemoAuthForm.css'

export default function DemoAuthForm({ mode, onSwitch, onComplete, onBrowse }) {
  const id = useId()
  const formRef = useRef(null)
  const [value, setValue] = useState({ name: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const registering = mode === 'register'
  function validate() {
    return { ...(registering ? validateDemoAuth(value, 'register') : {}), ...validateRoleLogin(value).errors }
  }
  const errors = submitted ? validate() : {}
  function quickFill(account) {
    setValue({ name: `Demo ${account.role}`, email: account.email, password: account.password })
    setSelectedId(account.id)
    setSubmitted(false)
    setShowPassword(false)
  }
  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    const validation = validate()
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) { formRef.current.elements.namedItem(firstInvalid)?.focus(); return }
    const account = validateRoleLogin(value).account
    if (onComplete(account.id)) setValue({ name: '', email: '', password: '' })
  }
  return (
    <section className="demo-auth" aria-labelledby="demo-auth-heading">
      <h1 id="demo-auth-heading" tabIndex={-1}>{registering ? 'Demo registration' : 'Demo account login'}</h1>
      <p className="demo-auth-notice">Simulation only — these are public sample accounts, not secure authentication. Do not enter real credentials.</p>
      <p>{registering ? 'No new account is created. Use one of the two preconfigured roles to explore the registration demonstration.' : 'Choose Driver or Parking Operator to explore a preloaded demo workspace.'} Only a demo account identifier is saved for the session; passwords are never persisted.</p>
      <div className="demo-account-options" aria-label="Public demo accounts">
        {DEMO_ACCOUNTS.map((account) => <article key={account.id}>
          <h2>{account.role}</h2><p>{account.email}</p><p>Sample password: <code>{account.password}</code></p>
          <button type="button" aria-pressed={selectedId === account.id} onClick={() => quickFill(account)}>Quick-fill {account.role}</button>
        </article>)}
      </div>
      <form ref={formRef} noValidate autoComplete="off" onSubmit={submit} aria-label={registering ? 'Demo registration' : 'Demo login'}>
        {registering && <div className="demo-auth-field">
          <label htmlFor={`${id}-name`}>Demo display name</label>
          <input id={`${id}-name`} name="name" type="text" required maxLength={60} value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
          {errors.name && <p id={`${id}-name-error`} className="demo-auth-error">{errors.name}</p>}
        </div>}
        <div className="demo-auth-field">
          <label htmlFor={`${id}-email`}>Demo email address</label>
          <input id={`${id}-email`} name="email" type="email" required value={value.email} autoComplete="off" onChange={(event) => { setSelectedId(''); setValue({ ...value, email: event.target.value }) }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} />
          {errors.email && <p id={`${id}-email-error`} className="demo-auth-error">{errors.email}</p>}
        </div>
        <div className="demo-auth-field">
          <label htmlFor={`${id}-password`}>Demo password</label>
          <div className="demo-auth-password">
            <input id={`${id}-password`} name="password" type={showPassword ? 'text' : 'password'} required value={value.password} autoComplete="off" onChange={(event) => setValue({ ...value, password: event.target.value })} aria-invalid={Boolean(errors.password)} aria-describedby={`${id}-password-help${errors.password ? ` ${id}-password-error` : ''}`} />
            <button type="button" aria-controls={`${id}-password`} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide password' : 'Show password'}</button>
          </div>
          <p id={`${id}-password-help`}>Use only the public sample passwords above. This frontend comparison is not real authentication.</p>
          {errors.password && <p id={`${id}-password-error`} className="demo-auth-error">{errors.password}</p>}
        </div>
        {Object.keys(errors).length > 0 && <p className="demo-auth-error" role="alert">Check the highlighted fields.</p>}
        <button className="demo-auth-submit" type="submit">{registering ? 'Try registration demo' : 'Log In (demo)'}</button>
      </form>
      <div className="demo-auth-actions">
        <button type="button" onClick={() => onSwitch(registering ? 'login' : 'register')}>{registering ? 'Go to demo login' : 'Go to demo registration'}</button>
        <button type="button" onClick={onBrowse}>Continue browsing as guest</button>
      </div>
      <p>Workspaces are browser-local demo partitions, not securely account-linked records. Operator assignments imply no ownership or management relationship with real facilities.</p>
    </section>
  )
}