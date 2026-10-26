import { getDemoStorage, readDemoAccountId, canManageDemoFacility } from './demoAccounts.js'
import {
  DEMO_RESERVATIONS_KEY,
  readDemoReservations,
  readBrowserReservationSources,
} from './demoReservations.js'
import { notifyDemoDataChanged } from './mockSlotState.js'
import { hostCatalog, readHostListings } from './hostListings.js'

const prefix = 'parkiva-demo-pass:v1:'
export function demoPassToken(reference) {
  if (typeof reference !== 'string' || !/^DEMO-[A-Za-z0-9-]{1,120}$/.test(reference))
    throw new Error('Invalid demo reference.')
  return `${prefix}${reference}`
}

export function referenceFromDemoToken(token) {
  if (typeof token !== 'string' || !token.trim().startsWith(prefix)) return null
  const reference = token.trim().slice(prefix.length)
  try {
    return demoPassToken(reference) === token.trim() ? reference : null
  } catch {
    return null
  }
}

export function normalizeDemoPassInput(value) {
  if (typeof value !== 'string') return null
  const reference = referenceFromDemoToken(value) || value.trim()
  try {
    demoPassToken(reference)
    return reference
  } catch {
    return null
  }
}
export function lookupHostDemoPass(value, options = {}) {
  const raw = options.storage ?? globalThis.localStorage
  const accountId = options.accountId ?? readDemoAccountId(raw)
  if (accountId !== 'operator-demo') throw Error('Use the host demo account to verify passes.')
  const reference = normalizeDemoPassInput(value)
  if (!reference) throw Error('Enter a valid DEMO reference or the contents of a Parkiva QR pass.')
  const sources = readBrowserReservationSources(raw)
  const matches = sources
    .flatMap((source) => source.records.map((record) => ({ record, source })))
    .filter(({ record }) => record.reference === reference)
  if (matches.length !== 1) throw Error('Pass not found or reference is ambiguous in this browser.')
  const { record, source } = matches[0]
  const ownedIds = hostCatalog(readHostListings(raw))
    .filter((area) => area.ownerAccountId === 'operator-demo')
    .map((area) => area.id)
  if (!canManageDemoFacility(accountId, record.facility.id, ownedIds))
    throw Error('This pass belongs to a location outside your assigned host preview.')
  return { record, storage: source.storage }
}

export async function verifyDemoPass(token, action, options = {}) {
  try {
    const reference = referenceFromDemoToken(token)
    if (!reference || !['entry', 'exit'].includes(action))
      return { ok: false, error: 'Invalid demo pass token or verification action.' }
    if (options.expectedReference && reference !== options.expectedReference)
      return { ok: false, error: 'This token does not match the displayed demo reservation.' }
    let storage = options.storage ?? getDemoStorage()
    const locks = options.locks ?? globalThis.navigator?.locks
    if (!locks?.request)
      return {
        ok: false,
        error: 'Demo verification requires browser storage and Web Locks. No change was recorded.',
      }
    return await locks.request(DEMO_RESERVATIONS_KEY, () => {
      if (options.host)
        storage = lookupHostDemoPass(token, {
          storage: options.rawStorage ?? globalThis.localStorage,
          accountId: options.accountId,
        }).storage
      const records = readDemoReservations(storage)
      const matches = records.filter((record) => record.reference === reference)
      if (matches.length !== 1)
        return {
          ok: false,
          error: 'Demo reservation not found or reference is ambiguous in this browser.',
        }
      const record = matches[0]
      if (record.status === 'cancelled')
        return { ok: false, error: 'This demo reservation is cancelled. The pass cannot be used.' }
      const now = options.now ?? new Date()
      const arrival = new Date(`${record.dateTime.date}T${record.dateTime.arrival}`)
      const departure = new Date(`${record.dateTime.date}T${record.dateTime.departure}`)
      const pass = record.pass ?? {}
      if (pass.exitedAt)
        return {
          ok: false,
          error: 'Simulated exit was already recorded. This demo pass is finished.',
        }
      if (action === 'entry') {
        if (pass.enteredAt) return { ok: false, error: 'Simulated entry was already recorded.' }
        if (now < arrival)
          return {
            ok: false,
            error: 'This demo pass is not yet within its scheduled arrival time.',
          }
        if (now >= departure) return { ok: false, error: 'This demo pass has expired for entry.' }
        const shared = options.host
          ? readBrowserReservationSources(options.rawStorage ?? globalThis.localStorage).flatMap(
              (source) => source.records,
            )
          : records
        if (
          shared.some(
            (item) =>
              item.reference !== reference &&
              item.facility.id === record.facility.id &&
              item.slot.id === record.slot.id &&
              item.status !== 'cancelled' &&
              item.pass?.enteredAt &&
              !item.pass.exitedAt,
          )
        )
          return {
            ok: false,
            error:
              'Another vehicle is still checked in to this simulated bay. Record its exit first.',
          }
      } else {
        if (!pass.enteredAt)
          return { ok: false, error: 'Record a simulated entry before simulating exit.' }
        if (now < new Date(pass.enteredAt))
          return { ok: false, error: 'The local clock is earlier than the recorded demo entry.' }
      }
      const updated = {
        ...record,
        pass: { ...pass, [action === 'entry' ? 'enteredAt' : 'exitedAt']: now.toISOString() },
      }
      const next = records.map((item) => (item.reference === reference ? updated : item))
      storage.setItem(DEMO_RESERVATIONS_KEY, JSON.stringify({ version: 1, reservations: next }))
      notifyDemoDataChanged()
      return {
        ok: true,
        reservation: updated,
        message: `Simulated ${action} recorded locally. No real access was granted.`,
      }
    })
  } catch {
    return {
      ok: false,
      error:
        'Demo verification could not be saved. Storage may be unavailable, full, or invalid. No verification was recorded.',
    }
  }
}
