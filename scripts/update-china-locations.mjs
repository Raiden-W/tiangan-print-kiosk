import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const sourceURL = 'https://dmfw.mca.gov.cn/9095/xzqh/getList?maxLevel=2'
const response = await fetch(sourceURL, { signal: AbortSignal.timeout(20000) })
if (!response.ok) throw new Error(`Location source returned HTTP ${response.status}`)
const raw = await response.text()
const source = JSON.parse(raw)
if (source.status !== 200 || source.data?.children?.length !== 34) throw new Error('Unexpected province coverage')
const taiwan = JSON.parse(await readFile(new URL('../content/taiwan-cities.json', import.meta.url), 'utf8'))

const provinces = source.data.children.map((province) => {
  const id = province.name === '台湾省' ? '710000' : province.code.slice(0, 6)
  const timezone = { '710000': 'Asia/Taipei', '810000': 'Asia/Hong_Kong', '820000': 'Asia/Macau' }[id] || 'Asia/Shanghai'
  let cities
  if (province.type === '直辖市' || province.type === '特别行政区') {
    cities = [{ id, name: province.name, type: province.type === '直辖市' ? 'municipality' : 'special-region' }]
  } else if (id === '710000') {
    cities = taiwan.cities.map((city) => ({ ...city, type: 'county-city' }))
  } else {
    cities = (province.children || []).map((city) => {
      if (![2, 3].includes(city.level) || !/^\d{12}$/.test(city.code)) throw new Error(`Invalid city: ${city.name}`)
      return { id: city.code.slice(0, 6), name: city.name, type: city.level === 2 ? 'prefecture' : 'province-direct' }
    })
  }
  if (!cities.length) throw new Error(`Empty province: ${province.name}`)
  return { id, name: province.name, timezone, cities }
}).sort((a, b) => a.id.localeCompare(b.id))

const allCities = provinces.flatMap((province) => province.cities)
const counts = {
  provinces: provinces.length,
  prefectures: allCities.filter((city) => city.type === 'prefecture').length,
  municipalities: allCities.filter((city) => city.type === 'municipality').length,
  provinceDirect: allCities.filter((city) => city.type === 'province-direct').length,
  specialRegions: allCities.filter((city) => city.type === 'special-region').length,
  taiwanCountyCities: allCities.filter((city) => city.type === 'county-city').length,
  selectableCities: allCities.length,
}
if (counts.prefectures !== 333 || counts.municipalities !== 4 || counts.taiwanCountyCities !== 22 || new Set(allCities.map((city) => city.id)).size !== allCities.length) {
  throw new Error('Coverage changed; review the source and update acceptance checks before replacing the snapshot')
}
const snapshot = {
  schemaVersion: 2,
  snapshotDate: new Date().toISOString().slice(0, 10),
  source: {
    name: '中国国家地名信息库', url: sourceURL,
    sha256: createHash('sha256').update(raw).digest('hex'),
    year: null,
    note: '服务默认最新返回版本，未返回明确年版；snapshotDate是抓取日期，不代表法定区划生效日期。台湾县市按独立来源补充，TW-前缀为应用内部ID。',
    supplements: [taiwan.source],
  },
  counts,
  countries: [{ id: 'CN', name: '中国', provinces }],
  timezones: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Macau', 'Asia/Taipei', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Seoul', 'Asia/Kolkata', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney', 'Pacific/Auckland', 'Etc/UTC'],
}
await writeFile(new URL('../content/locations.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n')
console.log(JSON.stringify({ file: fileURLToPath(new URL('../content/locations.json', import.meta.url)), counts }))
