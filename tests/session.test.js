import test from 'node:test'
import assert from 'node:assert/strict'
import { initialSession, sessionReducer } from '../shared/session.js'
import { isTrustedRendererURL, assertMainSender } from '../electron/security.js'

test('reset clears participant data, result and errors before the next experience', () => {
  let state = sessionReducer(initialSession(), { type: 'start' })
  state = sessionReducer(state, { type: 'change', fields: { nickname: 'PRIVATE', gender: 'female', birthDate: '2000-01-01', birthCity: 'shanghai' } })
  state = sessionReducer(state, { type: 'request', requestId: 'current' })
  state = sessionReducer(state, { type: 'result', requestId: 'current', resultId: 'snapshot', result: { stem: '戊' } })
  state = sessionReducer(state, { type: 'invalid', errors: { form: 'Previous error' } })
  assert.deepEqual(sessionReducer(state, { type: 'reset' }), initialSession())
  assert.deepEqual(sessionReducer(state, { type: 'start' }), { ...initialSession(), page: 'discover' })
})

test('late replies cannot enter a reset or newer session, pending input is locked', () => {
  let state = sessionReducer(initialSession(), { type: 'start' })
  state = sessionReducer(state, { type: 'request', requestId: 'first' })
  assert.equal(sessionReducer(state, { type: 'change', fields: { nickname: 'late edit' } }), state)
  const reset = sessionReducer(state, { type: 'reset' })
  assert.equal(sessionReducer(reset, { type: 'result', requestId: 'first', result: {} }), reset)
  state = sessionReducer(reset, { type: 'request', requestId: 'second' })
  assert.equal(sessionReducer(state, { type: 'failure', requestId: 'first', message: 'old failure' }), state)
  assert.equal(sessionReducer(state, { type: 'result', requestId: 'first', result: {} }), state)
  state = sessionReducer(state, { type: 'result', requestId: 'second', resultId: 'id', result: { stem: '辛' } })
  assert.equal(sessionReducer(state, { type: 'receipt' }).page, 'receipt')
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

test('privileged IPC rejects other windows and child frames even at a matching URL', () => {
  const url = 'file:///E:/kiosk/dist/index.html'
  const frame = { url }
  const contents = { mainFrame: frame }
  const window = { webContents: contents }
  assert.doesNotThrow(() => assertMainSender({ sender: contents, senderFrame: frame }, window, url))
  assert.throws(() => assertMainSender({ sender: {}, senderFrame: frame }, window, url))
  assert.throws(() => assertMainSender({ sender: contents, senderFrame: { url } }, window, url))
  assert.throws(() => assertMainSender({ sender: contents, senderFrame: frame }, null, url))
})
