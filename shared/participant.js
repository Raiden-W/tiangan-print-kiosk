import { parseBirthDate } from './date.js'

export function emptyParticipant() {
  return {
    nickname: '', gender: '', birthDate: '', birthHour: '', birthMinute: '',
    birthCountry: '', birthCity: '', residenceCountry: '', residenceCity: '', birthTimezone: '',
  }
}

export function validateParticipant(form, today) {
  const errors = {}
  if (!form.nickname.trim()) errors.nickname = '请填写昵称。'
  else if (Array.from(form.nickname.trim()).length > 24) errors.nickname = '昵称最多为 24 个字符。'
  try { parseBirthDate(form.birthDate, today) } catch (error) { errors.birthDate = error.message }
  const hasHour = form.birthHour !== ''
  const hasMinute = form.birthMinute !== ''
  if (hasHour !== hasMinute ||
      (hasHour && !/^(?:[01]\d|2[0-3])$/.test(form.birthHour)) ||
      (hasMinute && !/^[0-5]\d$/.test(form.birthMinute))) {
    errors.birthTime = '请同时选择小时与分钟，或同时留空。'
  }
  if (form.birthCountry && !form.birthCity) errors.birthPlace = '请选择出生城市，或清空出生国家。'
  if (form.residenceCountry && !form.residenceCity) errors.residence = '请选择现居城市，或清空现居国家。'
  return errors
}
