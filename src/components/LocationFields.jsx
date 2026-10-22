import { useId, useState } from 'react'
import { getCountry, getProvince, getCity, locations, searchLocations, selectLocation } from '../../shared/locations.js'

export default function LocationFields({ prefix, country, province, city, onChange }) {
  const [query, setQuery] = useState('')
  const resultsId = useId()
  const selectedCountry = getCountry(country)
  const selectedProvince = getProvince(country, province)
  const selectedCity = getCity(country, province, city)
  const matches = searchLocations(query)
  function choose(selection) {
    onChange(selection)
    setQuery('')
  }
  function change(level, value) {
    choose(selectLocation({ country, province, city }, level, value))
  }
  return (
    <div className="location-fields">
      <div className="location-search">
        <input type="search" aria-label={`${prefix}地点搜索`} aria-controls={query.trim() ? resultsId : undefined}
          placeholder="搜索省份、城市或区划代码" maxLength={64} value={query}
          onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('')
            if (event.key === 'Enter') {
              event.preventDefault()
              if (matches.length === 1) choose(matches[0])
            }
          }} />
        <button type="button" className="clear-choice" aria-label={`清空${prefix}`} onClick={() => change('country', '')}>清空</button>
      </div>
      {query.trim() && <div className="location-results">
        <p className="field-hint" role="status">{matches.length ? `找到 ${matches.length} 个地点，请点选。` : '未找到匹配地点，请更换关键词或使用下方选择。'}</p>
        <ul id={resultsId} aria-label={`${prefix}地点搜索结果`}>
          {matches.map((entry) => <li key={entry.city}><button type="button" onClick={() => choose(entry)}>{entry.label}</button></li>)}
        </ul>
      </div>}
      <div className="location-selects">
        <select aria-label={`${prefix}国家`} value={country} onChange={(event) => change('country', event.target.value)}>
          <option value="">国家</option>
          {locations.countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label={`${prefix}省份`} value={province} disabled={!selectedCountry}
          title={selectedProvince?.name} onChange={(event) => change('province', event.target.value)}>
          <option value="">省／自治区／直辖市</option>
          {selectedCountry?.provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label={`${prefix}城市`} value={city} disabled={!selectedProvince}
          title={selectedCity?.name} onChange={(event) => change('city', event.target.value)}>
          <option value="">城市／地区</option>
          {selectedProvince?.cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <p className="field-hint" aria-live="polite">{selectedCity
        ? `已选择：${selectedCountry.name} / ${selectedProvince.name} / ${selectedCity.name}`
        : '可直接搜索并点选地点，或依次选择国家、省份和城市／地区。'}</p>
    </div>
  )
}
