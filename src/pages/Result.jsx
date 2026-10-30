import ElementDiagram from '../components/ElementDiagram.jsx'
import OrnateButton from '../components/OrnateButton.jsx'

export default function Result({ nickname, result, onPrint, onFinish }) {
  return <section className="result-page page" aria-labelledby="result-title">
    <h1 className="stack-title" id="result-title">YOUR<br />FORTUNE<br />BEAD</h1>
    <p className={`greeting ${Array.from(nickname).length > 24 ? 'greeting-long' : ''}`}>Hello, {nickname}</p>
    <ElementDiagram percentages={result.percentages} dayElement={result.nameZh.slice(-1)} />
    <div className="stem-name"><p>{result.nameZh}</p><p>{result.nameEn}</p></div>
    <div className="result-meaning"><p>{result.bead.meaning}</p></div>
    <OrnateButton className="result-print" onClick={onPrint}>PRINT THE RECEIPT</OrnateButton>
    <button className="text-button result-finish" onClick={onFinish}>返回首页</button>
  </section>
}
