import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Keyboard from 'react-simple-keyboard'
import { editNickname, limitNickname, nicknameCursor, nicknameLength, NICKNAME_LIMIT } from '../../shared/nickname.js'
import { isPinyinPrefix, nicknameLayouts, pinyinCandidates } from './nicknameKeyboard.js'

const PAGE_SIZE = 8
const display = {
  '{shift}': '⇧', '{bksp}': '退格', '{space}': '空格', '{numbers}': '123',
  '{letters}': 'ABC', '{left}': '←', '{right}': '→', '{clear}': '清空',
}
const buttonAttributes = [
  ...Object.entries(display).map(([buttons, value]) => ({ attribute: 'aria-label', value, buttons })),
]

export default function NicknameKeyboard({ value, onChange, onDismiss }) {
  const dialog = useRef(null)
  const input = useRef(null)
  const pendingCaret = useRef(null)
  const [language, setLanguage] = useState('zh')
  const [layout, setLayout] = useState('default')
  const [pinyin, setPinyin] = useState('')
  const [page, setPage] = useState(0)
  const [notice, setNotice] = useState('')
  const candidates = pinyinCandidates(pinyin)
  const pages = Math.ceil(candidates.length / PAGE_SIZE)

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    input.current.focus({ preventScroll: true })
    input.current.setSelectionRange(input.current.value.length, input.current.value.length)
    return () => element.close()
  }, [])

  useEffect(() => {
    if (pendingCaret.current !== null) {
      input.current.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  }, [value])

  function insert(text, backspace = false) {
    const element = input.current
    const edit = editNickname(value, element.selectionStart, element.selectionEnd, text, backspace)
    if (!edit) {
      setNotice(`昵称最多 ${NICKNAME_LIMIT} 个字符，可先删除或选择要替换的文字。`)
      return false
    }
    pendingCaret.current = edit.caret
    onChange(edit.value)
    element.focus({ preventScroll: true })
    // Also restore the caret when an edit leaves the controlled value unchanged.
    if (edit.value === value) {
      element.setSelectionRange(edit.caret, edit.caret)
      pendingCaret.current = null
    }
    setNotice('')
    return true
  }

  function resetPinyin() {
    setPinyin('')
    setPage(0)
    setNotice('')
  }

  function choose(candidate) {
    if (insert(candidate)) resetPinyin()
  }

  function press(button) {
    setNotice('')
    if (button === '{bksp}') {
      if (pinyin) { setPinyin(pinyin.slice(0, -1)); setPage(0) }
      else insert('', true)
    } else if (button === '{clear}') {
      resetPinyin()
      onChange('')
      input.current.focus({ preventScroll: true })
    } else if (button === '{space}' && pinyin) {
      if (candidates.length) choose(candidates[0])
      else setNotice('请补全拼音或取消拼音。')
    } else if (pinyin && button.startsWith('{')) {
      setNotice('请先选择候选字，或取消拼音。')
    } else if (button === '{shift}') {
      if (language === 'en') setLayout(layout === 'shift' ? 'default' : 'shift')
    } else if (button === '{numbers}' || button === '{letters}') {
      setLayout(button === '{numbers}' ? 'numbers' : 'default')
    } else if (button === '{left}' || button === '{right}') {
      const element = input.current
      const caret = nicknameCursor(value, element.selectionStart, element.selectionEnd, button === '{left}' ? -1 : 1)
      element.focus({ preventScroll: true })
      element.setSelectionRange(caret, caret)
    } else if (language === 'zh' && /^[a-z]$/.test(button)) {
      if (isPinyinPrefix(pinyin + button)) { setPinyin(pinyin + button); setPage(0) }
      else setNotice('请先选字，再输入下一个字的拼音。')
    } else if (!button.startsWith('{')) {
      insert(button)
    } else if (button === '{space}') insert(' ')
  }

  function finish() {
    if (pinyin) setNotice('请先选择候选字，或取消拼音后完成。')
    else onDismiss()
  }

  return createPortal(
    <dialog ref={dialog} className="nickname-keyboard" aria-labelledby="nickname-keyboard-title"
      onCancel={(event) => { event.preventDefault(); onDismiss() }}>
      <div className="keyboard-toolbar">
        <h2 id="nickname-keyboard-title">输入昵称</h2>
        <div className="keyboard-languages" role="group" aria-label="输入语言">
          <button type="button" aria-pressed={language === 'zh'} onClick={() => {
            if (pinyin) { setNotice('请先选字或取消拼音，再切换语言。'); return }
            setLanguage('zh'); setLayout('default'); setNotice(''); input.current.focus({ preventScroll: true })
          }}>中文拼音</button>
          <button type="button" aria-pressed={language === 'en'} onClick={() => {
            if (pinyin) { setNotice('请先选字或取消拼音，再切换语言。'); return }
            setLanguage('en'); setLayout('default'); setNotice(''); input.current.focus({ preventScroll: true })
          }}>English</button>
        </div>
        <button type="button" className="keyboard-done" onClick={finish}>完成</button>
      </div>
      <label className="keyboard-input-label" htmlFor="keyboard-nickname">编辑昵称 <span>{nicknameLength(value)} / {NICKNAME_LIMIT}</span></label>
      <input ref={input} id="keyboard-nickname" value={value} inputMode="none" autoComplete="off" spellCheck={false}
        aria-describedby="keyboard-status" placeholder="怎么称呼你？"
        onChange={(event) => {
          resetPinyin()
          onChange(event.nativeEvent.isComposing ? event.target.value : limitNickname(event.target.value))
        }}
        onCompositionEnd={(event) => onChange(limitNickname(event.currentTarget.value))}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return
          if (pinyin && event.key === 'Backspace') { event.preventDefault(); press('{bksp}'); return }
          if (pinyin && event.key === ' ') { event.preventDefault(); press('{space}'); return }
          if (event.key === 'Enter') { event.preventDefault(); if (pinyin && candidates.length) choose(candidates[0]); else finish() }
        }} />
      <div className="keyboard-composition">
        <span aria-label="待选字拼音">{pinyin || (language === 'zh' ? '输入单字拼音，选字后继续；ü 用 v' : 'English · 使用 ⇧ 切换大小写')}</span>
        {pinyin && <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={resetPinyin}>取消拼音</button>}
      </div>
      {language === 'zh' && <div className="keyboard-candidates" role="group" aria-label="中文候选字">
        <button type="button" aria-label="上一页候选字" disabled={page === 0} onPointerDown={(event) => event.preventDefault()} onClick={() => setPage(page - 1)}>‹</button>
        <div className="keyboard-candidate-list">{candidates.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((candidate) =>
          <button type="button" key={candidate} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(candidate)}>{candidate}</button>)}</div>
        <span className="keyboard-candidate-page" aria-label="候选页码">{pages ? `${page + 1}/${pages}` : '—'}</span>
        <button type="button" aria-label="下一页候选字" disabled={page + 1 >= pages} onPointerDown={(event) => event.preventDefault()} onClick={() => setPage(page + 1)}>›</button>
      </div>}
      <Keyboard layout={nicknameLayouts} layoutName={layout} display={display} theme="kiosk-keyboard-keys"
        excludeFromLayout={language === 'zh' ? { default: ['{shift}'] } : {}}
        buttonTheme={[{ class: 'keyboard-key-function', buttons: '{shift} {bksp} {numbers} {letters} {left} {right} {clear}' }]}
        buttonAttributes={buttonAttributes} useButtonTag preventMouseDownDefault disableButtonHold
        disableCaretPositioning enableLayoutCandidates={false} inputPattern={/^$/} onKeyPress={press} />
      <p className="keyboard-status" id="keyboard-status" role="status">{notice || '昵称仅用于本次体验；退出或闲置后清空。'}</p>
    </dialog>, document.body,
  )
}
