import locations from '../content/locations.json' with { type: 'json' }

export { locations }

export function getCountry(countryId) {
  return locations.countries.find((country) => country.id === countryId)
}

export function getProvince(countryId, provinceId) {
  return getCountry(countryId)?.provinces.find((province) => province.id === provinceId)
}

export function getCity(countryId, provinceId, cityId) {
  return getProvince(countryId, provinceId)?.cities.find((city) => city.id === cityId)
}

export function locationError(country, province, city) {
  if (!country && !province && !city) return ''
  return getCity(country, province, city) ? '' : '请选择完整且匹配的国家、省级行政区和城市／地区。'
}

export function selectLocation(current, level, value) {
  if (level === 'country') {
    return { country: getCountry(value) ? value : '', province: '', city: '', timezone: '' }
  }
  if (level === 'province') {
    return { country: current.country, province: getProvince(current.country, value) ? value : '', city: '', timezone: '' }
  }
  const province = getProvince(current.country, current.province)
  return {
    country: current.country, province: current.province,
    city: getCity(current.country, current.province, value) ? value : '',
    timezone: getCity(current.country, current.province, value) ? province.timezone : '',
  }
}

const index = locations.countries.flatMap((country) => country.provinces.flatMap((province) =>
  province.cities.map((city) => ({
    country: country.id, province: province.id, city: city.id, timezone: province.timezone,
    label: `${country.name} / ${province.name} / ${city.name}`,
    search: `${country.name} ${province.name} ${city.name} ${city.id} ${(city.aliases || []).join(' ')}`.normalize('NFKC').toLowerCase(),
  }))))

export function searchLocations(query) {
  const tokens = query.normalize('NFKC').trim().toLowerCase().split(/[\s/、，,]+/u).filter(Boolean)
  return tokens.length ? index.filter((entry) => tokens.every((token) => entry.search.includes(token))) : []
}
