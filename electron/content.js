import { readFileSync } from 'node:fs'
import { validateFortuneContent } from '../shared/fortune.js'

export function loadFortuneContent(filename) {
  try {
    const content = JSON.parse(readFileSync(filename, 'utf8'))
    validateFortuneContent(content)
    return content
  } catch {
    throw new Error('内容配置无法读取，请检查 content/fortune.json 后重新启动。')
  }
}
