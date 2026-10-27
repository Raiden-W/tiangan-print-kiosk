import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Stay inside the fixed app canvas instead of the browser's dialog top layer.
export default function FloatingPanel({ anchor, className, labelledBy, onDismiss, children }) {
  const panel = useRef(null)
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onDismiss, 160)
    return () => clearTimeout(timer)
  }, [closing, onDismiss])
  function dismiss() {
    setClosing(true)
  }
  useLayoutEffect(() => {
    const element = panel.current
    const container = element.parentElement
    function position() {
      const bounds = container.getBoundingClientRect()
      const left = (bounds.width - element.offsetWidth) / 2
      const top = (bounds.height - element.offsetHeight) / 2
      element.style.left = `${Math.max(24, Math.min(left, bounds.width - element.offsetWidth - 24))}px`
      element.style.top = `${Math.max(24, Math.min(top, bounds.height - element.offsetHeight - 32))}px`
    }
    position()
    const observer = new ResizeObserver(position)
    observer.observe(container)
    observer.observe(element)
    const focus = element.querySelector('[data-autofocus], button, input, [tabindex="0"]')
    focus?.focus({ preventScroll: true })
    return () => {
      observer.disconnect()
      // React removes inert from the form after this layout cleanup.
      queueMicrotask(() => { if (anchor?.isConnected) anchor.focus({ preventScroll: true }) })
    }
  }, [anchor])

  function handleKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); return }
    if (event.key !== 'Tab') return
    const controls = [...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')]
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  return <div className={`floating-layer${closing ? ' floating-closing' : ''}`} onKeyDown={handleKey}>
    <div ref={panel} className="floating-position">
      <div className={`floating-panel ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} inert={closing}>
        {typeof children === 'function' ? children(dismiss) : children}
      </div>
    </div>
  </div>
}
