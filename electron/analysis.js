import { randomUUID } from 'node:crypto'
import { normalizeParticipant } from '../shared/participant.js'
import { analysisRequest, parseAnalysis, PROMPT_VERSION } from '../shared/analysis.js'
import { getFortuneForStem } from '../shared/fortune.js'
import { loadFortuneContent } from './content.js'

export const ANALYSIS_MESSAGES = {
  configuration: '尚未配置 DeepSeek API Key，请联系现场工作人员。',
  invalid: '输入信息不完整，请检查后重试。',
  busy: '正在测算，请稍候。',
  timeout: '测算等待超时，请重试。',
  cancelled: '本次测算已取消。',
  authentication: 'AI 服务配置异常，请联系现场工作人员。',
  rate_limit: 'AI 服务繁忙，请稍后重试。',
  network: '暂时无法连接 AI 服务，请检查网络后重试。',
  response: '测算数据格式异常，请重试。',
}

export class AnalysisError extends Error {
  constructor(code) { super(ANALYSIS_MESSAGES[code]); this.code = code }
}

export function createAnalysisController({
  apiKey = process.env.DEEPSEEK_API_KEY, model = process.env.DEEPSEEK_MODEL || 'deepseek-flash',
  fetchImpl = globalThis.fetch, timeoutMs = 30_000,
  content = loadFortuneContent(new URL('../content/fortune.json', import.meta.url)),
} = {}) {
  let pending = null
  let snapshot = null

  function clear() {
    pending?.controller.abort(new AnalysisError('cancelled'))
    pending = null
    snapshot = null
  }

  async function request(participant, signal) {
    let response
    try {
      response = await fetchImpl('https://api.deepseek.com/chat/completions', {
        method: 'POST', redirect: 'error', signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(analysisRequest(participant, model)),
      })
    } catch {
      throw signal.aborted ? signal.reason : new AnalysisError('network')
    }
    if (response.status === 401 || response.status === 403) throw new AnalysisError('authentication')
    if (response.status === 429) throw new AnalysisError('rate_limit')
    if (!response.ok) throw new AnalysisError('network')
    try { return parseAnalysis(await response.json()) } catch {
      throw signal.aborted ? signal.reason : new AnalysisError('response')
    }
  }

  function analyze(requestId, form) {
    if (typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(requestId)) return Promise.reject(new AnalysisError('invalid'))
    if (pending) return pending.id === requestId ? pending.promise : Promise.reject(new AnalysisError('busy'))
    if (snapshot?.requestId === requestId) return Promise.resolve(structuredClone(snapshot))
    let participant
    try { participant = normalizeParticipant(form) } catch { return Promise.reject(new AnalysisError('invalid')) }
    if (!apiKey?.trim()) return Promise.reject(new AnalysisError('configuration'))
    snapshot = null
    const controller = new AbortController()
    const entry = { id: requestId, controller, promise: null }
    pending = entry
    entry.promise = (async () => {
      const timer = setTimeout(() => controller.abort(new AnalysisError('timeout')), timeoutMs)
      try {
        const data = await request(participant, controller.signal)
        if (controller.signal.aborted || pending !== entry) throw controller.signal.reason || new AnalysisError('cancelled')
        const fortune = getFortuneForStem(data.day_stem[0], content)
        snapshot = {
          id: randomUUID(), requestId, participant,
          result: { ...fortune, percentages: data.wuxing_percentages },
          promptVersion: PROMPT_VERSION, model,
        }
        return structuredClone(snapshot)
      } finally {
        clearTimeout(timer)
        if (pending === entry) pending = null
      }
    })()
    return entry.promise
  }

  return {
    analyze, clear,
    cancel(requestId) { if (pending?.id === requestId || snapshot?.requestId === requestId) clear() },
    getSnapshot(id) {
      if (!snapshot || snapshot.id !== id) throw new Error('Analysis has expired')
      return structuredClone(snapshot)
    },
  }
}
