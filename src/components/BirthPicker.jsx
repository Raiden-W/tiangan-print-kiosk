import { useState } from 'react'
import FloatingPanel from './FloatingPanel.jsx'
import PickerWheel from './PickerWheel.jsx'
import { localToday } from '../../shared/date.js'
import { clampBirthDate, daysInMonth, formatCalendarDate } from '../../shared/calendar.js'

const names = { year: '年份', month: '月份', day: '日期', hour: '小时', minute: '分钟' }
const pad = (value) => String(value).padStart(2, '0')
const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i)

export default function BirthPicker({ mode, participant, anchor, onChange, onDismiss }) {
  const today = localToday()
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number)
  const [year, month, day] = (participant.birthDate || '1995-01-01').split('-').map(Number)
  const [draft, setDraft] = useState({ ...clampBirthDate({ year, month, day }, today), hour: Number(participant.birthHour || 12), minute: Number(participant.birthMinute || 0) })
  const keys = mode === 'date' ? ['year', 'month', 'day'] : ['hour', 'minute']
  const values = {
    year: range(1900, todayYear),
    month: range(1, draft.year === todayYear ? todayMonth : 12),
    day: range(1, draft.year === todayYear && draft.month === todayMonth ? todayDay : daysInMonth(draft.year, draft.month)),
    hour: range(0, 23), minute: range(0, 59),
  }
  function choose(key, value) {
    setDraft((current) => {
      const next = { ...current, [key]: value }
      return { ...next, ...clampBirthDate(next, today) }
    })
  }
  function finish(dismiss) {
    if (mode === 'date') onChange({ birthDate: formatCalendarDate(draft.year, draft.month, draft.day) })
    else onChange({ birthHour: pad(draft.hour), birthMinute: pad(draft.minute) })
    dismiss()
  }
  return <FloatingPanel className="birth-picker" anchor={anchor} labelledBy="birth-picker-title" onDismiss={onDismiss}>
    {(dismiss) => <>
    <div className="picker-heading"><h2 id="birth-picker-title">选择出生{mode === 'date' ? '日期' : '时间'}</h2>
      <button type="button" onClick={dismiss}>取消</button></div>
    <p className="picker-hint">上下滑动滚轮，或使用鼠标滚轮选择</p>
    <div className="picker-wheels">{keys.map((key) => <PickerWheel key={key} label={names[key]} values={values[key]} value={draft[key]}
      onChange={(value) => choose(key, value)} />)}</div>
    <div className="picker-footer"><span>{mode === 'date' ? formatCalendarDate(draft.year, draft.month, draft.day) : `${pad(draft.hour)}:${pad(draft.minute)}`}</span>
      <button type="button" onClick={() => finish(dismiss)}>确认{mode === 'date' ? '日期' : '时间'}</button></div>
    </>}
  </FloatingPanel>
}
