import { useEffect, useState } from 'react'
import FortuneTicket from '../components/FortuneTicket.jsx'
import { prepareTestTicket, printTestTicket } from '../services/platform.js'

const statusText = {
  prepared: '测试票已准备好。',
  submitting: '正在提交打印任务，请稍候。',
  submitted: '已提交到 Windows 打印系统；请确认纸张实际出纸。',
  failed: '打印页面或设置失败，任务未提交；请查看启动终端的错误信息。',
  unknown: '打印结果不明，请检查打印机和纸张，不要直接重复打印。',
  'printer-missing': '未找到 POS58 Printer。请检查 Windows 打印机名称和连接。',
}

const browserTicket = {
  name: 'LILY', element: '辛金 / YIN METAL', beadName: '测试串珠 A',
  meaning: '正式石珠名称、图片与寓意待提供。此票仅用于检查 58 mm 打印排版。',
  barcode: 'TEST-PREVIEW',
}

export default function Result({ nickname, birthDate, result, runtime, onPrintingChange, onFinish }) {
  const [key] = useState(() => crypto.randomUUID())
  const [ticket, setTicket] = useState(null)
  const [status, setStatus] = useState('preparing')

  useEffect(() => {
    if (runtime?.mode !== 'desktop') return
    let active = true
    prepareTestTicket({ key, name: nickname, birthDate }).then(({ ticket: prepared }) => {
      if (active) { setTicket(prepared); setStatus('prepared') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [runtime, key, nickname, birthDate])

  async function print() {
    if (status !== 'prepared') return
    setStatus('submitting')
    onPrintingChange(true)
    try {
      const response = await printTestTicket(key)
      setStatus(response.state)
    } catch {
      setStatus('unknown')
    } finally {
      onPrintingChange(false)
    }
  }

  const preview = ticket || {
    ...browserTicket, name: nickname, element: `${result.nameZh} / ${result.nameEn}`,
    beadName: result.bead.name, meaning: result.bead.meaning,
  }
  const canPrint = runtime?.mode === 'desktop' && status === 'prepared'

  return <section className="result-page" aria-labelledby="result-title">
    <div className="result-heading"><p className="eyebrow">YOUR FORTUNE BEAD</p><h1 className="page-title" id="result-title">Hello, {nickname}</h1></div>
    <div className="result-grid">
      <div className="stem-card"><p className="eyebrow">你的天干</p><div className="stem-character">{result.stem}</div>
        <p className="stem-name">{result.nameZh} <span>/ {result.nameEn}</span></p></div>
      <div className="bead-card"><p className="eyebrow">YOUR LUCKY BEAD</p>
        <div className="bead-placeholder" aria-hidden="true"><span>素材待定</span></div>
        <h2>{result.bead.name}</h2>{result.placeholder && <span className="content-tag">测试占位内容</span>}
      </div>
    </div>
    <div className="meaning"><p className="eyebrow">WHY THIS BEAD?</p><p>{result.bead.meaning}</p></div>
    <section className="ticket-section" aria-labelledby="ticket-preview-title">
      <div className="ticket-section-heading"><div><p className="eyebrow">58 MM PRINT TEST</p><h2 id="ticket-preview-title">小票版式预览</h2></div>
        <p>按参考版式制作；石珠线稿与内容目前为测试占位。</p></div>
      <div className="ticket-preview"><FortuneTicket ticket={preview} /></div>
    </section>
    <div className="result-actions"><div><button className="button primary" disabled={!canPrint} onClick={print}>打印测试票</button>
      <p className="field-hint" role="status">{runtime?.mode === 'desktop'
        ? statusText[status] || (status === 'preparing' ? '正在准备测试票。' : '测试票准备失败。')
        : '浏览器可预览小票；请在 Electron 桌面程序中测试打印。'}</p></div>
      <button className="button secondary" disabled={status === 'submitting'} onClick={onFinish}>完成，返回首页</button></div>
  </section>
}
