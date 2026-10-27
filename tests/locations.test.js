import test from 'node:test'
import assert from 'node:assert/strict'
import { locations, getProvince, getCity, locationError, selectLocation, searchLocations } from '../shared/locations.js'
import { emptyParticipant, validateParticipant } from '../shared/participant.js'
import { getFortune } from '../shared/fortune.js'
import fortuneContent from '../content/fortune.json' with { type: 'json' }

test('China snapshot covers 34 province-level regions, 333 prefectures and documented exceptions', () => {
  assert.deepEqual(locations.countries.map((country) => country.id), ['CN'])
  const provinces = locations.countries[0].provinces
  const cities = provinces.flatMap((province) => province.cities)
  assert.equal(provinces.length, 34)
  assert.equal(new Set(provinces.map((province) => province.id)).size, 34)
  assert.equal(new Set(cities.map((city) => city.id)).size, cities.length)
  for (const [type, expected] of [['prefecture', 333], ['municipality', 4], ['province-direct', 33], ['special-region', 2], ['county-city', 22]]) {
    assert.equal(cities.filter((city) => city.type === type).length, expected, type)
  }
  assert.equal(cities.length, 394)
  assert.equal(locations.counts.selectableCities, cities.length)
  for (const province of provinces) {
    assert.ok(province.cities.length > 0, province.name)
    assert.ok(locations.timezones.includes(province.timezone))
    for (const city of province.cities) {
      assert.ok(!/^(市辖区|县|省直辖县级行政区划|自治区直辖县级行政区划)$/.test(city.name))
      assert.ok(searchLocations(city.id).some((entry) => entry.city === city.id && entry.province === province.id))
    }
  }
})

test('municipalities remain cities; prefectures, direct counties and special regions are selectable', () => {
  for (const id of ['110000', '120000', '310000', '500000']) {
    const province = getProvince('CN', id)
    assert.deepEqual(province.cities.map((city) => city.name), [province.name])
  }
  for (const [province, city, name] of [
    ['150000', '152500', '锡林郭勒盟'], ['510000', '513200', '阿坝藏族羌族自治州'],
    ['540000', '542500', '阿里地区'], ['410000', '419001', '济源市'],
    ['420000', '429021', '神农架林区'], ['460000', '469001', '五指山市'],
    ['650000', '659013', '草湖市'],
  ]) assert.equal(getCity('CN', province, city)?.name, name)
  assert.equal(getProvince('CN', '810000').timezone, 'Asia/Hong_Kong')
  assert.equal(getProvince('CN', '820000').timezone, 'Asia/Macau')
  assert.equal(getProvince('CN', '710000').cities.length, 22)
  assert.equal(getProvince('CN', '710000').timezone, 'Asia/Taipei')
})

test('location searches accept Chinese names, full paths, codes and traditional aliases', () => {
  assert.deepEqual(searchLocations(''), [])
  assert.equal(searchLocations('广东 深圳')[0].city, '440300')
  assert.equal(searchLocations('中国 / 四川省 / 阿坝')[0].city, '513200')
  assert.equal(searchLocations('659013')[0].label, '中国 / 新疆维吾尔自治区 / 草湖市')
  assert.equal(searchLocations('臺北市')[0].city, 'TW-taipei')
  assert.equal(searchLocations('不存在的城市').length, 0)
})

test('changing parents clears child selections and suggested timezone; cross-province IDs are rejected', () => {
  let selection = selectLocation({}, 'country', 'CN')
  selection = selectLocation(selection, 'province', '440000')
  selection = selectLocation(selection, 'city', '440300')
  assert.equal(selection.timezone, 'Asia/Shanghai')
  assert.equal(locationError(selection.country, selection.province, selection.city), '')
  selection = selectLocation(selection, 'province', '330000')
  assert.equal(selection.city, '')
  assert.equal(selection.timezone, '')
  assert.equal(selectLocation(selection, 'city', '440300').city, '')
  assert.ok(locationError('CN', '330000', '440300'))
  assert.equal(locationError('', '', ''), '')
  assert.ok(locationError('', '440000', '440300'))
  assert.deepEqual(selectLocation(selection, 'country', ''), { country: '', province: '', city: '', timezone: '' })
})

test('participant birthplace is now free global text; legacy local calculator still only uses date', () => {
  const base = { ...emptyParticipant(), nickname: 'LOCATION TEST', gender: 'male', birthDate: '1986-05-29', birthHour: '14', birthMinute: '30', birthplace: 'Shanghai' }
  const selected = { ...base, birthplace: 'Springfield, USA' }
  assert.deepEqual(validateParticipant(selected, '2026-10-22'), {})
  assert.ok(validateParticipant({ ...selected, birthplace: '' }, '2026-10-22').birthplace)
  assert.deepEqual(getFortune(base.birthDate, fortuneContent), getFortune(selected.birthDate, fortuneContent))
})
