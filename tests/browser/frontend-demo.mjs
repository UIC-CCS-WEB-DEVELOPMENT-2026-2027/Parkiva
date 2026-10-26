import assert from 'node:assert/strict'
import {
  launch,
  baseURL,
  button,
  fit,
  openDetails,
  schedule,
  vehicle,
  reference,
} from './helpers.mjs'
const browser = await launch()
try {
  for (const width of [320, 375, 390, 768, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      timezoneId: 'Asia/Manila',
    })
    const page = await context.newPage()
    page.setDefaultTimeout(7000)
    await page.clock.install({ time: new Date('2026-10-26T09:00:00+08:00') })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(baseURL)
    await fit(page, width)
    await button(page, 'My Reservations').click()
    await page.getByText('Your next visit starts with a spot.', { exact: true }).waitFor()
    await button(page, 'Browse parking').click()
    await page.locator('input[type="search"]').fill('  Airport Road  ')
    assert.equal(await page.locator('.parking-card').count(), 1)
    await page.locator('input[type="search"]').fill('does-not-exist')
    await page.locator('.parking-empty').waitFor()
    await button(page, 'Reset Filters').first().click()
    await page.getByLabel('Vehicle type', { exact: true }).selectOption('Car')
    assert.equal(await page.locator('.parking-card').count(), 10)
    await button(page, 'Filters').click()
    const filter = page.getByRole('dialog')
    await filter.getByLabel('Availability', { exact: true }).selectOption('Full')
    await page.keyboard.press('Escape')
    await page.locator('.parking-empty').waitFor()
    await button(page, 'Reset Filters').first().click()
    await page.getByLabel('Sort By', { exact: true }).selectOption('name-asc')
    const names = await page.locator('.parking-card h2').allTextContents()
    assert.deepEqual(
      names,
      [...names].sort((a, b) => a.localeCompare(b)),
    )
    await page.getByLabel('Sort By', { exact: true }).selectOption('price-asc')
    const prices = await page.locator('.listing-card-bottom strong').allTextContents()
    const numbers = prices.map((v) => Number(v.replace(/[^0-9]/g, '')))
    assert.deepEqual(
      numbers,
      [...numbers].sort((a, b) => a - b),
    )
    await button(page, 'Reset Filters').click()
    await button(page, 'Save Aldevinco Pay Parking').click()
    await page.reload()
    await page.getByRole('button', { name: /^Saved Only/ }).click()
    assert.equal(await page.locator('.parking-card').count(), 1)
    await page.getByRole('button', { name: /^Show All/ }).click()
    const trigger = button(page, 'View Details for Aldevinco Pay Parking')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page.getByRole('dialog').waitFor()
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
    for (let i = 0; i < 18; i++) {
      await page.keyboard.press(i % 3 === 0 ? 'Shift+Tab' : 'Tab')
      assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))))
    }
    await fit(page, width)
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.ok(await trigger.evaluate((node) => node === document.activeElement))
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
    await openDetails(page)
    await page.mouse.click(1, 1)
    assert.equal(await page.getByRole('dialog').count(), 0)
    await openDetails(page)
    assert.ok(await page.getByRole('button', { name: /^Slot A02, Car, Reserved/ }).isDisabled())
    assert.ok(await button(page, 'Continue to date and time').isDisabled())
    await page.getByRole('button', { name: /^Slot A01, Car, Available/ }).click()
    await button(page, 'Continue to date and time').click()
    await button(page, 'Continue to vehicle information').click()
    assert.equal(await page.locator('.reservation-datetime [aria-invalid="true"]').count(), 3)
    await page.getByLabel('Reservation date', { exact: true }).fill('2026-10-25')
    await page.getByLabel('Arrival time', { exact: true }).fill('11:00')
    await page.getByLabel('Departure time', { exact: true }).fill('10:00')
    await button(page, 'Continue to vehicle information').click()
    assert.equal(await page.locator('.reservation-datetime [aria-invalid="true"]').count(), 2)
    await page.getByLabel('Reservation date', { exact: true }).fill('2026-10-28')
    await page.getByLabel('Arrival time', { exact: true }).fill('10:00')
    await page.getByLabel('Departure time', { exact: true }).fill('11:00')
    await page.evaluate(() => {
      localStorage.setItem(
        'parkiva-mock-slot-statuses-v1:operator-demo',
        JSON.stringify({
          version: 1,
          facilities: { 'davao-aldevinco-parking': { A01: 'Occupied' } },
        }),
      )
      window.dispatchEvent(new Event('parkiva-demo-data-changed'))
    })
    await button(page, 'Continue to vehicle information').click()
    await page.getByRole('alert').filter({ hasText: 'no longer available' }).waitFor()
    await page.evaluate(() => {
      localStorage.setItem(
        'parkiva-mock-slot-statuses-v1:operator-demo',
        JSON.stringify({
          version: 1,
          facilities: { 'davao-aldevinco-parking': { A01: 'Available' } },
        }),
      )
      window.dispatchEvent(new Event('parkiva-demo-data-changed'))
    })
    await page.getByRole('button', { name: /^Slot A01, Car, Available/ }).click()
    await button(page, 'Continue to date and time').click()
    assert.equal(
      await page.getByLabel('Reservation date', { exact: true }).inputValue(),
      '2026-10-28',
    )
    await button(page, 'Continue to vehicle information').click()
    await button(page, 'Review selection').click()
    assert.equal(await page.locator('.vehicle-information-form [aria-invalid="true"]').count(), 2)
    await vehicle(page)
    await button(page, 'Edit date and time').click()
    assert.equal(
      await page.getByLabel('Reservation date', { exact: true }).inputValue(),
      '2026-10-28',
    )
    await button(page, 'Continue to vehicle information').click()
    assert.equal(await page.getByLabel('Plate number', { exact: true }).inputValue(), 'PREVIEW-123')
    await button(page, 'Review selection').click()
    await fit(page, width)
    await page.keyboard.press('Escape')
    await openDetails(page)
    await page.getByRole('form', { name: 'Reservation review' }).waitFor()
    await button(page, 'Confirm demo reservation').click()
    await page
      .getByRole('heading', { name: 'Demo reservation confirmation', exact: true })
      .waitFor()
    const ref = await reference(page)
    await button(page, 'View QR pass').click()
    await page
      .getByRole('img', { name: 'QR code containing only the demo pass reference' })
      .waitFor()
    assert.ok(
      await page
        .locator('.demo-parking-pass')
        .textContent()
        .then((text) => text.includes(ref)),
    )
    await fit(page, width)
    await page.keyboard.press('Escape')
    await button(page, 'My Reservations').click()
    const card = page.locator('.reservation-history-card')
    await card.waitFor()
    await card.getByRole('button', { name: /^View details/ }).click()
    await card.getByRole('button', { name: /^Cancel reservation/ }).click()
    await button(page, 'Keep reservation').waitFor()
    assert.equal(
      await button(page, 'Keep reservation').evaluate((node) => node === document.activeElement),
      true,
    )
    await page.keyboard.press('Escape')
    await card.getByRole('button', { name: /^Cancel reservation/ }).click()
    await button(page, 'Confirm cancellation').click()
    await page.getByRole('status').filter({ hasText: 'cancelled.' }).waitFor()
    await page.reload()
    await button(page, 'My Reservations').click()
    await page.locator('.reservation-history-status--cancelled').waitFor()
    await page.locator('.history-tabs button').filter({ hasText: 'Upcoming' }).click()
    await page.getByRole('heading', { name: 'No upcoming visits here.' }).waitFor()
    await page.locator('.history-tabs button').filter({ hasText: 'Cancelled' }).click()
    await page
      .locator('.reservation-history-card')
      .getByRole('button', { name: /^View parking pass/ })
      .click()
    assert.equal(
      await page
        .getByRole('img', { name: 'QR code containing only the demo pass reference' })
        .count(),
      0,
    )
    await fit(page, width)
    await page.evaluate(() => localStorage.setItem('parkiva-demo-reservations-v1', '{broken'))
    await button(page, 'My Reservations').click()
    await button(page, 'Refresh reservations').click()
    await page.getByRole('alert').filter({ hasText: 'could not be read' }).waitFor()
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-demo-reservations-v1')),
      '{broken',
    )
    assert.deepEqual(errors, [])
    console.log(
      'PASS ' +
        width +
        'px: guest discovery/search/sort/filter/favorite, modal keyboard/backdrop/focus, validation/backtracking/drafts, confirmation/QR/history/cancellation/storage errors',
    )
    await context.close()
  }
} finally {
  await browser.close()
}
