import test from 'node:test'
import assert from 'node:assert/strict'
import { validateVehicleInformation } from '../src/components/vehicleInformation.js'

const value = { type: 'Car', plate: 'ABC 1234', model: '' }
test('requires a vehicle type and nonblank plate', () => {
  assert.deepEqual(Object.keys(validateVehicleInformation({ type: '', plate: '   ' }, ['Car'])), ['type', 'plate'])
})
test('rejects a vehicle type unsupported by the chosen facility', () => {
  assert.ok(validateVehicleInformation({ ...value, type: 'Motorcycle' }, ['Car']).type)
  assert.ok(validateVehicleInformation(value, []).type)
})
test('rejects a vehicle that does not match the selected slot', () => {
  assert.ok(validateVehicleInformation(value, ['Car', 'Motorcycle'], 'Motorcycle').type)
})
test('accepts a supported matching vehicle and an optional empty model', () => {
  assert.deepEqual(validateVehicleInformation(value, ['Car'], 'Car'), {})
  assert.deepEqual(validateVehicleInformation({ type: 'Motorcycle', plate: 'XY-123', model: 'Example model' }, ['Motorcycle'], 'Motorcycle'), {})
})
