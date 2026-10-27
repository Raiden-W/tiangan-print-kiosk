import { parseBirthDate } from './date.js'
import { nicknameLength, NICKNAME_LIMIT } from './nickname.js'

export const BIRTHPLACE_LIMIT = 120

export function emptyParticipant() {
  return {
    nickname: '', gender: '', birthDate: '', birthHour: '', birthMinute: '', birthplace: '',
  }
}

export function validateParticipant(form, today) {
  const errors = {}
  if (!['male', 'female'].includes(form?.gender)) errors.gender = '请选择性别。'
  if (typeof form?.nickname !== 'string' || !form.nickname.trim()) errors.nickname = '请填写昵称。'
  else if (nicknameLength(form.nickname.trim()) > NICKNAME_LIMIT) errors.nickname = `昵称最多为 ${NICKNAME_LIMIT} 个字符。`
  try { parseBirthDate(form?.birthDate, today) } catch (error) { errors.birthDate = error.message }
  if (typeof form?.birthHour !== 'string' || !/^(?:[01]\d|2[0-3])$/.test(form.birthHour) ||
      typeof form?.birthMinute !== 'string' || !/^[0-5]\d$/.test(form.birthMinute)) {
    errors.birthTime = '请选择完整的出生小时和分钟。'
  }
  if (typeof form?.birthplace !== 'string' || !form.birthplace.trim()) errors.birthplace = '请填写出生地点。'
  else if (nicknameLength(form.birthplace.trim()) > BIRTHPLACE_LIMIT) errors.birthplace = `出生地点最多 ${BIRTHPLACE_LIMIT} 个字符。`
  return errors
}

// Whitelist fields at the process boundary; do not forward arbitrary renderer data.
export function normalizeParticipant(form, today) {
  if (Object.keys(validateParticipant(form, today)).length) throw new Error('Invalid participant')
  return {
    nickname: form.nickname.trim(), gender: form.gender, birthDate: form.birthDate,
    birthHour: form.birthHour, birthMinute: form.birthMinute, birthplace: form.birthplace.trim(),
  }
}
