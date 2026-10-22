import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import content from '../content/fortune.json' with { type: 'json' }
import { calculateDayStem } from '../shared/tiangan.js'
import { getFortune, STEMS, validateFortuneContent } from '../shared/fortune.js'

const TODAY = '2026-10-22'

// https://github.com/6tail/lunar-javascript#示例
// Library regression fixture; independent almanac acceptance is still pending.
test('published date fixture produces 癸, and century/leap boundaries stay in sequence', () => {
  assert.equal(calculateDayStem('1986-05-29', TODAY), '癸')
  for (const start of ['1999-12-28', '2000-02-25', '2024-02-25']) {
    const date = new Date(`${start}T00:00:00Z`)
    let previous
    for (let index = 0; index < 65; index++) {
      const stem = calculateDayStem(date.toISOString().slice(0, 10), TODAY)
      if (previous !== undefined) assert.equal(STEMS.indexOf(stem), (STEMS.indexOf(previous) + 1) % 10)
      previous = stem
      date.setUTCDate(date.getUTCDate() + 1)
    }
  }
})

test('day-stem output is invariant across process TZ settings', () => {
  const moduleURL = new URL('../shared/tiangan.js', import.meta.url).href
  const code = `import { calculateDayStem } from ${JSON.stringify(moduleURL)}; process.stdout.write(calculateDayStem('1986-05-29', '${TODAY}'))`
  for (const TZ of ['UTC', 'Asia/Shanghai', 'America/Los_Angeles', 'Pacific/Auckland']) {
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
      env: { ...process.env, TZ }, encoding: 'utf8',
    })
    assert.equal(child.status, 0, child.stderr)
    assert.equal(child.stdout, '癸')
  }
})

test('all ten stems have renderable data and can share one placeholder bead', () => {
  assert.equal(validateFortuneContent(content), true)
  assert.equal(Object.keys(content.assignments).length, 10)
  assert.equal(new Set(Object.values(content.assignments)).size, 1)
  const result = getFortune('1986-05-29', content, TODAY)
  assert.equal(result.nameZh, '癸水')
  assert.equal(result.nameEn, 'YIN WATER')
  assert.equal(result.placeholder, true)
  assert.equal(result.bead.name, '测试串珠 A')
  const invalid = structuredClone(content)
  invalid.assignments['辛'] = 'missing-bead'
  assert.throws(() => validateFortuneContent(invalid), /辛/)
})
