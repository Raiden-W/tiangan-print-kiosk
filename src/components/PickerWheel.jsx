import { useId, useLayoutEffect, useRef } from 'react'

const ROW_HEIGHT = 72

export default function PickerWheel({ label, values, value, onChange }) {
  const list = useRef(null)
  const selected = useRef(null)
  const id = useId()
  const index = Math.max(0, values.indexOf(value))
  useLayoutEffect(() => {
    if (selected.current !== value || Math.abs(list.current.scrollTop - index * ROW_HEIGHT) > ROW_HEIGHT) {
      selected.current = value
      list.current.scrollTop = index * ROW_HEIGHT
    }
  }, [value, index, values.length])

  function move(next) {
    const position = Math.max(0, Math.min(values.length - 1, next))
    selected.current = values[position]
    list.current.scrollTo({ top: position * ROW_HEIGHT, behavior: 'instant' })
    onChange(values[position])
  }
  return <div className="wheel-column">
    <span className="wheel-label" id={`${id}-label`}>{label}</span>
    <div className="wheel-frame">
      <div className="wheel-selection" aria-hidden="true" />
      <div ref={list} className="picker-wheel" role="listbox" tabIndex={0} aria-labelledby={`${id}-label`}
        aria-activedescendant={`${id}-${value}`} onScroll={() => {
          const next = values[Math.max(0, Math.min(values.length - 1, Math.round(list.current.scrollTop / ROW_HEIGHT)))]
          if (next !== selected.current) { selected.current = next; onChange(next) }
        }} onKeyDown={(event) => {
          const delta = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 }[event.key]
          if (delta) { event.preventDefault(); move(index + delta) }
          if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); move(event.key === 'Home' ? 0 : values.length - 1) }
        }}>
        {values.map((option, i) => <div key={option} id={`${id}-${option}`} role="option" aria-selected={value === option}
          className="wheel-option" onClick={() => move(i)}>{String(option).padStart(2, '0')}</div>)}
      </div>
    </div>
  </div>
}
