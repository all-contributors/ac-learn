const ds = require('../dataset')

test('has data', () => {
  const dataset = ds.getDataset()
  expect(dataset.length).toStrictEqual(60)
  expect(dataset[0]).toEqual(['adapter', 'plugin'])
})

test('has labels', () => {
  const lbls = ds.getLabels()
  expect(lbls.length).toStrictEqual(60)
  expect(lbls[3]).toEqual('bug')
})

test('has categories', () => {
  const cats = ds.getCategories()
  expect(cats.length).toStrictEqual(60)
  expect(cats[59]).toStrictEqual('null')
})

test('has distinct categories', () => {
  const uniqCats = ds.getDistinctCategories()
  expect(uniqCats.length).toStrictEqual(28)
})
