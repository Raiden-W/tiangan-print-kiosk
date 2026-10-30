import { calculateDayStem } from './tiangan.js'

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

export function validateFortuneContent(content) {
  if (!content?.version || !['placeholder', 'production'].includes(content.mode)) {
    throw new Error('串珠资料缺少版本或内容模式。')
  }
  for (const stem of STEMS) {
    const metadata = content.stems?.[stem]
    const bead = content.beads?.[content.assignments?.[stem]]
    const meaning = content.meanings?.[stem]
    if (!['金', '木', '水', '火', '土'].includes(metadata?.element) ||
        typeof metadata.nameZh !== 'string' || !metadata.nameZh.trim() ||
        typeof metadata.nameEn !== 'string' || !metadata.nameEn.trim() ||
        typeof bead?.name !== 'string' || !bead.name.trim() ||
        typeof meaning !== 'string' || !meaning.trim()) {
      throw new Error(`串珠资料不完整：${stem}`)
    }
  }
  if (Object.keys(content.meanings).length !== STEMS.length ||
      new Set(STEMS.map((stem) => content.meanings[stem].trim())).size !== STEMS.length) {
    throw new Error('十天干寓意文案必须各不相同。')
  }
  return true
}

export function getFortune(birthDate, content, today) {
  return getFortuneForStem(calculateDayStem(birthDate, today), content)
}

export function getFortuneForStem(stem, content) {
  validateFortuneContent(content)
  if (!STEMS.includes(stem)) throw new Error('Invalid day stem')
  const beadId = content.assignments[stem]
  return {
    stem,
    ...content.stems[stem],
    beadId,
    bead: { ...content.beads[beadId], meaning: content.meanings[stem] },
    contentVersion: content.version,
    placeholder: content.mode === 'placeholder',
  }
}
