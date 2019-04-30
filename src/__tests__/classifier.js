const builder = require('../classifier')

test('attributes', () => {
  const classifier = builder()
  expect(typeof classifier).toStrictEqual('object')
  expect(typeof classifier.classifier).toStrictEqual('object')
  expect(classifier.classifier.binaryClassifierType.name).toStrictEqual(
    'bound WinnowHash',
  )
  expect(classifier.featureExtractors.name).toStrictEqual('featureExtractor')
  expect(classifier.pastTrainingSamples).toEqual([])
})
