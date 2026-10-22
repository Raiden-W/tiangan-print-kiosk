import test from 'node:test'
import assert from 'node:assert/strict'
import { initialSession, sessionReducer } from '../shared/session.js'
import { isTrustedRendererURL } from '../electron/security.js'

test('reset clears participant data, result and errors before the next experience', () => {
  let state = sessionReducer(initialSession(), { type: 'start' })
  state = sessionReducer(state, { type: 'change', fields: { nickname: 'PRIVATE', birthDate: '2000-01-01', birthCity: 'shanghai' } })
  state = sessionReducer(state, { type: 'result', result: { stem: '戊' } })
  state = sessionReducer(state, { type: 'invalid', errors: { form: 'Previous error' } })
  assert.deepEqual(sessionReducer(state, { type: 'reset' }), initialSession())
  assert.deepEqual(sessionReducer(state, { type: 'start' }), { ...initialSession(), page: 'discover' })
})

test('only the exact renderer document is allowed, with an optional hash', () => {
  const development = 'http://127.0.0.1:5173'
  assert.equal(isTrustedRendererURL(`${development}/#result`, development), true)
  for (const url of ['https://example.com', 'http://localhost:5173', `${development}/other`, `${development}/?extra=1`, 'not a URL']) {
    assert.equal(isTrustedRendererURL(url, development), false, url)
  }
  const production = 'file:///E:/kiosk/dist/index.html'
  assert.equal(isTrustedRendererURL(`${production}#welcome`, production), true)
  assert.equal(isTrustedRendererURL('file:///E:/private.txt', production), false)
})
