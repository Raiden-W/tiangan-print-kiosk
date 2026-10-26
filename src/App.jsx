import { useEffect, useReducer, useState } from 'react'
import Welcome from './pages/Welcome.jsx'
import Discover from './pages/Discover.jsx'
import Result from './pages/Result.jsx'
import { clearTestTicket, getRuntimeInfo } from './services/platform.js'
import { initialSession, sessionReducer } from '../shared/session.js'
import { validateParticipant } from '../shared/participant.js'
import { getFortune } from '../shared/fortune.js'
import content from '../content/fortune.json'

const IDLE_TIMEOUT_MS = 120_000
const pages = { welcome: '01', discover: '02', result: '03' }

export default function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, initialSession)
  const [runtime, setRuntime] = useState(null)
  const [printing, setPrinting] = useState(false)
  function resetSession() {
    void clearTestTicket().catch(() => {})
    setPrinting(false)
    dispatch({ type: 'reset' })
  }
  useEffect(() => {
    let active = true
    getRuntimeInfo().then((info) => { if (active) setRuntime(info) })
      .catch(() => { if (active) setRuntime({ mode: 'unavailable' }) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (state.page === 'welcome' || printing) return
    let timer
    const restartTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(resetSession, IDLE_TIMEOUT_MS)
    }
    restartTimer()
    window.addEventListener('pointerdown', restartTimer)
    window.addEventListener('keydown', restartTimer)
    window.addEventListener('input', restartTimer)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', restartTimer)
      window.removeEventListener('keydown', restartTimer)
      window.removeEventListener('input', restartTimer)
    }
  }, [state.page, printing])

  function discover() {
    const errors = validateParticipant(state.participant)
    if (Object.keys(errors).length) return dispatch({ type: 'invalid', errors })
    try {
      const result = getFortune(state.participant.birthDate, content)
      dispatch({ type: 'result', result })
    } catch {
      dispatch({ type: 'invalid', errors: { form: '暂时无法生成结果，请返回首页后重试。' } })
    }
  }

  const runtimeLabel = runtime?.mode === 'desktop' ? '桌面预览'
    : runtime?.mode === 'unavailable' ? '桌面连接异常' : '浏览器预览'
  return (
    <div className="app-shell">
      <header className="masthead">
        <span className="wordmark">B1OCK <span>FORTUNE ITEMS</span></span>
        <span className="edition">文化互动体验 <span className="edition-dot" /> {pages[state.page]} / 03</span>
      </header>
      <div className="prototype-note" role="note">基础原型 · 串珠资料为测试占位内容 · 仅提供不可核销的打印测试票</div>
      <main id="main-content" key={state.page}>
        {state.page === 'welcome' && <Welcome onStart={() => dispatch({ type: 'start' })} />}
        {state.page === 'discover' && <Discover
          participant={state.participant} errors={state.errors}
          onChange={(fields) => dispatch({ type: 'change', fields })}
          onSubmit={discover} onBack={resetSession}
        />}
        {state.page === 'result' && <Result nickname={state.participant.nickname.trim()}
          birthDate={state.participant.birthDate} result={state.result} runtime={runtime}
          onPrintingChange={setPrinting} onFinish={resetSession} />}
      </main>
      <footer className="page-footer"><span>本测试仅供娱乐与体验参考。</span><span>{runtimeLabel}</span></footer>
    </div>
  )
}
