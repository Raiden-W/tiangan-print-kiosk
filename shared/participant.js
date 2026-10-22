import { parseBirthDate } from './date.js'
import { locationError } from './locations.js'
import { nicknameLength, NICKNAME_LIMIT } from './nickname.js'

export function emptyParticipant() {
  return {
    nickname: '', gender: '', birthDate: '', birthHour: '', birthMinute: '',
    birthCountry: '', birthProvince: '', birthCity: '',
    residenceCountry: '', residenceProvince: '', residenceCity: '', birthTimezone: '',
  }
}

export function validateParticipant(form, today) {
  const errors = {}
  if (!form.nickname.trim()) errors.nickname = '请填写昵称。'
  else if (nicknameLength(form.nickname.trim()) > NICKNAME_LIMIT) errors.nickname = `昵称最多为 ${NICKNAME_LIMIT} 个字符。`
  try { parseBirthDate(form.birthDate, today) } catch (error) { errors.birthDate = error.message }
  const hasHour = form.birthHour !== ''
  const hasMinute = form.birthMinute !== ''
  if (hasHour !== hasMinute ||
      (hasHour && !/^(?:[01]\d|2[0-3])$/.test(form.birthHour)) ||
      (hasMinute && !/^[0-5]\d$/.test(form.birthMinute))) {
    errors.birthTime = '请同时选择小时与分钟，或同时留空。'
  }
  const birthPlaceError = locationError(form.birthCountry, form.birthProvince, form.birthCity)
  const residenceError = locationError(form.residenceCountry, form.residenceProvince, form.residenceCity)
  if (birthPlaceError) errors.birthPlace = `出生地点：${birthPlaceError}`
  if (residenceError) errors.residence = `现居地：${residenceError}`
  return errors
}
