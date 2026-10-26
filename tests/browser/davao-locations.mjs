import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

const { chromium } = process.env.PARKIVA_PLAYWRIGHT_PATH
  ? await import(pathToFileURL(process.env.PARKIVA_PLAYWRIGHT_PATH).href) : await import('playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.PARKIVA_CHROMIUM_PATH ? { executablePath: process.env.PARKIVA_CHROMIUM_PATH } : {}) })
try {
  const context = await browser.newContext()
  await context.addInitScript(() => {
    if (localStorage.getItem('location-test-seeded')) return
    localStorage.setItem('location-test-seeded', 'yes')
    localStorage.setItem('parkiva-saved-parking-ids', JSON.stringify(['sample-courtyard', 'unknown-id', 'davao-aldevinco-parking', 'davao-aldevinco-parking']))
    localStorage.setItem('parkiva-mock-slot-statuses-v1', JSON.stringify({ version: 1, facilities: { 'sample-courtyard': { A01: 'Occupied' } } }))
    localStorage.setItem('parkiva-demo-reservations-v1', JSON.stringify({ version: 1, reservations: [{
      demo: true, reference: 'DEMO-legacy-location', confirmedAt: '2026-10-20T00:00:00Z',
      facility: { id: 'sample-courtyard', name: 'Sample Courtyard Parking', location: 'Block A, Example District' },
      slot: { id: 'A01', vehicle: 'Car' }, vehicle: { type: 'Car', plate: 'LEGACY', model: '' },
      dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
    }] }))
  })
  const page = await context.newPage()
  page.setDefaultTimeout(7000)
  const errors = []
  const externalImages = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => { if (request.resourceType() === 'image' && !request.url().startsWith(process.env.PARKIVA_BASE_URL || 'http://127.0.0.1:5173')) externalImages.push(request.url()) })
  await page.goto(process.env.PARKIVA_BASE_URL || 'http://127.0.0.1:5173')
  assert.equal(await page.locator('.parking-card').count(), 8)
  assert.equal(await page.getByText('Placeholder only · not a photo of this facility', { exact: true }).count(), 8)
  await page.waitForFunction(() => JSON.stringify(JSON.parse(localStorage.getItem('parkiva-saved-parking-ids'))) === '["davao-aldevinco-parking"]')
  const links = await page.locator('.parking-card a.parking-map-link').evaluateAll((nodes) => nodes.map((node) => ({ href: node.href, target: node.target, rel: node.rel })))
  assert.equal(links.length, 8)
  for (const link of links) {
    assert.equal(new URL(link.href).hostname, 'www.google.com')
    assert.match(new URL(link.href).searchParams.get('query'), /Davao City/)
    assert.equal(link.target, '_blank')
    assert.match(link.rel, /noopener/)
  }
  await page.getByRole('button', { name: 'Saved Only', exact: true }).click()
  assert.equal(await page.locator('.parking-card').count(), 1)
  await page.getByRole('button', { name: 'Show All', exact: true }).click()
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole('button', { name: /View Details.*Aldevinco/ }).click()
    await page.getByRole('heading', { name: 'Location sources', exact: true }).waitFor()
    assert.equal(await page.locator('.parking-location-sources a').count(), 2)
    // A retired Occupied override must not be transferred to the new facility.
    assert.ok(await page.getByRole('button', { name: /^Slot A01, Car, Available/ }).isEnabled())
    assert.ok(await page.getByRole('dialog').evaluate((node) => node.scrollWidth <= node.clientWidth))
    await page.keyboard.press('Escape')
  }
  await page.getByRole('searchbox').fill('Tigatto')
  assert.equal(await page.locator('.parking-card').count(), 1)
  assert.equal(await page.locator('.parking-card h2').textContent(), 'NCCC Mall Buhangin Parking')
  await page.getByRole('button', { name: 'My Reservations', exact: true }).click()
  await page.getByRole('heading', { name: 'Sample Courtyard Parking', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('parkiva-demo-reservations-v1')).reservations[0].facility.id), 'sample-courtyard')
  assert.deepEqual(externalImages, [])
  assert.deepEqual(errors, [])
  console.log('PASS: 8 sourced listings/Maps links, explicit placeholders/no remote images, retired favorite and override migration, historical snapshot preservation, location search, responsive details 320/375/390/1280.')
} finally { await browser.close() }
