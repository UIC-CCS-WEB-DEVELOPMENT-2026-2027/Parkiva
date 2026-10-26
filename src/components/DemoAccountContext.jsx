import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_SESSION_KEY, DEMO_ACCOUNT_EVENT, demoAccount, readDemoAccountId } from './demoAccounts'
import { seedDemoAccount } from './demoAccountSeeds'

const Context = createContext(null)
export function DemoAccountProvider({ children }) {
  const [accountId, setAccountId] = useState(() => { try { return readDemoAccountId(window.localStorage) } catch { return null } })
  const [error, setError] = useState('')
  useEffect(() => {
    const sync = () => { try { setAccountId(readDemoAccountId(window.localStorage)) } catch { setAccountId(null) } }
    const onStorage = (event) => { if (event.key === DEMO_SESSION_KEY || event.key === null) sync() }
    window.addEventListener('storage', onStorage)
    window.addEventListener(DEMO_ACCOUNT_EVENT, sync)
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(DEMO_ACCOUNT_EVENT, sync) }
  }, [])
  function login(id) {
    try {
      if (!demoAccount(id)) throw Error('Unknown account')
      seedDemoAccount(window.localStorage, id)
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ accountId: id }))
      setError('')
      setAccountId(id)
      window.dispatchEvent(new Event(DEMO_ACCOUNT_EVENT))
      return true
    } catch { setError('The demo session could not be saved. Browser storage may be unavailable or full. You can still browse as a guest.'); return false }
  }
  function logout() {
    try {
      window.localStorage.removeItem(DEMO_SESSION_KEY)
      setAccountId(null)
      setError('')
      window.dispatchEvent(new Event(DEMO_ACCOUNT_EVENT))
    } catch { setError('The saved demo session could not be cleared. Please check browser storage and try again.') }
  }
  return <Context.Provider value={{ account: demoAccount(accountId), login, logout, error }}>{children}</Context.Provider>
}
export function useDemoAccount() { return useContext(Context) }
