import { useState } from 'react'
import NicknameKeyboard from './NicknameKeyboard.jsx'
import { limitNickname } from '../../shared/nickname.js'

export default function NicknameField({ value, error, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="field">
      <label htmlFor="nickname"><span className="field-number">01</span>昵称 <span className="required">*</span></label>
      <div className="nickname-input-row">
        <input id="nickname" name="nickname" value={value} placeholder="怎么称呼你？" inputMode="none"
          spellCheck={false} autoComplete="off" aria-required="true" aria-invalid={Boolean(error)}
          aria-describedby={error ? 'nickname-error nickname-hint' : 'nickname-hint'}
          onClick={() => setOpen(true)}
          onChange={(event) => onChange(event.nativeEvent.isComposing ? event.target.value : limitNickname(event.target.value))}
          onCompositionEnd={(event) => onChange(limitNickname(event.currentTarget.value))} />
        <button type="button" className="nickname-keyboard-trigger" aria-label="打开昵称触摸键盘" aria-haspopup="dialog" onClick={() => setOpen(true)}>键盘</button>
      </div>
      <p className="field-hint" id="nickname-hint">点击输入昵称，支持中文拼音 / English，最多 50 个字符。</p>
      {error && <p className="field-error" id="nickname-error">{error}</p>}
      {open && <NicknameKeyboard value={value} onChange={onChange} onDismiss={() => setOpen(false)} />}
    </div>
  )
}
