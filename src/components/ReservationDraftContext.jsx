import { createContext, useContext, useState } from 'react'
import { createReservationDraft, readDemoReservations } from './demoReservations'
import { getDemoStorage } from './demoAccounts'

const KEY = 'parkiva-visit-drafts-v1'
const Context = createContext(null)
const steps = ['slots', 'datetime', 'vehicle', 'review', 'confirmation']
export function sanitizeVisitDraft(value) {
  if (!value || typeof value !== 'object' || !steps.includes(value.step)) return null
  const draft = createReservationDraft()
  draft.step = value.step
  draft.selectedId =
    typeof value.selectedId === 'string' && value.selectedId.length <= 30 ? value.selectedId : null
  for (const key of ['date', 'arrival', 'departure'])
    if (typeof value.dateTime?.[key] === 'string')
      draft.dateTime[key] = value.dateTime[key].slice(0, 20)
  for (const key of ['type', 'plate', 'model'])
    if (typeof value.vehicle?.[key] === 'string')
      draft.vehicle[key] = value.vehicle[key].slice(0, 120)
  return draft
}
function load() {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY))
    if (data?.version !== 1 || !data.workspaces || typeof data.workspaces !== 'object') return {}
    const result = {}
    for (const account of ['guest', 'driver-demo', 'operator-demo']) {
      result[account] = {}
      for (const [id, value] of Object.entries(data.workspaces[account] || {}).slice(0, 60)) {
        if (!/^[a-z0-9-]{1,100}$/.test(id)) continue
        const draft = sanitizeVisitDraft(value)
        if (draft) {
          if (draft.step === 'confirmation') {
            try {
              draft.confirmation =
                readDemoReservations(
                  getDemoStorage(localStorage, account === 'guest' ? null : account),
                ).find((record) => record.reference === value.confirmationReference) || null
            } catch {
              draft.confirmation = null
            }
            if (!draft.confirmation) draft.step = 'review'
          }
          result[account][id] = draft
        }
      }
    }
    return result
  } catch {
    return {}
  }
}
export function ReservationDraftProvider({ children }) {
  const [workspaces, setWorkspaces] = useState(load)
  function update(accountId, facilityId, draft) {
    const account = accountId || 'guest'
    const clean = sanitizeVisitDraft(draft)
    if (!clean) return
    setWorkspaces((previous) => {
      const next = {
        ...previous,
        [account]: {
          ...previous[account],
          [facilityId]: { ...clean, confirmation: draft.confirmation || null },
        },
      }
      try {
        const persisted = Object.fromEntries(
          Object.entries(next).map(([id, drafts]) => [
            id,
            Object.fromEntries(
              Object.entries(drafts).map(([facility, value]) => [
                facility,
                {
                  ...value,
                  confirmation: undefined,
                  confirmationReference: value.confirmation?.reference,
                },
              ]),
            ),
          ]),
        )
        sessionStorage.setItem(KEY, JSON.stringify({ version: 1, workspaces: persisted }))
      } catch {
        /* A draft still works in memory when tab storage is unavailable. */
      }
      return next
    })
  }
  function transfer(from, to, id) {
    const draft = workspaces[from || 'guest']?.[id]
    if (draft && !draft.confirmation) update(to, id, draft)
  }
  return <Context.Provider value={{ workspaces, update, transfer }}>{children}</Context.Provider>
}
export function useReservationDrafts() {
  return useContext(Context)
}
