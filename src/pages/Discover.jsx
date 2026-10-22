import LocationFields from '../components/LocationFields.jsx'
import { localToday, MIN_BIRTH_DATE } from '../../shared/date.js'
import locations from '../../content/locations.json'

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

export default function Discover({ participant: form, errors, onChange, onSubmit, onBack }) {
  return (
    <section className="discover-page" aria-labelledby="discover-title">
      <p className="eyebrow">DISCOVER YOUR ELEMENT</p>
      <h1 className="page-title" id="discover-title">填写出生信息，<br />探索属于你的天干与幸运串珠。</h1>
      <p className="form-note">昵称与出生日期为必填项，其余选填。本次仅使用公历出生日期计算日干。</p>
      <form className="discovery-form" autoComplete="off" noValidate onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
        <div className="field">
          <label htmlFor="nickname"><span className="field-number">01</span>昵称 <span className="required">*</span></label>
          <input id="nickname" name="nickname" value={form.nickname} placeholder="怎么称呼你？" maxLength={48}
            spellCheck={false} autoComplete="off" aria-required="true" aria-invalid={Boolean(errors.nickname)}
            aria-describedby={errors.nickname ? 'nickname-error' : undefined}
            onChange={(event) => onChange({ nickname: event.target.value })} />
          {errors.nickname && <p className="field-error" id="nickname-error">{errors.nickname}</p>}
        </div>
        <fieldset className="field gender-field">
          <legend><span className="field-number">02</span>性别 <span className="optional">选填</span></legend>
          <div className="gender-options">{['男', '女'].map((gender) => <label className="choice" key={gender}>
            <input type="radio" name="gender" value={gender} checked={form.gender === gender} onChange={() => onChange({ gender })} />
            <span>{gender}</span>
          </label>)}<button type="button" className="clear-choice" onClick={() => onChange({ gender: '' })}>清空</button></div>
        </fieldset>
        <div className="field">
          <label htmlFor="birth-date"><span className="field-number">03</span>出生日期 <span className="required">*</span></label>
          <input id="birth-date" name="birthDate" type="date" min={MIN_BIRTH_DATE} max={localToday()} value={form.birthDate}
            aria-required="true" aria-invalid={Boolean(errors.birthDate)} aria-describedby={errors.birthDate ? 'date-error' : undefined}
            onChange={(event) => onChange({ birthDate: event.target.value })} />
          {errors.birthDate && <p className="field-error" id="date-error">{errors.birthDate}</p>}
        </div>
        <fieldset className="field">
          <legend><span className="field-number">04</span>出生时间 <span className="optional">选填</span></legend>
          <div className="input-pair">
            <select aria-label="出生小时" aria-invalid={Boolean(errors.birthTime)} value={form.birthHour} onChange={(event) => onChange({ birthHour: event.target.value })}>
              <option value="">小时</option>{hours.map((hour) => <option key={hour} value={hour}>{hour} 时</option>)}
            </select>
            <select aria-label="出生分钟" aria-invalid={Boolean(errors.birthTime)} value={form.birthMinute} onChange={(event) => onChange({ birthMinute: event.target.value })}>
              <option value="">分钟</option>{minutes.map((minute) => <option key={minute} value={minute}>{minute} 分</option>)}
            </select>
          </div>
          {errors.birthTime && <p className="field-error">{errors.birthTime}</p>}
        </fieldset>
        <fieldset className="field">
          <legend><span className="field-number">05</span>出生地点 <span className="optional">选填</span></legend>
          <LocationFields prefix="出生地" country={form.birthCountry} city={form.birthCity}
            onChange={(birthCountry, birthCity, birthTimezone) => onChange({ birthCountry, birthCity, birthTimezone })} />
          {errors.birthPlace && <p className="field-error">{errors.birthPlace}</p>}
        </fieldset>
        <fieldset className="field">
          <legend><span className="field-number">06</span>现居地 <span className="optional">选填</span></legend>
          <LocationFields prefix="现居地" country={form.residenceCountry} city={form.residenceCity}
            onChange={(residenceCountry, residenceCity) => onChange({ residenceCountry, residenceCity })} />
          {errors.residence && <p className="field-error">{errors.residence}</p>}
        </fieldset>
        <div className="field timezone-field">
          <label htmlFor="birth-timezone"><span className="field-number">07</span>出生地时区 <span className="optional">选填</span></label>
          <select id="birth-timezone" value={form.birthTimezone} onChange={(event) => onChange({ birthTimezone: event.target.value })}>
            <option value="">选择城市后自动建议，也可手动选择</option>
            {locations.timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
          </select>
          <p className="field-hint">时区仅作信息收集，不修正出生日期。地点选项暂为示例城市。</p>
        </div>
        {Object.keys(errors).length > 0 && <p className="form-error" role="alert">{errors.form || '请检查上方标出的信息后再试。'}</p>}
        <div className="form-actions"><button type="button" className="button secondary" onClick={onBack}>返回</button>
          <button type="submit" className="button primary">开始测试 <span aria-hidden="true">↗</span></button></div>
      </form>
    </section>
  )
}
