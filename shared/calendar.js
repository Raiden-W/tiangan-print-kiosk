export function daysInMonth(year, month) {
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
}

export function formatCalendarDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, daysInMonth(year, month))).padStart(2, '0')}`
}

export function clampBirthDate({ year, month, day }, today) {
  const [maxYear, maxMonth, maxDay] = today.split('-').map(Number)
  year = Math.max(1900, Math.min(year, maxYear))
  month = Math.max(1, Math.min(month, year === maxYear ? maxMonth : 12))
  day = Math.max(1, Math.min(day, daysInMonth(year, month), year === maxYear && month === maxMonth ? maxDay : 31))
  return { year, month, day }
}
