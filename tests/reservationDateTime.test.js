import test from 'node:test'
import assert from 'node:assert/strict'
import { localDateValue, validateReservationDateTime } from '../src/components/reservationDateTime.js'

const now = new Date(2026, 9, 26, 12, 0)
const valid = { date: '2026-10-27', arrival: '09:00', departure: '10:00' }
const validate = (overrides) => validateReservationDateTime({ ...valid, ...overrides }, now)

test('requires all three fields', () => {
  assert.deepEqual(Object.keys(validate({ date: '', arrival: '', departure: '' })), ['date', 'arrival', 'departure'])
})
test('rejects past and impossible dates', () => {
  assert.ok(validate({ date: '2026-10-25' }).date)
  assert.ok(validate({ date: '2026-02-30' }).date)
  assert.ok(validate({ date: 'invalid' }).date)
})
test('accepts future dates and a future arrival today', () => {
  assert.deepEqual(validate({}), {})
  assert.deepEqual(validate({ date: '2026-10-26', arrival: '12:01', departure: '13:00' }), {})
})
test('rejects elapsed arrival times today, including the current minute', () => {
  assert.ok(validate({ date: '2026-10-26', arrival: '11:59', departure: '13:00' }).arrival)
  assert.ok(validate({ date: '2026-10-26', arrival: '12:00', departure: '13:00' }).arrival)
})
test('requires departure after arrival on the same day', () => {
  for (const departure of ['08:59', '09:00']) assert.ok(validate({ departure }).departure)
  assert.ok(validate({ arrival: '23:00', departure: '01:00' }).departure)
})
test('rejects malformed times', () => {
  assert.ok(validate({ arrival: '24:00' }).arrival)
  assert.ok(validate({ departure: '12:60' }).departure)
})
test('formats dates using local calendar values', () => {
  assert.equal(localDateValue(new Date(2026, 0, 2, 0, 1)), '2026-01-02')
})
