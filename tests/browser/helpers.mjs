import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = process.env.PARKIVA_PLAYWRIGHT_PATH
  ? await import(pathToFileURL(process.env.PARKIVA_PLAYWRIGHT_PATH).href)
  : await import('playwright')
export const baseURL = process.env.PARKIVA_BASE_URL || 'http://127.0.0.1:5173'
export const launch = () =>
  chromium.launch({
    headless: true,
    ...(process.env.PARKIVA_CHROMIUM_PATH
      ? { executablePath: process.env.PARKIVA_CHROMIUM_PATH }
      : {}),
  })
export const button = (page, name) =>
  (['Explore', 'Saved', 'My Reservations'].includes(name)
    ? page.getByRole('navigation', { name: 'Main navigation' })
    : page
  ).getByRole('button', {
    name: name === 'Host workspace' ? /^(Host workspace|Workspace)$/ : name,
    exact: true,
  })
export async function fit(page, width) {
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Page overflow at ' + width,
  )
  for (const dialog of await page.getByRole('dialog').all())
    assert.ok(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth),
      'Dialog overflow at ' + width,
    )
}
export async function login(page, role) {
  const host = role === 'Parking Operator'
  if (host) {
    await button(page, 'List your space').click()
    await button(page, 'Host sign in').click()
  } else
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Sign in', exact: true })
      .click()
  await credentials(page, role)
  await page.getByRole('form').getByRole('button', { name: 'Sign in', exact: true }).click()
  await page
    .locator(role === 'Driver' ? '#driver-dashboard-heading' : '#operator-dashboard-heading')
    .waitFor()
}
export async function logout(page, role) {
  await button(page, 'Account').click()
  await button(page, 'Sign out').click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Sign in', exact: true })
    .waitFor()
}
export async function credentials(page, role = 'Driver') {
  const host = role === 'Parking Operator'
  await page
    .getByLabel('Email address', { exact: true })
    .fill(host ? 'operator@parkiva.demo' : 'driver@parkiva.demo')
  await page
    .getByLabel('Password', { exact: true })
    .fill(host ? 'OperatorDemo123!' : 'DriverDemo123!')
}
export async function driverDashboard(page) {
  await button(page, 'Account').click()
  await button(page, 'Your account').click()
}
export const openDetails = (page, name = 'Aldevinco Pay Parking') =>
  button(page, 'View Details for ' + name).click()
export async function schedule(page, date, slot = 'A01', arrival = '10:00', departure = '11:00') {
  await page.getByRole('button', { name: new RegExp('^Slot ' + slot + ', Car, Available') }).click()
  await button(page, 'Continue to date and time').click()
  await page.getByLabel('Reservation date', { exact: true }).fill(date)
  await page.getByLabel('Arrival time', { exact: true }).fill(arrival)
  await page.getByLabel('Departure time', { exact: true }).fill(departure)
  await button(page, 'Continue to vehicle information').click()
}
export async function vehicle(page, plate = 'PREVIEW-123') {
  await page
    .getByRole('form', { name: 'Vehicle information', exact: true })
    .getByLabel('Vehicle type', { exact: true })
    .selectOption('Car')
  await page.getByLabel('Plate number', { exact: true }).fill(plate)
  await button(page, 'Review selection').click()
}
export async function reference(page, key = 'parkiva-demo-reservations-v1') {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).reservations.at(-1).reference,
    key,
  )
}
