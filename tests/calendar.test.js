import test from 'node:test'
import assert from 'node:assert/strict'
import { clampBirthDate, daysInMonth, formatCalendarDate } from '../shared/calendar.js'

test('picker clamps end of month on leap and century transitions', () => {
  assert.equal(daysInMonth(2000, 2), 29)
  assert.equal(daysInMonth(1900, 2), 28)
  assert.equal(formatCalendarDate(2000, 2, 31), '2000-02-29')
  assert.equal(formatCalendarDate(2001, 2, 29), '2001-02-28')
  assert.equal(formatCalendarDate(2000, 4, 31), '2000-04-30')
})

test('wheels keep leap-day and future dates valid as year and month change', () => {
  assert.deepEqual(clampBirthDate({ year: 2001, month: 2, day: 29 }, '2026-10-27'), { year: 2001, month: 2, day: 28 })
  assert.deepEqual(clampBirthDate({ year: 2026, month: 12, day: 31 }, '2026-10-27'), { year: 2026, month: 10, day: 27 })
  assert.deepEqual(clampBirthDate({ year: 1899, month: 2, day: 29 }, '2026-10-27'), { year: 1900, month: 2, day: 28 })
})
