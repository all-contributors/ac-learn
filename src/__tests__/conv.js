const conv = require('../conv')

test('io/limdu', () => {
  const data = conv('io')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].input).toStrictEqual('0 - backlog')
  expect(data[0].output).toStrictEqual('null')
})

test('arr', () => {
  const data = conv('arr')
  expect(data.length > 100).toBeTruthy()
  expect(data[0]).toEqual(['0 - backlog', 'null'])
})

test('normal', () => {
  const data = conv('')
  expect(data.length > 100).toBeTruthy()
  expect(data[0].label).toStrictEqual('0 - backlog')
  expect(data[0].category).toStrictEqual('null')
})
