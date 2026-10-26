import test from 'node:test'
import assert from 'node:assert/strict'
import { parseParkivaRoute, routePath } from '../src/components/parkivaRoutes.js'
test('public discovery is the default and existing page bookmarks remain valid', () => {
  for (const hash of ['', '#', '#browse', '#listing-results', '#main-content'])
    assert.deepEqual(parseParkivaRoute(hash), { page: 'browse' })
  for (const page of [
    'saved',
    'reservations',
    'driver',
    'operator',
    'login',
    'register',
    'host',
    'host-login',
    'host-register',
  ])
    assert.equal(parseParkivaRoute('#' + page).page, page)
})
test('listing and pass deep links round-trip; malformed paths have a friendly fallback', () => {
  for (const path of ['parking/davao-aldevinco-parking', 'pass/DEMO-driver-demo-upcoming-123'])
    assert.equal(routePath(parseParkivaRoute('#' + path)), path)
  for (const path of ['unknown', 'parking/', 'parking/<script>', 'pass/123', 'pass/DEMO-../secret'])
    assert.equal(parseParkivaRoute('#' + path).page, 'not-found')
})
test('sign-in return targets accept only a local parking listing', () => {
  assert.deepEqual(parseParkivaRoute('#login?returnTo=parking%2Fdavao-aldevinco-parking'), {
    page: 'login',
    returnTo: 'parking/davao-aldevinco-parking',
  })
  for (const target of [
    'https://evil.example',
    '//evil.example',
    'operator',
    'parking/../operator',
    'parking/<script>',
  ])
    assert.deepEqual(parseParkivaRoute('#login?returnTo=' + encodeURIComponent(target)), {
      page: 'login',
    })
})
