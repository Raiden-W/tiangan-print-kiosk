import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { initializeContent } from './services/platform.js'

const root = createRoot(document.getElementById('root'))
if (!window.kiosk) document.title = '五行体验 · 离线演示预览'
initializeContent().then(() => root.render(<StrictMode><App /></StrictMode>))
  .catch(() => root.render(<main className="configuration-error" role="alert">内容配置无法读取，请检查 content/fortune.json 后重新启动。</main>))
