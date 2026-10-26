export const DEMO_PASSWORD = 'parkiva-demo'

export function validateDemoAuth(value, mode) {
  const errors = {}
  if (mode === 'register' && !value.name.trim()) errors.name = 'Enter a demo display name.'
  if (!value.email.trim()) errors.email = 'Enter an example email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Enter a valid example email address, such as guest@example.test.'
  return errors
}
