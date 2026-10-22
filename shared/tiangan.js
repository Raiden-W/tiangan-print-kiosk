import lunar from 'lunar-javascript'
import { parseBirthDate } from './date.js'

export function calculateDayStem(birthDate, today) {
  const { year, month, day } = parseBirthDate(birthDate, today)
  return lunar.Solar.fromYmd(year, month, day).getLunar().getDayGan()
}
