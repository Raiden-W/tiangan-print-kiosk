import ElementIcon from './ElementIcon.jsx'

const nodes = [
  { key: 'wood', label: '木', x: 250, y: 66 },
  { key: 'fire', label: '火', x: 450, y: 222 },
  { key: 'earth', label: '土', x: 367, y: 450 },
  { key: 'metal', label: '金', x: 119, y: 450 },
  { key: 'water', label: '水', x: 48, y: 210 },
]
const labels = [
  ['生', 106, 73], ['生', 405, 79], ['生', 484, 342], ['生', 250, 522], ['生', 16, 339],
  ['克', 205, 166], ['克', 334, 207], ['克', 350, 363], ['克', 225, 436], ['克', 131, 301],
]

export default function ElementDiagram({ percentages, dominantElement }) {
  return <div className="element-diagram" aria-label="全盘五行能量占比">
    <img className="element-connections" src="./ui/elements/circle arrows.png" alt="" />
    {labels.map(([label, x, y], i) => <span className="element-relation" key={i} style={{ left: x, top: y }} aria-hidden="true">{label}</span>)}
    {nodes.map((node) => <div key={node.key} className="element-node" style={{ left: node.x, top: node.y }}>
      <ElementIcon element={node.label} className={dominantElement === node.label ? 'day-element' : ''} />
      <span className="element-percentage">{percentages[node.key]}%</span>
    </div>)}
  </div>
}
