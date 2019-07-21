import labels from '../labels'
import categories from '../categories'

const LEN = 486

test('All data', () => {
  const data = labels.getAll()
  expect(data.length >= LEN).toBeTruthy()
  expect(Array.isArray(data)).toBeTruthy()
  expect(data[9]).toEqual({label: '7.x: regression', category: 'bug'})
})

test('get', () => {
  expect(labels.getAt(0)).toEqual({label: '.net core', category: 'code'})
  expect(labels.getAt(9)).toEqual({label: '7.x: regression', category: 'bug'})
})

test('Labels', () => {
  const lbls = labels.getLabels()
  expect(lbls.length >= LEN).toBeTruthy()
  expect(Array.isArray(lbls)).toBeTruthy()
  expect(lbls[9]).toEqual('7.x: regression')
})

test('Categories', () => {
  const cats = labels.getCategories()
  expect(cats.length >= LEN).toBeTruthy()
  expect(Array.isArray(cats)).toBeTruthy()
  expect(cats[9]).toEqual('bug')
})

test('Distinct cats', () => {
  const dc = labels.getDistinctCategories()
  expect(dc.includes('null')).toBeTruthy()
})

test('Size', () => {
  expect(labels.size()).toStrictEqual(LEN)
})

test('Labels with categories', () => {
  const cl = labels.getCategorisedLabels()
  expect(cl.length > categories.length).toBeTruthy()
  expect(cl[9]).toEqual({label: '7.x: regression', category: 'bug'})
})

test('Labels with a `null` category', () => {
  const nl = labels.getNullCatLabels()
  expect(nl.length < LEN - categories.length).toBeTruthy()
  expect(nl[3]).toEqual({label: '2.x', category: 'null'})
})

test('Labels with a valid category', () => {
  const vl = labels.getValidCatLabels()
  expect(vl.length > categories.length).toBeTruthy()
  expect(vl[0]).toEqual({label: '.net core', category: 'code'})
})

test('Bad data', () => {
  expect(labels.getBadData()).toEqual([])
})

test('Labels with a `bug` category', () => {
  const nl = labels.getLabelsFromCategory('bug')
  expect(nl.length > 2).toBeTruthy()
  expect(nl[0]).toEqual({label: '7.x: regression', category: 'bug'})
})
