import assert from 'node:assert/strict'
import { launch, baseURL, button, fit, openDetails } from './helpers.mjs'
const browser = await launch()
try {
  const context = await browser.newContext()
  await context.addInitScript(() => {
    if (localStorage.getItem('location-test-seeded')) return
    localStorage.setItem('location-test-seeded', 'yes')
    localStorage.setItem(
      'parkiva-saved-parking-ids',
      JSON.stringify([
        'sample-courtyard',
        'unknown',
        'davao-aldevinco-parking',
        'davao-aldevinco-parking',
      ]),
    )
    localStorage.setItem(
      'parkiva-mock-slot-statuses-v1',
      JSON.stringify({ version: 1, facilities: { 'sample-courtyard': { A01: 'Occupied' } } }),
    )
    localStorage.setItem(
      'parkiva-demo-reservations-v1',
      JSON.stringify({
        version: 1,
        reservations: [
          {
            demo: true,
            reference: 'DEMO-legacy',
            confirmedAt: '2026-10-20T00:00:00Z',
            facility: {
              id: 'sample-courtyard',
              name: 'Sample Courtyard Parking',
              location: 'Block A, Example District',
            },
            slot: { id: 'A01', vehicle: 'Car' },
            vehicle: { type: 'Car', plate: 'LEGACY', model: '' },
            dateTime: { date: '2026-10-28', arrival: '10:00', departure: '11:00' },
          },
        ],
      }),
    )
  })
  const page = await context.newPage()
  page.setDefaultTimeout(7000)
  const errors = []
  const remoteImages = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (request.resourceType() === 'image' && !request.url().startsWith(baseURL))
      remoteImages.push(request.url())
  })
  await page.goto(baseURL)
  assert.equal(await page.locator('.parking-card').count(), 11)
  assert.equal(
    await page
      .locator('.parking-card figcaption')
      .filter({ hasText: 'Representative photo' })
      .count(),
    11,
  )
  await page.waitForFunction(
    () => localStorage.getItem('parkiva-saved-parking-ids') === '["davao-aldevinco-parking"]',
  )
  for (const width of [320, 375, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await fit(page, width)
    await openDetails(page)
    await page.getByText('Location sources & verification', { exact: true }).click()
    assert.equal(await page.locator('.parking-location-sources a').count(), 2)
    const maps = await page.getByRole('link', { name: /Open in Google Maps/ }).getAttribute('href')
    assert.equal(new URL(maps).hostname, 'www.google.com')
    assert.match(new URL(maps).searchParams.get('query'), /Davao City/)
    assert.ok(await page.getByRole('button', { name: /^Slot A01, Car, Available/ }).isEnabled())
    await button(page, 'Show representative garage photo').click()
    await page.getByText('Anastasiya Badun / Pexels', { exact: true }).waitFor()
    await fit(page, width)
    await page.keyboard.press('Escape')
  }
  await page.getByRole('searchbox').fill('Tigatto')
  assert.equal(await page.locator('.parking-card').count(), 1)
  await button(page, 'My Reservations').click()
  await page.getByRole('heading', { name: 'Sample Courtyard Parking', exact: true }).waitFor()
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('parkiva-demo-reservations-v1')).reservations[0].facility
          .id,
    ),
    'sample-courtyard',
  )
  await page.route('**/images/parking-outdoor.jpg', (route) => route.abort())
  await page.goto(baseURL)
  await openDetails(page)
  await page.locator('.listing-gallery .photo-fallback').waitFor()
  await button(page, 'Show representative garage photo').click()
  await page.locator('.listing-gallery > figure img').waitFor()
  assert.equal(await page.locator('.listing-gallery .photo-fallback').count(), 0)
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [])
  assert.deepEqual(remoteImages, [])
  console.log(
    'PASS: sourced real listings, local licensed imagery/credits/gallery, Maps, fictional host separation, legacy ID/history preservation, 320/375/390/1280px details',
  )
} finally {
  await browser.close()
}
