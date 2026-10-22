import test from 'node:test'
import assert from 'node:assert/strict'
import { localToday, parseBirthDate } from '../shared/date.js'
import { emptyParticipant, validateParticipant } from '../shared/participant.js'

const TODAY = '2026-10-22'

test('validates Gregorian leap days and the supported birth-date interval', () => {
  assert.deepEqual(parseBirthDate('2000-02-29', TODAY), { year: 2000, month: 2, day: 29 })
  assert.deepEqual(parseBirthDate('1900-01-01', TODAY), { year: 1900, month: 1, day: 1 })
  for (const value of ['', '2000-2-1', '1900-02-29', '2001-02-29', '2020-04-31', '2020-00-20', '2020-13-01', '1899-12-31', '2026-10-23']) {
    assert.throws(() => parseBirthDate(value, TODAY), undefined, value)
  }
})

test('local today uses calendar fields rather than UTC serialization', () => {
  const date = { getFullYear: () => 2026, getMonth: () => 0, getDate: () => 2,
    toISOString: () => { throw new Error('Must not serialize a local calendar date as UTC') } }
  assert.equal(localToday(date), '2026-01-02')
})

test('only nickname and birthday are required; partial optional values are rejected', () => {
  const form = { ...emptyParticipant(), nickname: '  LILY  ', birthDate: '1986-05-29' }
  assert.deepEqual(validateParticipant(form, TODAY), {})
  assert.ok(validateParticipant({ ...form, nickname: '   ' }, TODAY).nickname)
  assert.ok(validateParticipant({ ...form, nickname: '甲'.repeat(25) }, TODAY).nickname)
  assert.equal(validateParticipant({ ...form, nickname: '🪨'.repeat(24) }, TODAY).nickname, undefined)
  assert.ok(validateParticipant({ ...form, birthHour: '23' }, TODAY).birthTime)
  assert.ok(validateParticipant({ ...form, birthHour: '24', birthMinute: '00' }, TODAY).birthTime)
  assert.equal(validateParticipant({ ...form, birthHour: '23', birthMinute: '59' }, TODAY).birthTime, undefined)
  assert.ok(validateParticipant({ ...form, birthCountry: 'CN' }, TODAY).birthPlace)
})
