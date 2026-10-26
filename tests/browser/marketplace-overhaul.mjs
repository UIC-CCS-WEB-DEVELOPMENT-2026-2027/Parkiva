import assert from 'node:assert/strict'
import {
  launch,
  baseURL,
  button,
  fit,
  login,
  logout,
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
    if (width <= 600) await page.getByRole('button', { name: /^Add visit times/ }).click()
    await page.getByLabel('Search date', { exact: true }).fill('2026-10-27')
    await page.getByLabel('Search arrival time', { exact: true }).fill('10:00')
    await page.getByLabel('Search departure time', { exact: true }).fill('11:00')
    await button(page, 'Find parking').click()
    await page.getByRole('status').filter({ hasText: 'for your selected time' }).waitFor()
    await openDetails(page)
    await page.getByRole('button', { name: /^Slot A01, Car, Available/ }).click()
    await button(page, 'Continue to date and time').click()
    assert.equal(
      await page.getByLabel('Reservation date', { exact: true }).inputValue(),
      '2026-10-27',
    )
    await page.keyboard.press('Escape')
    await button(page, 'Reset Filters').click()
    await button(page, 'Saved').click()
    await page.goBack()
    assert.equal(await button(page, 'Browse').getAttribute('aria-current'), 'page')
    await login(page, 'Parking Operator')
    await button(page, 'Add a listing').first().click()
    await button(page, 'Publish preview listing').click()
    await page.getByText('Enter a title of 1–100 characters.', { exact: true }).waitFor()
    const title = 'Test courtyard ' + width
    await page.getByLabel('Listing title', { exact: true }).fill(title)
    await page.getByLabel('Neighborhood', { exact: true }).selectOption('Obrero')
    await page
      .getByLabel('Parking address (fictional for new listings)', { exact: true })
      .fill('Fictional test address, Obrero, Davao City')
    await page
      .getByLabel('Describe your space', { exact: true })
      .fill('A fictional local parking space to try the full marketplace experience.')
    await page.getByLabel('Number of simulated spaces', { exact: true }).fill('3')
    await page.getByLabel('Simulated hourly price (₱)', { exact: true }).fill('28')
    await page
      .getByLabel('Entrance instructions', { exact: true })
      .fill('Illustrative access: follow the marked lane and use your selected bay.')
    await page.getByLabel('Preview photograph (optional)', { exact: true }).setInputFiles({
      name: 'too-large.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(3 * 1024 * 1024),
    })
    await page.getByText('Use a JPG, PNG or WebP up to 2 MB.', { exact: true }).waitFor()
    await page
      .getByLabel('Preview photograph (optional)', { exact: true })
      .setInputFiles('public/images/parking-garage.jpg')
    await fit(page, width)
    await button(page, 'Publish preview listing').click()
    await page.getByRole('status').filter({ hasText: 'Your preview listing was saved.' }).waitFor()
    const areaId = await page.evaluate(
      () => JSON.parse(localStorage.getItem('parkiva-host-listings-v1')).listings[0].id,
    )
    assert.ok((await page.getByText('Local preview photo', { exact: true }).count()) > 0)
    const raw = await page.evaluate(() => localStorage.getItem('parkiva-host-listings-v1'))
    assert.ok(!raw.includes('blob:') && !raw.includes('data:image'))
    await page
      .locator('.host-listing-card')
      .filter({ hasText: title })
      .getByRole('button', { name: /^Edit listing/ })
      .click()
    await page.getByLabel('Simulated hourly price (₱)', { exact: true }).fill('29')
    await button(page, 'Save listing changes').click()
    await page.getByRole('status').filter({ hasText: 'Your preview listing was saved.' }).waitFor()
    await page.reload()
    await button(page, 'My listings').click()
    assert.equal(await page.getByText('Local preview photo', { exact: true }).count(), 0)
    const hostCard = page.locator('.host-listing-card').filter({ hasText: title })
    assert.match(await hostCard.textContent(), /₱29/)
    await hostCard.getByRole('button', { name: /Manage spaces/ }).click()
    await page.getByLabel('Set status for P01', { exact: true }).selectOption('Unavailable')
    await page.getByRole('status').filter({ hasText: 'P01 is now unavailable' }).waitFor()
    await button(page, 'Browse').click()
    await page.getByRole('searchbox').fill(title)
    await openDetails(page, title)
    assert.ok(await page.getByRole('button', { name: /^Slot P01, Car, Unavailable/ }).isDisabled())
    await fit(page, width)
    await page.keyboard.press('Escape')
    await button(page, 'Host workspace').click()
    await button(page, 'Spaces & availability').click()
    await page.locator('#operator-facility').selectOption(areaId)
    await page.getByLabel('Set status for P01', { exact: true }).selectOption('Available')
    await page.getByRole('status').filter({ hasText: 'P01 is now available' }).waitFor()
    await logout(page, 'Parking Operator')
    await login(page, 'Driver')
    await button(page, 'Browse').click()
    await page.getByRole('searchbox').fill(title)
    await button(page, 'Save ' + title).click()
    await openDetails(page, title)
    await schedule(page, '2026-10-26', 'P01')
    await vehicle(page, 'VISIT-' + width)
    await button(page, 'Confirm demo reservation').click()
    await page
      .getByRole('heading', { name: 'Demo reservation confirmation', exact: true })
      .waitFor()
    const ref = await reference(page, 'parkiva-demo-reservations-v1:driver-demo')
    await button(page, 'View demo pass').click()
    await page
      .getByRole('img', { name: 'QR code containing only the demo pass reference' })
      .waitFor()
    await fit(page, width)
    await page.keyboard.press('Escape')
    await logout(page, 'Driver')
    // Shared conflict checks must also block an overlapping guest booking.
    await page.getByRole('searchbox').fill(title)
    await openDetails(page, title)
    await schedule(page, '2026-10-26', 'P01')
    await vehicle(page, 'OTHER-' + width)
    await button(page, 'Confirm demo reservation').click()
    await page.getByRole('alert').filter({ hasText: 'overlaps this slot or vehicle' }).waitFor()
    assert.equal(
      await page.evaluate(() => localStorage.getItem('parkiva-demo-reservations-v1')),
      null,
    )
    await page.keyboard.press('Escape')
    await login(page, 'Parking Operator')
    await button(page, 'Verify a pass').click()
    await button(page, 'Start camera').click()
    await page
      .getByRole('status')
      .filter({
        hasText:
          /Camera QR scanning is not supported|Camera unavailable|camera|Camera|QR decoding/i,
      })
      .first()
      .waitFor()
    if (width === 1280) {
      await page.evaluate(() => {
        window.BarcodeDetector = class {
          static async getSupportedFormats() {
            return ['qr_code']
          }
        }
        navigator.mediaDevices.getUserMedia = async () => {
          throw new DOMException('Denied for test', 'NotAllowedError')
        }
      })
      await button(page, 'Start camera').click()
      await page
        .getByRole('status')
        .filter({ hasText: 'Camera permission was declined.' })
        .waitFor()
    }
    await page
      .getByLabel('Or enter a reservation reference / QR token', { exact: true })
      .fill('DEMO-invalid')
    await button(page, 'Look up pass').click()
    await page.getByRole('alert').filter({ hasText: 'not found' }).waitFor()
    await page.getByLabel('Or enter a reservation reference / QR token', { exact: true }).fill(ref)
    await button(page, 'Look up pass').click()
    await button(page, 'Simulate check-in').click()
    await page.getByRole('alert').filter({ hasText: 'not yet within' }).waitFor()
    await page.clock.setFixedTime(new Date('2026-10-26T10:15:00+08:00'))
    await button(page, 'Simulate check-in').click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Checked in. The simulated bay is now occupied.' })
      .waitFor()
    assert.ok(await button(page, 'Simulate check-in').isDisabled())
    await fit(page, width)
    await page.reload()
    await button(page, 'Spaces & availability').click()
    await page.locator('#operator-facility').selectOption(areaId)
    await page
      .locator('.operator-slot')
      .filter({ hasText: 'P01' })
      .locator('strong')
      .filter({ hasText: 'Occupied' })
      .waitFor()
    await button(page, 'Verify a pass').click()
    await page.getByLabel('Or enter a reservation reference / QR token', { exact: true }).fill(ref)
    await button(page, 'Look up pass').click()
    await page.clock.setFixedTime(new Date('2026-10-26T12:30:00+08:00'))
    await button(page, 'Simulate check-out').click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Checked out. The visit is completed' })
      .waitFor()
    assert.ok(await button(page, 'Simulate check-out').isDisabled())
    await button(page, 'Spaces & availability').click()
    await page
      .locator('.operator-slot')
      .filter({ hasText: 'P01' })
      .locator('strong')
      .filter({ hasText: 'Available' })
      .waitFor()
    await logout(page, 'Parking Operator')
    await login(page, 'Driver')
    await button(page, 'My Reservations').click()
    const completed = page.locator('.reservation-history-card').filter({ hasText: ref })
    await completed.getByText('Completed', { exact: true }).waitFor()
    await completed.getByRole('button', { name: /^View demo pass/ }).click()
    assert.equal(await completed.locator('.demo-pass-qr').count(), 0)
    await fit(page, width)
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }))
    assert.ok(!stored.includes('DriverDemo123!') && !stored.includes('OperatorDemo123!'))
    assert.deepEqual(errors, [])
    console.log(
      'PASS ' +
        width +
        'px: host create/edit/upload limits/persistence, shared Unavailable slot, driver reservation/pass, host lookup/early entry/check-in/late check-out/completed pass, same-browser occupancy release',
    )
    await context.close()
  }
} finally {
  await browser.close()
}
