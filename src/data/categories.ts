import type { ActiveCategory, CategoryKey } from '../types/city'

/** Les 7 catégories de métiers, dans l'ordre d'affichage. */
export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'it', label: 'IT / Tech' },
  { key: 'sante', label: 'Santé' },
  { key: 'btp', label: 'BTP' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'logistique', label: 'Logistique' },
  { key: 'industrie', label: 'Industrie' },
  { key: 'services', label: 'Services' },
]

export const CATEGORY_KEYS: CategoryKey[] = CATEGORIES.map((c) => c.key)

const LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
)

/** Libellé lisible d'une catégorie (ou « Tous les métiers »). */
export const categoryLabel = (key: ActiveCategory): string =>
  key === 'all' ? 'Tous les métiers' : LABELS[key] ?? key
