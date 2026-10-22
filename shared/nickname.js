export const NICKNAME_LIMIT = 24

const segments = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })

export function nicknameLength(value) {
  return Array.from(value).length
}

export function limitNickname(value) {
  return Array.from(value).slice(0, NICKNAME_LIMIT).join('')
}

// DOM selections use UTF-16 offsets; deletion and cursor movement use whole graphemes.
export function nicknameCursor(value, start, end, direction) {
  if (start !== end) return direction < 0 ? start : end
  const boundaries = [...segments.segment(value)].map(({ index }) => index).concat(value.length)
  return direction < 0
    ? (boundaries.filter((index) => index < start).at(-1) ?? 0)
    : (boundaries.find((index) => index > end) ?? value.length)
}

export function editNickname(value, start, end, text, backspace = false) {
  if (backspace && start === end) start = nicknameCursor(value, start, end, -1)
  const next = value.slice(0, start) + text + value.slice(end)
  if (nicknameLength(next) > NICKNAME_LIMIT) return null
  return { value: next, caret: start + text.length }
}
