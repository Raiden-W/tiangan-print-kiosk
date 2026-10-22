export const MIN_BIRTH_DATE = '1900-01-01'

export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseBirthDate(value, today = localToday()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('请选择完整的公历出生日期。')
  }
  const [year, month, day] = value.split('-').map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
    throw new Error('出生日期不存在，请检查年月日。')
  }
  if (value < MIN_BIRTH_DATE || value > today) {
    throw new Error('出生日期须在 1900 年 1 月 1 日至今天之间。')
  }
  return { year, month, day }
}
