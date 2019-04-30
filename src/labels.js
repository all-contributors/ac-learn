const labels = require('./labels.json')

const getDistinctCategories = () => {
  const cats = new Set()
  labels.forEach(d => cats.add(d.category))
  return Array.from(cats)
}

const CATEGORIES = getDistinctCategories().filter(Boolean)

module.exports = {
  getAll: () => [...labels],
  getAt: idx => labels[idx],
  getLabels: () => labels.map(d => d.label),
  getCategories: () => labels.map(d => d.category),
  getDistinctCategories: () => CATEGORIES,
  size: () => labels.length,
  getCategorisedLabels: () => labels.filter(d => !!d.category),
  getNullCatLabels: () => labels.filter(d => d.category == 'null'),
  getValidCatLabels: () => labels.filter(d => CATEGORIES.includes(d.category)),
  getBadData: () =>
    labels.filter(
      d => (!!d.category && !CATEGORIES.includes(d.category)) || !d.category,
    ),
  getLabelsFromCategory: category =>
    labels.filter(d => d.category === category),
}
