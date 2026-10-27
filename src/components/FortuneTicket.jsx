import ElementIcon from './ElementIcon.jsx'

export default function FortuneTicket({ ticket, physicalPrint = false }) {
  return <article className={`fortune-ticket${physicalPrint ? ' fortune-ticket-physical' : ''}`} aria-label="五行小票">
    <h1 className="ticket-title">RECEIPT</h1>
    <div className="ticket-rule" />
    <div className="ticket-element"><p>{ticket.nameZh}</p><p>{ticket.nameEn}</p></div>
    <ElementIcon element={ticket.element} className="ticket-bead" />
    <p className="ticket-meaning">{ticket.meaning}</p>
    <div className="ticket-rule ticket-rule-bottom" />
    {physicalPrint && <div className="ticket-feed-spacer" aria-hidden="true" />}
  </article>
}
