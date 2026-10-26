import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  launch,
  baseURL,
  button,
  fit,
  login,
  logout,
  credentials,
  openDetails,
  schedule,
  vehicle,
  reference,
} from './helpers.mjs'
const browser = await launch()
try {
  for (const width of [320, 375, 390, 430, 768, 1440]) {
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
    assert.equal(await page.locator('.parking-card').count(), 11)
    const firstImage = await page.locator('.listing-card-media').first().boundingBox()
    assert.ok(
      firstImage.y < 400 && firstImage.height > 140,
      'Useful listings above the fold at ' + width,
    )
    assert.equal(
      await page.locator('.marketplace-hero, .preview-notice, .demo-account-card').count(),
      0,
    )
    const vehicleFilter = await page.getByLabel('Vehicle type', { exact: true }).boundingBox()
    assert.ok(vehicleFilter.width > 85, 'Readable compact vehicle filter')
    await fit(page, width)
    await page.screenshot({
      path: join(tmpdir(), 'parkiva-navigation-' + width + '.png'),
      fullPage: false,
    })
    await button(page, 'Save Aldevinco Pay Parking').click()
    await button(page, 'Saved').click()
    await page.waitForFunction(() => document.querySelectorAll('.parking-card').length === 1)
    await openDetails(page)
    assert.equal(await button(page, 'Saved').getAttribute('aria-current'), 'page')
    await page.goBack()
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await page.locator('.parking-card').count(), 1)
    await page.goForward()
    await page.getByRole('dialog').waitFor()
    await page.getByRole('button', { name: 'Close parking details', exact: true }).click()
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    await button(page, 'Explore').click()
    await page.waitForFunction(() => document.querySelectorAll('.parking-card').length === 11)
    await page.evaluate(() => scrollTo(0, 540))
    await page.waitForFunction(() => scrollY === 540)
    await button(page, 'My Reservations').click()
    await page.goBack()
    await page.waitForFunction(() => scrollY === 540)
    await button(page, 'Parkiva home').click()
    await page.waitForFunction(() => scrollY === 0)
    await openDetails(page)
    await schedule(page, '2026-10-29')
    await vehicle(page, 'NAV-' + width)
    await page.reload()
    await page.getByRole('form', { name: 'Reservation review' }).waitFor()
    assert.match(
      await page.getByRole('form', { name: 'Reservation review' }).textContent(),
      new RegExp('NAV-' + width),
    )
    await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click()
    assert.match(page.url(), /#login\?returnTo=/)
    await credentials(page)
    await button(page, 'Get started').click()
    assert.equal(
      await page.getByLabel('Email address', { exact: true }).inputValue(),
      'driver@parkiva.demo',
    )
    await button(page, 'Sign in instead').click()
    await page.getByRole('form').getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByRole('form', { name: 'Reservation review' }).waitFor()
    assert.match(page.url(), /#parking\/davao-aldevinco-parking$/)
    await button(page, 'Back to vehicle').click()
    assert.equal(
      await page.getByLabel('Plate number', { exact: true }).inputValue(),
      'NAV-' + width,
    )
    await button(page, 'Review selection').click()
    await button(page, 'Confirm demo reservation').click()
    await page
      .getByRole('heading', { name: 'Demo reservation confirmation', exact: true })
      .waitFor()
    const ref = await reference(page, 'parkiva-demo-reservations-v1:driver-demo')
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-demo-reservations-v1')),
      null,
    )
    await page.reload()
    await page
      .getByRole('heading', { name: 'Demo reservation confirmation', exact: true })
      .waitFor()
    await button(page, 'View QR pass').click()
    assert.ok(page.url().endsWith('#pass/' + ref))
    await page
      .getByRole('img', { name: 'QR code containing only the demo pass reference' })
      .waitFor()
    await page.reload()
    await page
      .getByRole('img', { name: 'QR code containing only the demo pass reference' })
      .waitFor()
    await fit(page, width)
    await page.screenshot({
      path: join(tmpdir(), 'parkiva-pass-' + width + '.png'),
      fullPage: false,
    })
    await button(page, 'My Reservations').click()
    await page.locator('.reservation-history-card').filter({ hasText: ref }).waitFor()
    await button(page, 'Account').click()
    await page.keyboard.press('Escape')
    assert.equal(await button(page, 'Account').getAttribute('aria-expanded'), 'false')
    assert.ok(await button(page, 'Account').evaluate((node) => node === document.activeElement))
    await logout(page, 'Driver')
    await login(page, 'Parking Operator')
    await button(page, 'Add a listing').first().click()
    await page.getByLabel('Listing title', { exact: true }).fill('Unfinished host draft')
    await button(page, 'Explore').click()
    await button(page, 'Host workspace').click()
    assert.equal(
      await page.getByLabel('Listing title', { exact: true }).inputValue(),
      'Unfinished host draft',
    )
    await fit(page, width)
    await page.screenshot({
      path: join(tmpdir(), 'parkiva-host-' + width + '.png'),
      fullPage: false,
    })
    await logout(page, 'Parking Operator')
    await page.goto(baseURL + '/#parking/davao-aldevinco-parking')
    await page.getByRole('dialog').waitFor()
    await page.reload()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.ok(page.url().endsWith('#browse'))
    await page.goto(baseURL + '/#parking/unknown-listing')
    await page.locator('#not-found-heading').waitFor()
    await page.goto(baseURL + '/#missing-page')
    await page.locator('#not-found-heading').waitFor()
    assert.equal(await page.title(), 'Page not found | Parkiva')
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Explore parking', exact: true })
      .click()
    await page.locator('#parking-heading').waitFor()
    assert.equal(await page.title(), 'Find parking in Davao | Parkiva')
    if (width === 390) {
      await page.evaluate(() => sessionStorage.setItem('parkiva-visit-drafts-v1', '{broken'))
      await page.reload()
      await openDetails(page, 'SM City Davao Parking')
      await page.getByRole('heading', { name: 'Step 1 of 4: Parking slot', exact: true }).waitFor()
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem('parkiva-visit-drafts-v1')),
        '{broken',
      )
      await page.evaluate(() => {
        const original = Storage.prototype.setItem
        Storage.prototype.setItem = function (key, value) {
          if (this === sessionStorage) throw Error('Tab storage unavailable')
          return original.call(this, key, value)
        }
      })
      await schedule(page, '2026-10-30', 'D01')
      await page.getByLabel('Plate number', { exact: true }).fill('IN-MEMORY')
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await openDetails(page, 'SM City Davao Parking')
      assert.equal(await page.getByLabel('Plate number', { exact: true }).inputValue(), 'IN-MEMORY')
    }
    await fit(page, width)
    const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage }))
    assert.ok(!stored.includes('DriverDemo123!') && !stored.includes('OperatorDemo123!'))
    assert.deepEqual(errors, [])
    console.log(
      'PASS ' +
        width +
        'px: listing-first layout, Saved context, Back/Forward/scroll, refresh/deep links/404, guest-to-driver draft, confirmation/QR/history routes, account keyboard, host edit retention',
    )
    await context.close()
  }
} finally {
  await browser.close()
}
