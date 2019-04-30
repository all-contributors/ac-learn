const Learner = require('../../')
const dataset = require('../conv')('io')

describe('a learner', () => {
  test('is constructible', () => {
    const learner = new Learner(dataset)
    const trainSplit = 0.8
    const testSplit = Math.round((1 - 0.8) * 1000) / 1000 // because 1 - .8 = .199..
    expect(learner.dataset).toEqual(dataset)
    expect(Array.isArray(learner.trainSet)).toBeTruthy()
    expect(learner.trainSet.length).toStrictEqual(dataset.length * trainSplit)
    expect(Array.isArray(learner.testSet)).toBeTruthy()
    expect(learner.testSet.length).toStrictEqual(dataset.length * testSplit)
    expect(learner.trainSplit).toStrictEqual(trainSplit)
    expect(typeof learner.classifier).toStrictEqual('object')
    expect(typeof learner.classifierBuilder).toStrictEqual('function')
    expect(learner.classifierBuilder.name).toStrictEqual('classifierBuilder')
  })

  test('pre-training evaluation', () => {
    const learner = new Learner()
    const ev = learner.eval()
    const MIN_ACCURACY = 0.4
    const MIN_CORRECT = MIN_ACCURACY * learner.testSet.length
    expect(ev.correctResults >= MIN_CORRECT).toBeTruthy()
    expect(ev.testAccuracy >= MIN_ACCURACY).toBeTruthy()
  })

  test('post-training evaluation', () => {
    const learner = new Learner()
    learner.train()
    const ev = learner.eval()
    const MIN_ACCURACY = 0.6
    const MIN_CORRECT = MIN_ACCURACY * learner.testSet.length
    expect(ev.correctResults >= MIN_CORRECT).toBeTruthy()
    expect(ev.testAccuracy >= MIN_ACCURACY).toBeTruthy()
  })

  test('serialization', () => {
    const learner = new Learner()
    const str = learner.serializeClassifier()
    expect(typeof str).toStrictEqual('string')
    expect(str.length > 'classifier'.length).toBeTruthy()
  })

  test('serialized and saved', done => {
    const learner = new Learner()
    const str = learner.serializeClassifier()
    const file = '_sns.json'
    learner
      .serializeAndSaveClassifier(file)
      /* eslint-disable no-console */
      .then(f => expect(f).toStrictEqual(str), console.error)
      /* eslint-enable no-console */
      .then(_ => done())
  })

  test('deserialization', () => {
    const str = `{\n\t"createNewObjectString": "(pastTrainingSamples = []) => {\\r\\n  const limdu = require('limdu')\\r\\n  \\r\\n  // Word extractor - a function that takes a sample and adds features to a given features set:\\r\\n  const featureExtractor = (input, features) => { //similar to limdu.features.NGramsOfWords(1)\\r\\n    input\\r\\n      .split(/[ \\\\t,;:.-_]/) //perhaps remove _ to keep emoji words joint\\r\\n      .filter(Boolean)\\r\\n      .forEach(word => {\\r\\n        features[word.toLowerCase()] = 1\\r\\n      })\\r\\n  }\\r\\n\\r\\n  const TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {\\r\\n    binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10}),\\r\\n  })\\r\\n\\r\\n  const classifier = new limdu.classifiers.EnhancedClassifier({\\r\\n    classifierType: TextClassifier,\\r\\n    featureExtractor, //or extract\\r\\n    pastTrainingSamples\\r\\n  })\\r\\n\\r\\n  return classifier\\r\\n}",\n\t"object": {\n\t\t"classifier": {},\n\t\t"pastTrainingSamples": []\n\t}\n}`
    const learner = new Learner()
    const classifier = learner.deserializeClassifier(str)
    expect(typeof classifier).toStrictEqual('object')
    expect(classifier.pastTrainingSamples).toEqual([])
  })
})

/* describe('a knowledgeable learner', () => { //Commented out because the issue is affecting the whole suite
  const learner = new Learner()
  learner.train()
  test('is knowledgeable', () => {
    // expect(learner.dataset).toEqual(dataset) //cf. https://github.com/erelsgl/limdu/issues/62
    expect(Array.isArray(learner.trainSet)).toBeTruthy()
    // expect(learner.trainSet.length).toStrictEqual(dataset.length * trainSplit)
    // expect(Array.isArray(learner.testSet)).toBeTruthy()
    // expect(learner.testSet.length).toStrictEqual(dataset.length * testSplit)
    // expect(learner.trainSplit).toStrictEqual(trainSplit)
    // expect(typeof learner.classifier).toStrictEqual('object')
    // expect('null' in learner.classifier.classifier.mapClassnameToClassifier).toBeTruthy()
    // expect('doc' in learner.classifier.classifier.mapClassnameToClassifier).toBeTruthy()
    // expect(typeof learner.classifierBuilder).toStrictEqual('function')
    // expect(learner.classifierBuilder.name).toStrictEqual('classifierBuilder')
    // expect(learner.classifier.classifier.pastTrainingSamples.length).toStrictEqual(learner.trainSet.length)
  })
}) */
