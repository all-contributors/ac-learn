const ds = require('./dataset.json')

const CATS = [
  'blog',
  'bug',
  'business',
  'code',
  'content',
  'design',
  'doc',
  'eventOrganizing',
  'example',
  'financial',
  'fundingFinding',
  'ideas',
  'infra',
  'maintenance',
  'platform',
  'plugin',
  'projectManagement',
  'question',
  'review',
  'security',
  'talk',
  'test',
  'tool',
  'translation',
  'tutorial',
  'userTesting',
  'video',
  null, //Because not every labels would be relevant to a contribution
]

module.exports = {
  getDataset: () => [...ds],
  getLabels: () => ds.map(data => data[0]),
  getCategories: () => ds.map(data => data[1]),
  getDistinctCategories: () => CATS,
}
