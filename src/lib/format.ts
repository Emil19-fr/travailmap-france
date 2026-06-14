// Formatage en français (séparateurs de milliers, unités).

const nf = new Intl.NumberFormat('fr-FR')

export const formatNumber = (v: number) => nf.format(v)
export const formatSalary = (v: number) => `${nf.format(v)} € net / mois`
export const formatHousing = (v: number) => `${nf.format(v)} € / m²`
export const formatOpportunities = (v: number) => `${nf.format(v)} offres`
