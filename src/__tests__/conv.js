const conv = require('../conv')

const first = require('../labels.json')[0]

test('io/limdu', () => {
  const data = conv('io')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].input).toStrictEqual(first.label)
  expect(data[0].output).toStrictEqual(first.category)
})

test('arr', () => {
  const data = conv('arr')
  expect(data.length > 100).toBeTruthy()
  expect(data[0]).toEqual([first.label, first.category])
})

test('normal', () => {
  const data = conv('')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].label).toStrictEqual(first.label)
  expect(data[0].category).toStrictEqual(first.category)
})
