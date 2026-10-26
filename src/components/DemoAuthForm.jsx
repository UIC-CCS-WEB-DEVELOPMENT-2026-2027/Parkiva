import { useId, useRef, useState } from 'react'
import { DEMO_ACCOUNTS, validateRoleLogin } from './demoAccounts'
import { validateDemoAuth } from './demoAuthValidation'
import Icon from './Icon'
import './DemoAuthForm.css'

export default function DemoAuthForm({
  mode,
  audience = 'driver',
  onSwitch,
  onComplete,
  onBrowse,
  onOtherAudience,
}) {
  const id = useId()
  const formRef = useRef(null)
  const [value, setValue] = useState({ name: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const registering = mode === 'register'
  const host = audience === 'host'
  const sample = DEMO_ACCOUNTS.find(
    (account) => account.id === (host ? 'operator-demo' : 'driver-demo'),
  )
  function validate() {
    const result = validateRoleLogin(value)
    const errors = { ...(registering ? validateDemoAuth(value, 'register') : {}), ...result.errors }
    if (result.account && result.account.id !== sample.id)
      errors.email = host
        ? 'Use a host account here, or switch to driver sign in.'
        : 'Use a driver account here, or switch to host sign in.'
    return errors
  }
  const errors = submitted ? validate() : {}
  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    const issues = validate()
    const firstInvalid = Object.keys(issues)[0]
    if (firstInvalid) {
      formRef.current.elements.namedItem(firstInvalid)?.focus()
      return
    }
    if (onComplete(validateRoleLogin(value).account.id))
      setValue({ name: '', email: '', password: '' })
  }
  return (
    <section className="demo-auth" aria-labelledby="demo-auth-heading">
      <button className="auth-back text-button" onClick={onBrowse}>
        <Icon name="back" size={16} />
        Back to parking
      </button>
      <p className="auth-audience">
        <Icon name={host ? 'roof' : 'car'} size={18} />
        {host ? 'PARKIVA FOR HOSTS' : 'YOUR PARKIVA'}
      </p>
      <h1 id="demo-auth-heading" tabIndex={-1}>
        {registering
          ? host
            ? 'Start hosting.'
            : 'Make room for your next visit.'
          : host
            ? 'Host sign in'
            : 'Welcome back'}
      </h1>
      <p className="auth-intro">
        {registering
          ? 'Explore Parkiva with a sample account.'
          : host
            ? 'Your spaces, bookings and arrivals in one place.'
            : 'Your saved spots and parking passes are right here.'}
      </p>
      <form
        ref={formRef}
        noValidate
        autoComplete="off"
        onSubmit={submit}
        aria-label={registering ? 'Sample registration' : host ? 'Host sign in' : 'Driver sign in'}
      >
        {registering && (
          <div className="demo-auth-field">
            <label htmlFor={id + '-name'}>Display name</label>
            <div className="auth-input">
              <Icon name="user" size={18} />
              <input
                id={id + '-name'}
                name="name"
                type="text"
                required
                maxLength={60}
                value={value.name}
                onChange={(e) => setValue({ ...value, name: e.target.value })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? id + '-name-error' : undefined}
              />
            </div>
            {errors.name && (
              <p className="demo-auth-error" id={id + '-name-error'}>
                {errors.name}
              </p>
            )}
          </div>
        )}
        <div className="demo-auth-field">
          <label htmlFor={id + '-email'}>Email address</label>
          <div className="auth-input">
            <Icon name="mail" size={18} />
            <input
              id={id + '-email'}
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={value.email}
              autoComplete="off"
              onChange={(e) => setValue({ ...value, email: e.target.value })}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? id + '-email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p className="demo-auth-error" id={id + '-email-error'}>
              {errors.email}
            </p>
          )}
        </div>
        <div className="demo-auth-field">
          <label htmlFor={id + '-password'}>Password</label>
          <div className="auth-input">
            <Icon name="lock" size={18} />
            <input
              id={id + '-password'}
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={value.password}
              autoComplete="off"
              onChange={(e) => setValue({ ...value, password: e.target.value })}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? id + '-password-error' : id + '-account-note'}
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls={id + '-password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={19} />
            </button>
          </div>
          {errors.password && (
            <p id={id + '-password-error'} className="demo-auth-error">
              {errors.password}
            </p>
          )}
        </div>
        {Object.keys(errors).length > 0 && (
          <p className="demo-auth-error" role="alert">
            Check the highlighted fields.
          </p>
        )}
        <button className="demo-auth-submit button primary" type="submit">
          {registering ? 'Continue with sample account' : 'Sign in'}
          <Icon name="arrow" size={17} />
        </button>
      </form>
      <p className="auth-register-link">
        {registering ? 'Already tried Parkiva?' : 'New here?'}{' '}
        <button
          className="text-button"
          onClick={() => onSwitch(registering ? 'login' : 'register')}
        >
          {registering ? 'Sign in instead' : 'Get started'}
        </button>
      </p>
      <details className="sample-account-help">
        <summary>Try a sample account</summary>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>
              <code>{sample.email}</code>
            </dd>
          </div>
          <div>
            <dt>Password</dt>
            <dd>
              <code>{sample.password}</code>
            </dd>
          </div>
        </dl>
        <p>
          Public sample credentials.{' '}
          {registering ? 'No account is created.' : 'This is not secure authentication.'}
        </p>
      </details>
      <p id={id + '-account-note'} className="auth-account-note">
        Sample access only. Please use the sample password, not a real one.
      </p>
      <div className="auth-other-role">
        <Icon name={host ? 'car' : 'roof'} size={17} />
        <button className="text-button" onClick={onOtherAudience}>
          {host ? 'Looking for parking? Driver sign in' : 'Have a parking space? Host sign in'}
        </button>
      </div>
    </section>
  )
}
