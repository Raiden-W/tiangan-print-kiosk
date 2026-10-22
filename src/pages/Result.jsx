export default function Result({ nickname, result, onFinish }) {
  return (
    <section className="result-page" aria-labelledby="result-title">
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
      <div className="result-actions"><div><button className="button primary" disabled>PRINT MY FORTUNE</button>
        <p className="field-hint">实体打印尚未配置，此版本不生成打印凭证。</p></div>
        <button className="button secondary" onClick={onFinish}>完成，返回首页</button></div>
    </section>
  )
}
