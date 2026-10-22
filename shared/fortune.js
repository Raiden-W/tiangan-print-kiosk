import { calculateDayStem } from './tiangan.js'

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

export function validateFortuneContent(content) {
  if (!content?.version || !['placeholder', 'production'].includes(content.mode)) {
    throw new Error('串珠资料缺少版本或内容模式。')
  }
  for (const stem of STEMS) {
    const metadata = content.stems?.[stem]
    const bead = content.beads?.[content.assignments?.[stem]]
    if (!metadata?.element || !metadata.nameZh || !metadata.nameEn || !bead?.name || !bead.meaning) {
      throw new Error(`串珠资料不完整：${stem}`)
    }
  }
  return true
}

export function getFortune(birthDate, content, today) {
  validateFortuneContent(content)
  const stem = calculateDayStem(birthDate, today)
  const beadId = content.assignments[stem]
  return {
    stem,
    ...content.stems[stem],
    beadId,
    bead: { ...content.beads[beadId] },
    contentVersion: content.version,
    placeholder: content.mode === 'placeholder',
  }
}
