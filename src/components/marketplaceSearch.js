const order = { Available: 0, Limited: 1, Full: 2 }
export function filterMarketplace(areas, filters, savedIds = []) {
  const query = (filters.search || '').trim().toLocaleLowerCase()
  const results = areas.filter(
    (area) =>
      `${area.name} ${area.location} ${area.neighborhood} ${area.hostName}`
        .toLocaleLowerCase()
        .includes(query) &&
      (!filters.vehicle || area.vehicles.includes(filters.vehicle)) &&
      (!filters.availability || area.availability === filters.availability) &&
      (!filters.parkingType || area.parkingType === filters.parkingType) &&
      (!filters.maxPrice || area.hourlyRate <= Number(filters.maxPrice)) &&
      (!filters.savedOnly || savedIds.includes(area.id)),
  )
  const sorts = {
    'name-asc': (a, b) => a.name.localeCompare(b.name),
    'name-desc': (a, b) => b.name.localeCompare(a.name),
    availability: (a, b) => order[a.availability] - order[b.availability],
    'price-asc': (a, b) => a.hourlyRate - b.hourlyRate,
    'price-desc': (a, b) => b.hourlyRate - a.hourlyRate,
  }
  if (sorts[filters.sortBy]) results.sort(sorts[filters.sortBy])
  return results
}
