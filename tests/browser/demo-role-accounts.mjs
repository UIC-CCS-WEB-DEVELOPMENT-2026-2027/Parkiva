import assert from 'node:assert/strict'
import { launch, baseURL, button, fit, login, logout } from './helpers.mjs'
const browser = await launch()
try {
  for (const width of [320, 375, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    page.setDefaultTimeout(7000)
    const errors = []
    const submissions = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (request.method() !== 'GET') submissions.push(request.url())
    })
    await page.goto(baseURL)
    await button(page, 'Save Aldevinco Pay Parking').click()
    const guestFavorites = await page.evaluate(() =>
      localStorage.getItem('parkiva-saved-parking-ids'),
    )
    await button(page, 'Explore hosting').first().click()
    await button(page, 'Spaces & availability').click()
    assert.ok(await page.getByLabel('Set status for A01', { exact: true }).isDisabled())
    await button(page, 'Guest').click()
    await button(page, 'Log In').click()
    await button(page, 'Log In (demo)').click()
    assert.equal(await page.locator('.demo-auth [aria-invalid="true"]').count(), 2)
    await button(page, 'Quick-fill Driver').click()
    assert.equal(
      await page.getByLabel('Demo email address', { exact: true }).inputValue(),
      'driver@parkiva.demo',
    )
    await button(page, 'Show password').click()
    assert.equal(
      await page.getByLabel('Demo password', { exact: true }).getAttribute('type'),
      'text',
    )
    await page.getByLabel('Demo password', { exact: true }).fill('wrong')
    await button(page, 'Log In (demo)').click()
    await page
      .getByText(
        'Demo email or password does not match. Use one of the two sample accounts below.',
        { exact: true },
      )
      .waitFor()
    await button(page, 'Go to demo registration').click()
    await button(page, 'Try registration demo').click()
    assert.equal(
      await page.getByLabel('Demo display name', { exact: true }).getAttribute('aria-invalid'),
      'true',
    )
    await button(page, 'Go to demo login').click()
    await button(page, 'Quick-fill Driver').click()
    await button(page, 'Log In (demo)').click()
    await page.getByRole('heading', { name: 'Good to see you, driver.', exact: true }).waitFor()
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
    await button(page, 'Browse').click()
    await button(page, 'Save Aldevinco Pay Parking').waitFor()
    await button(page, 'Driver Dashboard').click()
    assert.equal(await page.locator('.driver-favorites article').count(), 2)
    await button(page, 'Saved').click()
    await button(page, 'Reset Filters').click()
    assert.equal(await page.locator('.parking-card').count(), 2)
    await page.getByRole('button', { name: /^Show All/ }).click()
    assert.equal(await button(page, 'Browse').getAttribute('aria-current'), 'page')
    await page.waitForFunction(() => document.querySelectorAll('.parking-card').length === 11)
    assert.equal(await page.locator('.parking-card').count(), 11)
    await button(page, 'Driver Dashboard').click()
    const upcoming = page
      .locator('.reservation-history-card')
      .filter({ hasText: 'DEMO-driver-demo-upcoming-' })
    await upcoming.getByRole('button', { name: /^Cancel demo reservation/ }).click()
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
    await button(page, 'Guest').waitFor()
    await button(page, 'Guest').click()
    await button(page, 'Log In').click()
    await page.evaluate(() => {
      Storage.prototype.setItem = function () {
        throw Error('quota')
      }
    })
    await button(page, 'Quick-fill Driver').click()
    await button(page, 'Log In (demo)').click()
    await page.getByRole('alert').filter({ hasText: 'demo session could not be saved' }).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('parkiva-demo-account-v1')), null)
    await button(page, 'Guest').waitFor()
    await fit(page, width)
    assert.deepEqual(errors, [])
    assert.deepEqual(submissions, [])
    console.log(
      'PASS ' +
        width +
        'px: login/registration/quick-fill/validation/password toggle, driver favorites/history, account isolation/logout/reload, operator assignment guards, storage failure and cross-tab session reset',
    )
    await context.close()
  }
} finally {
  await browser.close()
}
