import labels from '../labels'
import categories from '../categories'
import dataset from '../labels.json'

const LEN = 380
const nineth = dataset[9]

test('All data', () => {
  const data = labels.getAll()
  expect(data.length >= LEN).toBeTruthy()
  expect(Array.isArray(data)).toBeTruthy()
  expect(data[9]).toEqual(nineth)
})

test('get', () => {
  expect(labels.getAt(0)).toEqual(dataset[0])
  expect(labels.getAt(9)).toEqual(nineth)
})

test('Labels', () => {
  const lbls = labels.getLabels()
  expect(lbls.length >= LEN).toBeTruthy()
  expect(Array.isArray(lbls)).toBeTruthy()
  expect(lbls[9]).toEqual(nineth.label)
})

test('Categories', () => {
  const cats = labels.getCategories()
  expect(cats.length >= LEN).toBeTruthy()
  expect(Array.isArray(cats)).toBeTruthy()
  expect(cats[9]).toEqual(nineth.category)
})

test('Distinct cats', () => {
  const dc = labels.getDistinctCategories()
  expect(dc.includes('null')).toBeTruthy()
})

test('Size', () => {
  expect(labels.size() >= LEN).toBeTruthy()
})

test('Labels with categories', () => {
  const cl = labels.getCategorisedLabels()
  expect(cl.length > categories.length).toBeTruthy()
  expect(cl[9]).toEqual(nineth)
})

test('Labels with a `null` category', () => {
  const nl = labels.getNullCatLabels()
  expect(nl.length < LEN - categories.length).toBeTruthy()
  expect(nl[3]).toEqual({label: 'accepted', category: 'null'})
})

test('Labels with a valid category', () => {
  const vl = labels.getValidCatLabels()
  expect(vl.length > categories.length).toBeTruthy()
  expect(vl[0]).toEqual(dataset[0])
})

test('Bad data', () => {
  expect(labels.getBadData()).toEqual([])
})

test('Labels with a `bug` category', () => {
  const nl = labels.getLabelsFromCategory('bug')
  expect(nl.length > 2).toBeTruthy()
  expect(nl[0]).toEqual({label: '7.x: regression', category: 'bug'})
})

test('Category "buckets"', () => {
  const buckets = labels.getCategoryPartitions()
  expect(typeof buckets === 'object').toBeTruthy()
  expect(buckets.a11y.length >= 2).toBeTruthy()
})
