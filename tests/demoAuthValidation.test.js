import test from 'node:test'
import assert from 'node:assert/strict'
import { validateDemoAuth } from '../src/components/demoAuthValidation.js'

test('requires example email for login and demo name for registration', () => {
  assert.deepEqual(Object.keys(validateDemoAuth({ name: '', email: '' }, 'login')), ['email'])
  assert.deepEqual(Object.keys(validateDemoAuth({ name: '  ', email: '' }, 'register')), ['name', 'email'])
})
test('rejects malformed email addresses', () => {
  for (const email of ['guest', 'guest@', '@example.test', 'guest @example.test']) {
    assert.ok(validateDemoAuth({ name: 'Driver', email }, 'login').email)
  }
})
test('accepts valid example fields without requiring or returning credentials', () => {
  assert.deepEqual(validateDemoAuth({ name: '', email: 'guest@example.test' }, 'login'), {})
  assert.deepEqual(validateDemoAuth({ name: ' Demo Driver ', email: ' driver@example.test ' }, 'register'), {})
})
