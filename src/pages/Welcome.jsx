import OrnateButton from '../components/OrnateButton.jsx'

export default function Welcome({ onStart }) {
  return <section className="welcome-page page" aria-labelledby="welcome-title">
    <p className="welcome-brand">FORTUNE ITEMS</p>
    <div className="welcome-copy">
      <h1 id="welcome-title">你的五行，<br />藏著一顆幸運串珠。</h1>
      <p>B1OCK x PLAZA 66 <span>—— HOME TO LUXURY</span></p>
    </div>
    <OrnateButton className="welcome-start" onClick={onStart}>LET’S START</OrnateButton>
  </section>
}
