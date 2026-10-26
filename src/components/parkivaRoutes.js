const pages = new Set([
  'browse',
  'saved',
  'reservations',
  'driver',
  'host',
  'operator',
  'login',
  'register',
  'host-login',
  'host-register',
])
export function parseParkivaRoute(hash = '') {
  const fragment = hash.replace(/^#\/?/, '')
  const [path = '', query = ''] = fragment.split('?')
  const params = new URLSearchParams(query)
  if (!path || ['listing-results', 'main-content'].includes(path)) return { page: 'browse' }
  if (pages.has(path)) {
    const target = params.get('returnTo')
    return {
      page: path,
      ...(target && /^parking\/[a-z0-9-]{1,100}$/.test(target) ? { returnTo: target } : {}),
    }
  }
  const listing = /^parking\/([a-z0-9-]{1,100})$/.exec(path)
  if (listing) return { page: 'parking', listingId: listing[1] }
  const pass = /^pass\/(DEMO-[A-Za-z0-9-]{1,120})$/.exec(path)
  if (pass) return { page: 'pass', reference: pass[1] }
  return { page: 'not-found' }
}
export const routePath = (route) =>
  route.page === 'parking'
    ? `parking/${route.listingId}`
    : route.page === 'pass'
      ? `pass/${route.reference}`
      : route.page
