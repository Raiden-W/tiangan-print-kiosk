import ElementIcon from './ElementIcon.jsx'

export default function AnalysisLoading({ onCancel }) {
  return <div className="analysis-loading" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
    <div className="analysis-orbit" aria-hidden="true">
      {['木', '火', '土', '金', '水'].map((element, index) => <div className="orbit-position" key={element} style={{ '--orbit-angle': `${index * 72}deg`, '--pulse-delay': `${index * -.6}s` }}>
        <div className="orbit-counter"><ElementIcon element={element} /></div>
      </div>)}
    </div>
    <div className="analysis-copy" role="status"><h2 id="analysis-title">正在测算你的五行</h2><p>探索属于你的幸运串珠</p></div>
    <button type="button" className="text-button analysis-cancel" autoFocus onClick={onCancel}>取消，返回首页</button>
  </div>
}
