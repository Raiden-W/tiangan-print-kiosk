import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

function Barcode({ value }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) JsBarcode(ref.current, value, {
      format: 'CODE128', displayValue: false, height: 46, width: 1.5,
      margin: 0, background: '#fff', lineColor: '#000',
    })
  }, [value])
  return <svg className="ticket-barcode" ref={ref} role="img" aria-label={`测试条码 ${value}`} />
}

function BeadOutline() {
  return <svg className="ticket-bead" viewBox="0 0 100 100" aria-label="石珠线稿位置示意" role="img">
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M13 36 Q50 12 87 36 M19 70 Q50 93 81 70" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="50" cy="50" r="5.8" fill="currentColor" />
  </svg>
}

export default function FortuneTicket({ ticket }) {
  return <article className="fortune-ticket" aria-label="58 毫米打印测试票预览">
    <header className="ticket-head">
      <div className="ticket-brand">B1OCK</div>
      <div className="ticket-title">FORTUNE ITEMS</div>
      <div className="ticket-anniversary">SIXTH ANNIVERSARY</div>
    </header>
    <div className="ticket-rule" />
    <div className="ticket-fields">
      <div className="ticket-field"><span>NAME</span><strong>{ticket.name}</strong></div>
      <div className="ticket-field"><span>ELEMENT</span><strong>{ticket.element}</strong></div>
    </div>
    <div className="ticket-rule" />
    <section className="ticket-fortune">
      <div className="ticket-label">YOUR FORTUNE BEAD</div>
      <BeadOutline />
      <div className="ticket-bead-name">{ticket.beadName}</div>
      <div className="ticket-bead-subtitle">FORTUNE BEAD TEST</div>
      <p className="ticket-meaning">{ticket.meaning}</p>
    </section>
    <div className="ticket-rule" />
    <section className="ticket-redeem">
      <div className="ticket-redeem-title">TEST PRINT · NOT REDEEMABLE</div>
      <p>打印版式与条码扫描测试，不可兑换</p>
      <Barcode value={ticket.barcode} />
      <div className="ticket-code">{ticket.barcode}</div>
      <div className="ticket-disclaimer">For print testing only.</div>
    </section>
    <div className="ticket-rule" />
    <footer className="ticket-footer">GOOD FORTUNE, GOOD THINGS.</footer>
  </article>
}
