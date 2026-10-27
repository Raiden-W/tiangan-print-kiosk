import { useState } from 'react'
import NicknameKeyboard from '../components/NicknameKeyboard.jsx'
import BirthPicker from '../components/BirthPicker.jsx'
import ElementIcon from '../components/ElementIcon.jsx'
import OrnateButton from '../components/OrnateButton.jsx'
import GenderPicker from '../components/GenderPicker.jsx'
import AnalysisLoading from '../components/AnalysisLoading.jsx'
import { limitNickname, NICKNAME_LIMIT } from '../../shared/nickname.js'
import { BIRTHPLACE_LIMIT } from '../../shared/participant.js'

export default function Discover({ participant: form, errors, pending, onChange, onSubmit, onBack }) {
  const [editing, setEditing] = useState(null)
  const [picker, setPicker] = useState(null)
  const date = form.birthDate ? form.birthDate.split('-') : ['', '', '']
  const field = (key, label, english, limit) => <div className={`field ${key}-field`}>
    <label htmlFor={key}>{label} / {english}</label>
    <input id={key} value={form[key]} inputMode="none" autoComplete="off" spellCheck={false}
      aria-required="true" aria-invalid={Boolean(errors[key])}
      aria-describedby={errors[key] ? `${key}-error` : undefined}
      onClick={(event) => setEditing({ key, anchor: event.currentTarget })}
      onChange={(event) => onChange({ [key]: event.nativeEvent.isComposing ? event.target.value : limitNickname(event.target.value, limit) })}
      onCompositionEnd={(event) => onChange({ [key]: limitNickname(event.currentTarget.value, limit) })} />
    {errors[key] && <p className="field-error" id={`${key}-error`}>{errors[key]}</p>}
  </div>
  return <section className={`discover-page page${editing ? ' has-keyboard' : ''}`} aria-labelledby="discover-title">
    <h1 className="stack-title" id="discover-title">DISCOVER<br />YOUR<br />ELEMENT</h1>
    <form className="discovery-form" inert={Boolean(editing || picker || pending)} noValidate autoComplete="off" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
      <fieldset className="form-fields" disabled={pending}>
        {field('nickname', '昵称', 'NAME', NICKNAME_LIMIT)}
        <div className="field gender-field"><label htmlFor="gender">性别 / GENDER</label>
          <button id="gender" type="button" className="input-button" aria-required="true" aria-invalid={Boolean(errors.gender)}
            onClick={(event) => setPicker({ mode: 'gender', anchor: event.currentTarget })}>{form.gender === 'male' ? '男' : form.gender === 'female' ? '女' : ''}</button>
          {errors.gender && <p className="field-error">{errors.gender}</p>}
        </div>
        <div className="date-time-row">
          <div className="field date-field"><label>出生日期 / DATE</label>
            <div className="date-buttons">{['年', '月', '日'].map((label, i) => <button type="button" key={label}
              className="input-button" aria-label={`选择出生${label}`} aria-invalid={Boolean(errors.birthDate)} onClick={(event) => setPicker({ mode: 'date', anchor: event.currentTarget })}>
              {date[i] || label}</button>)}</div>
            {errors.birthDate && <p className="field-error">{errors.birthDate}</p>}
          </div>
          <div className="field time-field"><label htmlFor="birth-time">出生时间 / TIME</label>
            <button type="button" id="birth-time" className="input-button" aria-invalid={Boolean(errors.birthTime)} onClick={(event) => setPicker({ mode: 'time', anchor: event.currentTarget })}>
              {form.birthHour && form.birthMinute ? `${form.birthHour}:${form.birthMinute}` : ''}</button>
            {errors.birthTime && <p className="field-error">{errors.birthTime}</p>}
          </div>
        </div>
        {field('birthplace', '出生地点', 'BIRTHPLACE', BIRTHPLACE_LIMIT)}
      </fieldset>
      <div className="form-feedback" role="status" aria-live="polite">{errors.form || (Object.keys(errors).length ? '请补全上方标出的信息。' : '')}</div>
      <div className="element-strip" aria-hidden="true">{['金', '木', '水', '火', '土'].map((element) => <ElementIcon key={element} element={element} />)}</div>
      <OrnateButton className="discover-next" type="submit" disabled={pending}>{pending ? 'DISCOVERING…' : 'NEXT STEP'}</OrnateButton>
      <button className="text-button discover-back" type="button" onClick={onBack}>{pending ? '取消，返回首页' : '返回首页'}</button>
    </form>
    {editing && <NicknameKeyboard key={editing.key} anchor={editing.anchor} label={editing.key === 'nickname' ? '昵称' : '出生地点'}
      limit={editing.key === 'nickname' ? NICKNAME_LIMIT : BIRTHPLACE_LIMIT} value={form[editing.key]}
      onChange={(value) => onChange({ [editing.key]: value })} onDismiss={() => setEditing(null)} />}
    {picker?.mode === 'gender' && <GenderPicker value={form.gender} anchor={picker.anchor} onChange={onChange} onDismiss={() => setPicker(null)} />}
    {picker && picker.mode !== 'gender' && <BirthPicker mode={picker.mode} anchor={picker.anchor} participant={form} onChange={onChange} onDismiss={() => setPicker(null)} />}
    {pending && <AnalysisLoading onCancel={onBack} />}
  </section>
}
