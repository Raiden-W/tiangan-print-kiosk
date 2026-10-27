import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { loadFortuneContent } from '../electron/content.js'
import { getFortuneForStem } from '../shared/fortune.js'

test('external JSON reloads edited text and rejects missing, broken or incomplete content', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'tiangan-content-'))
  const filename = path.join(folder, 'fortune.json')
  try {
    const source = JSON.parse(readFileSync(new URL('../content/fortune.json', import.meta.url), 'utf8'))
    writeFileSync(filename, JSON.stringify(source))
    const first = loadFortuneContent(filename)
    source.beads.metal.meaning = '修改后的金元素寓意'
    writeFileSync(filename, JSON.stringify(source))
    const restarted = loadFortuneContent(filename)
    assert.notEqual(first.beads.metal.meaning, restarted.beads.metal.meaning)
    assert.equal(getFortuneForStem('辛', restarted).bead.meaning, '修改后的金元素寓意')
    source.beads.metal.meaning = ''
    writeFileSync(filename, JSON.stringify(source))
    assert.throws(() => loadFortuneContent(filename), /内容配置/)
    writeFileSync(filename, '{broken')
    assert.throws(() => loadFortuneContent(filename), /内容配置/)
    unlinkSync(filename)
    assert.throws(() => loadFortuneContent(filename), /内容配置/)
  } finally { rmdirSync(folder) }
})
