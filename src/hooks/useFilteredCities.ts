import { useMemo } from 'react'
import type { EnrichedCity, TensionKey } from '../types/city'

export interface FilterState {
  /** Score minimum (0–100). */
  minScore: number
  /** Salaire net minimum du métier actif (€). 1500 = indifférent. */
  minSalary: number
  /** Coût du logement maximum (€/m²). 10000 = indifférent. */
  maxHousing: number
  /** 'all' ou un nom de région. */
  region: string
  /** 'all' ou une clé de tension. */
  tension: TensionKey | 'all'
  /** Nombre minimum d'offres. */
  minOpportunities: number
  /** Tri de la liste de résultats. */
  sort: 'score-desc' | 'score-asc'
}

export const DEFAULT_FILTERS: FilterState = {
  minScore: 0,
  minSalary: 1500,
  maxHousing: 10000,
  region: 'all',
  tension: 'all',
  minOpportunities: 0,
  sort: 'score-desc',
}

/** Applique les filtres puis le tri. Mémoïsé. */
export function useFilteredCities(
  cities: EnrichedCity[],
  filters: FilterState,
): EnrichedCity[] {
  return useMemo(() => {
    const result = cities.filter((c) => {
      if (c.score < filters.minScore) return false
      if (c.salaryNet < filters.minSalary) return false
      if (c.housingPricePerM2 > filters.maxHousing) return false
      if (filters.region !== 'all' && c.region !== filters.region) return false
      if (filters.tension !== 'all' && c.tensionLevel.key !== filters.tension) return false
      if (c.offers < filters.minOpportunities) return false
      return true
    })

    result.sort((a, b) =>
      filters.sort === 'score-desc' ? b.score - a.score : a.score - b.score,
    )

    return result
  }, [cities, filters])
}
