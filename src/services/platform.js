import { getFortuneForStem, validateFortuneContent } from '../../shared/fortune.js'
import { ticketFromSnapshot } from '../../shared/analysis.js'

let browserContent

export async function initializeContent() {
  if (window.kiosk) return
  const response = await fetch('./content/fortune.json', { cache: 'no-store' })
  if (!response.ok) throw new Error('Content unavailable')
  const content = await response.json()
  validateFortuneContent(content)
  browserContent = content
}

export function getRuntimeInfo() {
  if (window.kiosk) return window.kiosk.getRuntimeInfo()
  return Promise.resolve({ mode: 'browser', version: '0.1.0', printing: 'preview', aiConfigured: false })
}

export function analyzeBirthInfo(requestId, participant) {
  if (window.kiosk) return window.kiosk.analyzeBirthInfo({ requestId, participant })
  // Deliberately fixed, offline demo fixture. Never presented as an AI calculation.
  if (!browserContent) return Promise.reject(new Error('Content unavailable'))
  const fortune = getFortuneForStem('辛', browserContent)
  return Promise.resolve({
    ok: true, resultId: requestId,
    result: { ...fortune, percentages: { wood: 40, fire: 12, earth: 20, metal: 14, water: 14 } },
  })
}

export function cancelAnalysis(requestId) {
  return window.kiosk?.cancelAnalysis(requestId) ?? Promise.resolve()
}

export function clearSession() {
  return window.kiosk?.clearSession() ?? Promise.resolve()
}

export function prepareTestTicket(resultId) {
  return window.kiosk.prepareTestTicket({ resultId })
}

export function printTestTicket(resultId) {
  return window.kiosk.printTestTicket(resultId)
}

export function previewTicket(participant, result) {
  return ticketFromSnapshot({ participant, result })
}
