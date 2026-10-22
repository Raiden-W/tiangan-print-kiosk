import test from 'node:test'
import assert from 'node:assert/strict'
import { editNickname, nicknameCursor, nicknameLength, limitNickname } from '../shared/nickname.js'
import { isPinyinPrefix, pinyinCandidates } from '../src/components/nicknameKeyboard.js'

test('offline pinyin candidates include common nickname characters and ü spellings', () => {
  assert.ok(pinyinCandidates('ni').includes('你'))
  assert.ok(pinyinCandidates('hao').includes('好'))
  assert.ok(pinyinCandidates('lv').includes('吕'))
  assert.ok(pinyinCandidates('nv').includes('女'))
  assert.equal(isPinyinPrefix('n'), true)
  assert.equal(isPinyinPrefix('nihao'), false)
  assert.deepEqual(pinyinCandidates('invalid'), [])
})

test('nickname edits replace the selected range and reject overflow without losing existing text', () => {
  assert.deepEqual(editNickname('小明', 1, 2, '白'), { value: '小白', caret: 2 })
  assert.deepEqual(editNickname('AB', 1, 1, '你'), { value: 'A你B', caret: 2 })
  const full = '你'.repeat(24)
  assert.equal(editNickname(full, 24, 24, 'A'), null)
  assert.equal(editNickname(full, 23, 24, 'A').value, '你'.repeat(23) + 'A')
  assert.equal(nicknameLength('😀'.repeat(24)), 24)
  assert.equal(limitNickname('😀'.repeat(25)), '😀'.repeat(24))
})

test('backspace and cursor keys preserve emoji and combining graphemes', () => {
  for (const grapheme of ['😀', 'e\u0301', '👨‍👩‍👧']) {
    const value = `A${grapheme}B`
    const end = value.length - 1
    assert.deepEqual(editNickname(value, end, end, '', true), { value: 'AB', caret: 1 })
    assert.equal(nicknameCursor(value, end, end, -1), 1)
    assert.equal(nicknameCursor(value, 1, 1, 1), end)
  }
  assert.deepEqual(editNickname('A😀B', 1, 3, '', true), { value: 'AB', caret: 1 })
  assert.deepEqual(editNickname('', 0, 0, '', true), { value: '', caret: 0 })
})
