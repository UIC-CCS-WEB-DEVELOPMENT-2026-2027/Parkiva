import assert from 'node:assert/strict'
import {
  launch,
  baseURL,
  button,
  fit,
  login,
  logout,
  credentials,
  driverDashboard,
} from './helpers.mjs'
const browser = await launch()
try {
  for (const width of [320, 375, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    page.setDefaultTimeout(7000)
    const errors = [],
      submissions = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (request.method() !== 'GET') submissions.push(request.url())
    })
    await page.goto(baseURL)
    await button(page, 'Save Aldevinco Pay Parking').click()
    const guestFavorites = await page.evaluate(() =>
      localStorage.getItem('parkiva-saved-parking-ids'),
    )
    await button(page, 'List your space').click()
    await page
      .getByRole('heading', { name: 'A parking space. A little more possibility.' })
      .waitFor()
    assert.equal(await page.getByLabel('Set status for A01', { exact: true }).count(), 0)
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Sign in', exact: true })
      .click()
    const submit = () =>
      page.getByRole('form').getByRole('button', { name: 'Sign in', exact: true }).click()
    await submit()
    assert.equal(await page.locator('.demo-auth input[aria-invalid="true"]').count(), 2)
    assert.equal(await page.locator('.sample-account-help').getAttribute('open'), null)
    await page.getByText('Try a sample account', { exact: true }).click()
    await page.getByText('driver@parkiva.demo', { exact: true }).waitFor()
    await credentials(page)
    await button(page, 'Show password').click()
    assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text')
    await page.getByLabel('Password', { exact: true }).fill('wrong')
    await submit()
    await page.getByText(/Demo email or password does not match/).waitFor()
    await credentials(page, 'Parking Operator')
    await submit()
    await page
      .getByText('Use a driver account here, or switch to host sign in.', { exact: true })
      .waitFor()
    await button(page, 'Get started').click()
    await button(page, 'Continue with sample account').click()
    assert.equal(
      await page.getByLabel('Display name', { exact: true }).getAttribute('aria-invalid'),
      'true',
    )
    await button(page, 'Sign in instead').click()
    await credentials(page)
    await submit()
    await page.locator('#driver-dashboard-heading').waitFor()
    await page.waitForFunction(
      () => document.querySelectorAll('.reservation-history-card').length === 3,
    )
    assert.equal(await page.locator('.driver-favorites article').count(), 3)
    assert.deepEqual(
      await page.evaluate(() => JSON.parse(localStorage.getItem('parkiva-demo-account-v1'))),
      { accountId: 'driver-demo' },
    )
    await fit(page, width)
    await page
      .locator('.driver-favorites article')
      .first()
      .getByRole('button', { name: /^Unsave/ })
      .click()
    await button(page, 'Explore').click()
    await button(page, 'Save Aldevinco Pay Parking').waitFor()
    await driverDashboard(page)
    assert.equal(await page.locator('.driver-favorites article').count(), 2)
    await button(page, 'Saved').click()
    await button(page, 'Reset Filters').click()
    assert.equal(await page.locator('.parking-card').count(), 2)
    await button(page, 'Show All').click()
    assert.equal(await button(page, 'Explore').getAttribute('aria-current'), 'page')
    await page.waitForFunction(() => document.querySelectorAll('.parking-card').length === 11)
    await driverDashboard(page)
    const upcoming = page
      .locator('.reservation-history-card')
      .filter({ hasText: 'DEMO-driver-demo-upcoming-' })
    await upcoming.getByRole('button', { name: /^Cancel reservation/ }).click()
    await button(page, 'Confirm cancellation').click()
    await upcoming.locator('.reservation-history-status--cancelled').waitFor()
    await page.reload()
    assert.equal(await page.locator('.driver-favorites article').count(), 2)
    const driverRaw = await page.evaluate(() =>
      localStorage.getItem('parkiva-demo-reservations-v1:driver-demo'),
    )
    await logout(page, 'Driver')
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-saved-parking-ids')),
      guestFavorites,
    )
    await button(page, 'My Reservations').click()
    await page.getByText('Your next visit starts with a spot.', { exact: true }).waitFor()
    await login(page, 'Parking Operator')
    await button(page, 'Spaces & availability').click()
    const ids = await page
      .locator('#operator-facility option')
      .evaluateAll((nodes) => nodes.map((node) => node.value))
    assert.equal(ids.length, 6)
    assert.ok(!ids.includes('davao-gmall-parking'))
    await page.getByLabel('Set status for A04', { exact: true }).selectOption('Available')
    await page.getByRole('status').filter({ hasText: 'A04 is now available' }).waitFor()
    const rejected = await page.evaluate(async () => {
      const { saveMockSlotStatus } = await import('/src/components/mockSlotState.js')
      const { parkingSlotsByFacility } = await import('/src/components/parkingSlotData.js')
      return saveMockSlotStatus('davao-gmall-parking', 'G01', 'Occupied', parkingSlotsByFacility)
    })
    assert.equal(rejected.ok, false)
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-demo-reservations-v1:driver-demo')),
      driverRaw,
    )
    await fit(page, width)
    await page.reload()
    await button(page, 'Spaces & availability').click()
    assert.equal(
      await page.getByLabel('Set status for A04', { exact: true }).inputValue(),
      'Available',
    )
    await logout(page, 'Parking Operator')
    await login(page, 'Driver')
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-demo-reservations-v1:driver-demo')),
      driverRaw,
    )
    const persisted = await page.evaluate(() =>
      JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
    )
    assert.ok(
      !persisted.includes('DriverDemo123!') &&
        !persisted.includes('OperatorDemo123!') &&
        !persisted.includes('"password"'),
    )
    const other = await context.newPage()
    await other.goto(baseURL)
    await other.evaluate(() => localStorage.removeItem('parkiva-demo-account-v1'))
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Sign in', exact: true })
      .waitFor()
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Sign in', exact: true })
      .click()
    await credentials(page)
    await page.evaluate(() => {
      Storage.prototype.setItem = function () {
        throw Error('quota')
      }
    })
    await submit()
    await page.getByRole('alert').filter({ hasText: 'demo session could not be saved' }).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('parkiva-demo-account-v1')), null)
    await fit(page, width)
    assert.deepEqual(errors, [])
    assert.deepEqual(submissions, [])
    console.log(
      'PASS ' +
        width +
        'px: compact login/registration, sample help, validation/password toggle, audience separation, account isolation, host assignment guards, storage failure and cross-tab reset',
    )
    await context.close()
  }
} finally {
  await browser.close()
}
