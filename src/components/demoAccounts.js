// Public sample credentials for a frontend exercise, not secrets or authentication.
export const DEMO_SESSION_KEY = 'parkiva-demo-account-v1'
export const DEMO_ACCOUNTS = [
  { id: 'driver-demo', email: 'driver@parkiva.demo', password: 'DriverDemo123!', role: 'Driver' },
  { id: 'operator-demo', email: 'operator@parkiva.demo', password: 'OperatorDemo123!', role: 'Parking Operator' },
]
export const OPERATOR_DEMO_FACILITIES = ['davao-aldevinco-parking', 'davao-sm-city-parking', 'davao-sm-lanang-parking']
export const DEMO_ACCOUNT_EVENT = 'parkiva-demo-account-changed'

export function demoAccount(id) { return DEMO_ACCOUNTS.find((account) => account.id === id) ?? null }
export function readDemoAccountId(storage) {
  try {
    const session = JSON.parse(storage.getItem(DEMO_SESSION_KEY))
    return demoAccount(session?.accountId)?.id ?? null
  } catch { return null }
}
export function validateRoleLogin(value) {
  const errors = {}
  if (!value.email.trim()) errors.email = 'Enter the demo account email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Enter a valid demo email address.'
  if (!value.password) errors.password = 'Enter the public demo password.'
  const account = DEMO_ACCOUNTS.find((item) => item.email === value.email.trim().toLowerCase() && item.password === value.password)
  if (!Object.keys(errors).length && !account) errors.password = 'Demo email or password does not match. Use one of the two sample accounts below.'
  return { errors, account: Object.keys(errors).length ? null : account }
}
export function canManageDemoFacility(accountId, facilityId) {
  return accountId === 'operator-demo' && OPERATOR_DEMO_FACILITIES.includes(facilityId)
}
const scopedKeys = ['parkiva-demo-reservations-v1', 'parkiva-mock-slot-statuses-v1', 'parkiva-saved-parking-ids']
export function getDemoStorage(storage = globalThis.localStorage, accountId = readDemoAccountId(storage)) {
  const id = demoAccount(accountId)?.id ?? null
  const keyFor = (key) => id && scopedKeys.includes(key) ? `${key}:${id}` : key
  return {
    accountId: id,
    getItem: (key) => storage.getItem(keyFor(key)),
    setItem: (key, value) => storage.setItem(keyFor(key), value),
    removeItem: (key) => storage.removeItem(keyFor(key)),
  }
}
export function isDemoStorageEvent(key, baseKey) {
  return key === null || key === baseKey || key?.startsWith(`${baseKey}:`)
}
