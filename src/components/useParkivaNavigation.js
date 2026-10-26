import { useEffect, useRef, useState } from 'react'
import { parseParkivaRoute } from './parkivaRoutes'

export default function useParkivaNavigation() {
  const [route, setRoute] = useState(() => parseParkivaRoute(window.location.hash))
  const scrollJob = useRef(0)
  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    function restore() {
      setRoute(parseParkivaRoute(window.location.hash))
      cancelAnimationFrame(scrollJob.current)
      scrollJob.current = requestAnimationFrame(() =>
        window.scrollTo({ top: window.history.state?.parkivaScroll || 0, behavior: 'instant' }),
      )
    }
    window.addEventListener('popstate', restore)
    window.addEventListener('hashchange', restore)
    return () => {
      window.removeEventListener('popstate', restore)
      window.removeEventListener('hashchange', restore)
      cancelAnimationFrame(scrollJob.current)
      window.history.scrollRestoration = previous
    }
  }, [])
  function navigate(path, { replace = false, overlay = false, restoreScroll = 0 } = {}) {
    const next = parseParkivaRoute('#' + path)
    const same = window.location.hash === '#' + path
    if (!same) {
      window.history.replaceState(
        { ...window.history.state, parkivaScroll: window.scrollY },
        '',
        window.location.href,
      )
      const state = {
        parkiva: true,
        parkivaScroll: overlay ? window.scrollY : restoreScroll,
        overlay,
        from: window.location.hash || '#browse',
      }
      window.history[replace ? 'replaceState' : 'pushState'](state, '', '#' + path)
    }
    setRoute(next)
    if (!overlay) window.scrollTo({ top: restoreScroll, behavior: 'instant' })
  }
  function closeListing() {
    if (window.history.state?.overlay && window.history.state?.from) window.history.back()
    else navigate('browse', { replace: true })
  }
  return { route, navigate, closeListing }
}
