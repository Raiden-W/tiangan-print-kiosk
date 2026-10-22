import locations from '../../content/locations.json'

export default function LocationFields({ prefix, country, city, onChange }) {
  const selected = locations.countries.find((item) => item.id === country)
  return (
    <div className="input-pair">
      <select aria-label={`${prefix}国家`} value={country} onChange={(event) => onChange(event.target.value, '', '')}>
        <option value="">选择国家（选填）</option>
        {locations.countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select aria-label={`${prefix}城市`} value={city} disabled={!selected} onChange={(event) => {
        const target = selected.cities.find((item) => item.id === event.target.value)
        onChange(country, event.target.value, target?.timezone ?? '')
      }}>
        <option value="">选择城市</option>
        {selected?.cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
  )
}
