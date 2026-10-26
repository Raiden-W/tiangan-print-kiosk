import { createRoot } from 'react-dom/client'
import FortuneTicket from './components/FortuneTicket.jsx'
import './styles/ticket.css'

async function render() {
  const ticket = await window.kioskPrint.getTicket()
  createRoot(document.getElementById('root')).render(<FortuneTicket ticket={ticket} />)
  await document.fonts.ready
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  window.__ticketReady = true
}

render().catch(() => { window.__ticketError = true })
