import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import Welcome from './pages/Welcome.jsx'
import Discover from './pages/Discover.jsx'
import Result from './pages/Result.jsx'
import Receipt from './pages/Receipt.jsx'
import PageTransition from './components/PageTransition.jsx'
import { analyzeBirthInfo, cancelAnalysis, clearSession, getRuntimeInfo, prepareTestTicket, printTestTicket, previewTicket } from './services/platform.js'
import { initialSession, sessionReducer } from '../shared/session.js'
import { validateParticipant } from '../shared/participant.js'

const IDLE_TIMEOUT_MS = 120_000

export default function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, initialSession)
  const [runtime, setRuntime] = useState(null)
  const [printStatus, setPrintStatus] = useState('idle')
  const [printing, setPrinting] = useState(false)
  const [ticket, setTicket] = useState(null)
  const request = useRef(null)
  const generation = useRef(0)
  const printLock = useRef(false)
  const resetSession = useCallback(() => {
    generation.current += 1
    if (request.current) void cancelAnalysis(request.current).catch(() => {})
    request.current = null
    printLock.current = false
    void clearSession().catch(() => {})
    setPrinting(false)
    setPrintStatus('idle')
    setTicket(null)
    dispatch({ type: 'reset' })
  }, [])

  useEffect(() => {
    // Warm local artwork before later pages mount, so the timed paper feed never waits on an image.
    for (const filename of ['background page01.png', 'background page02&03.png', 'background page04.png', 'pos paper layer.png', 'circle arrows.png']) {
      const artwork = new Image()
      artwork.src = `./ui/elements/${filename}`
    }
  }, [])

  useEffect(() => {
    let active = true
    getRuntimeInfo().then((info) => { if (active) setRuntime(info) })
      .catch(() => { if (active) setRuntime({ mode: 'unavailable' }) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (state.page === 'welcome' || printing) return
    let timer
    const restart = () => { clearTimeout(timer); timer = setTimeout(resetSession, IDLE_TIMEOUT_MS) }
    restart()
    window.addEventListener('pointerdown', restart)
    window.addEventListener('pointerup', restart)
    window.addEventListener('touchmove', restart, { passive: true })
    window.addEventListener('keydown', restart)
    window.addEventListener('input', restart)
    window.addEventListener('wheel', restart, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', restart)
      window.removeEventListener('pointerup', restart)
      window.removeEventListener('touchmove', restart)
      window.removeEventListener('keydown', restart)
      window.removeEventListener('input', restart)
      window.removeEventListener('wheel', restart)
    }
  }, [state.page, printing, resetSession])

  async function discover() {
    if (request.current) return
    const errors = validateParticipant(state.participant)
    if (Object.keys(errors).length) return dispatch({ type: 'invalid', errors })
    const requestId = crypto.randomUUID()
    request.current = requestId
    dispatch({ type: 'request', requestId })
    try {
      const response = await analyzeBirthInfo(requestId, state.participant)
      if (request.current !== requestId) return
      if (response.ok) dispatch({ type: 'result', requestId, resultId: response.resultId, result: response.result })
      else dispatch({ type: 'failure', requestId, message: response.message })
    } catch {
      if (request.current === requestId) dispatch({ type: 'failure', requestId, message: '暂时无法连接测算服务，请重试。' })
    } finally {
      if (request.current === requestId) request.current = null
    }
  }

  async function print() {
    if (printLock.current || !state.result) return
    dispatch({ type: 'receipt' })
    if (runtime?.mode !== 'desktop') { setPrintStatus('preview'); return }
    const current = generation.current
    printLock.current = true
    setPrinting(true)
    setPrintStatus('preparing')
    let submitted = false
    try {
      const prepared = await prepareTestTicket(state.resultId)
      if (generation.current !== current) return
      setTicket(prepared.ticket)
      setPrintStatus('submitting')
      submitted = true
      const response = await printTestTicket(state.resultId)
      if (generation.current === current) setPrintStatus(response.state)
    } catch {
      if (generation.current === current) setPrintStatus(submitted ? 'unknown' : 'error')
    } finally {
      if (generation.current === current) {
        printLock.current = false
        setPrinting(false)
      }
    }
  }

  return <div className="app-shell">
    <main id="main-content">
      <PageTransition page={state.page}>
      <div className="page-view" data-page={state.page}>
      {state.page === 'welcome' && <Welcome onStart={() => dispatch({ type: 'start' })} />}
      {state.page === 'discover' && <Discover participant={state.participant} errors={state.errors}
        pending={state.status === 'pending'} onChange={(fields) => dispatch({ type: 'change', fields })}
        onSubmit={discover} onBack={resetSession} />}
      {state.page === 'result' && <Result nickname={state.participant.nickname.trim()} result={state.result}
        onPrint={print} onFinish={resetSession} />}
      {state.page === 'receipt' && <Receipt ticket={ticket || previewTicket(state.participant, state.result)}
        status={printStatus} printing={printing} onFinish={resetSession} />}
      </div>
      </PageTransition>
    </main>
  </div>
}
