import { createRoot } from 'react-dom/client'
import FortuneTicket from './components/FortuneTicket.jsx'
import './styles/ticket.css'

async function render() {
  const ticket = await window.kioskPrint.getTicket()
  createRoot(document.getElementById('root')).render(<FortuneTicket ticket={ticket} physicalPrint />)
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await document.fonts.ready
  await Promise.all([...document.images].map((image) => image.decode()))
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  window.__ticketReady = true
}

render().catch(() => { window.__ticketError = true })
