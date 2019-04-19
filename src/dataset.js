const ds = require('./dataset.json')
const CATS = require('./categories.json')

module.exports = {
  getDataset: () => [...ds],
  getLabels: () => ds.map(data => data[0]),
  getCategories: () => ds.map(data => data[1]),
  getDistinctCategories: () => [...CATS, 'null'],
}
