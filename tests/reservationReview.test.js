import test from 'node:test'
import assert from 'node:assert/strict'
import { validateReservationReview } from '../src/components/reservationReviewValidation.js'

const now = new Date(2026, 9, 26, 12)
const valid = {
  facility: { id: 'demo', name: 'Demo Parking', location: 'Example District', vehicles: ['Car'] },
  slots: [{ id: 'A01', vehicle: 'Car', status: 'Available' }],
  selectedId: 'A01',
  dateTime: { date: '2026-10-27', arrival: '09:00', departure: '10:00' },
  vehicle: { type: 'Car', plate: 'ABC 123', model: '' },
}
const validate = (overrides = {}, time = now) => validateReservationReview({ ...valid, ...overrides }, time)
test('allows a complete valid review with optional make/model blank', () => {
  assert.deepEqual(validate(), [])
})
test('blocks incomplete facility details and missing or foreign slots', () => {
  assert.equal(validate({ facility: undefined })[0].step, 'slots')
  assert.equal(validate({ facility: { ...valid.facility, location: '' } })[0].step, 'slots')
  assert.equal(validate({ selectedId: undefined })[0].step, 'slots')
  assert.equal(validate({ selectedId: 'other-facility-slot' })[0].step, 'slots')
})
test('blocks a slot that becomes reserved or occupied', () => {
  for (const status of ['Reserved', 'Occupied']) {
    assert.equal(validate({ slots: [{ ...valid.slots[0], status }] })[0].step, 'slots')
  }
})
test('blocks missing and invalid date/time information', () => {
  for (const dateTime of [{}, { ...valid.dateTime, date: '2026-10-25' }, { ...valid.dateTime, departure: '08:00' }]) {
    assert.ok(validate({ dateTime }).some((issue) => issue.step === 'datetime'))
  }
})
test('blocks missing, unsupported, and incompatible vehicle information', () => {
  for (const vehicle of [{}, { type: 'Car', plate: ' ' }, { type: 'Motorcycle', plate: 'ABC' }]) {
    assert.ok(validate({ vehicle }).some((issue) => issue.step === 'vehicle'))
  }
  assert.ok(validate({ slots: [{ ...valid.slots[0], vehicle: 'Motorcycle' }] }).some((issue) => issue.step === 'vehicle'))
})
test('revalidates an arrival that has elapsed while reviewing', () => {
  assert.deepEqual(validate(), [])
  assert.ok(validate({}, new Date(2026, 9, 27, 9)).some((issue) => issue.step === 'datetime'))
})
