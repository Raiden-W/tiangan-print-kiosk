const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

export default function Welcome({ onStart }) {
  return (
    <section className="welcome-page" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <p className="eyebrow">WELCOME</p>
        <h1 id="welcome-title">你的五行，<br />藏着一颗<br /><span>幸运串珠。</span></h1>
        <p className="intro">从你的出生日期出发，<br />发现天干与串珠之间的文化联结。</p>
        <button className="button primary start-button" onClick={onStart}>帮我测测五行 <span aria-hidden="true">↗</span></button>
      </div>
      <div className="fortune-wheel" aria-hidden="true">
        <div className="wheel-ring"><div className="wheel-core">木<span>火 · 土 · 金 · 水</span></div></div>
        <div className="stem-grid">{stems.map((stem) => <span key={stem}>{stem}</span>)}</div>
        <span className="wheel-caption">YOUR FORTUNE BEGINS HERE</span>
      </div>
    </section>
  )
}
