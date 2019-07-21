const conv = require('../conv')

const first = '.net core'

test('io/limdu', () => {
  const data = conv('io')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].input).toStrictEqual(first)
  expect(data[0].output).toStrictEqual('code')
})

test('arr', () => {
  const data = conv('arr')
  expect(data.length > 100).toBeTruthy()
  expect(data[0]).toEqual([first, 'code'])
})

test('normal', () => {
  const data = conv('')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].label).toStrictEqual(first)
  expect(data[0].category).toStrictEqual('code')
})
