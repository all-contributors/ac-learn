const Learner = require('../../')
const dataset = require('../conv')('io')

describe('a learner', () => {
  test('is constructible', () => {
    const learner = new Learner(dataset)
    const trainSplit = 0.8
    const testSplit = Math.round((1 - trainSplit) * 1000) / 1000 // because 1 - .8 = .199..
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

  const SERIAL_STR = `{
  "createNewObjectString": "(pastTrainingSamples = []) => {\\n  const {\\n    multilabel,\\n    Winnow,\\n    EnhancedClassifier\\n  } = require('limdu').classifiers; // Word extractor - a function that takes a sample and adds features to a given features set:\\n\\n\\n  const TextClassifier = multilabel.BinaryRelevance.bind(0, {\\n    binaryClassifierType: Winnow.bind(0, {\\n      retrain_count: 10\\n    })\\n  });\\n  const classifier = new EnhancedClassifier({\\n    classifierType: TextClassifier,\\n    featureExtractor: (input, features) => {\\n      //similar to limdu.features.NGramsOfWords(1)\\n      input.split(/[ \\\\t,;:.-_]/) //perhaps remove _ to keep emoji words joint\\n      .filter(Boolean).forEach(word => {\\n        features[word.toLowerCase()] = 1;\\n      });\\n    },\\n    //or extract\\n    pastTrainingSamples\\n  });\\n  return classifier;\\n}",
  "object": {\n\t\t"classifier": {},\n\t\t"pastTrainingSamples": []\n\t}\n}`
  const SERIAL_JSON = JSON.parse(SERIAL_STR)

  test('serialized and saved', done => {
    const learner = new Learner()
    learner
      .serializeAndSaveClassifier('_sns.json')
      /* eslint-disable no-console */
      .then(
        data => expect(JSON.parse(data)).toEqual(SERIAL_JSON),
        console.error,
      )
      /* eslint-enable no-console */
      .then(_ => done())
  })

  test('deserialization', () => {
    const learner = new Learner()
    const classifier = learner.deserializeClassifier(SERIAL_STR)
    expect(typeof classifier).toStrictEqual('object')
    expect(classifier.pastTrainingSamples).toEqual([])
  })

  test('loaded and deserialized', done => {
    const learner = new Learner()
    learner
      .loadAndDeserializeClassifier('_sns.json')
      /* eslint-disable no-console */
      .then(classifier => {
        expect(classifier).not.toMatchObject(learner.classifier)
        // const moddedClassifier = {
        //   ...learner.classifier,
        //   classifier: {
        //     binaryClassifierType: Winnow,
        //     debug: false,
        //     mapClassnameToClassifier: {}
        //   },
        //   createNewObjectString: SERIAL_JSON.createNewObjectString,
        //   featureDocumentFrequency: undefined,
        //   documentCount: undefined,
        // }
        // expect(classifier).toMatchObject(moddedClassifier)
      }, console.error)
      /* eslint-enable no-console */
      .then(_ => done())
  })
})

describe('a knowledgeable learner', () => {
  //Commented out because the issue is affecting the whole suite
  const trainSplit = 0.8
  const learner = new Learner({
    dataset: JSON.parse(JSON.stringify(dataset)),
    trainSplit,
  })
  const testSplit = Math.round((1 - trainSplit) * 1000) / 1000 // because 1 - .8 = .199..
  learner.train()
  test('is knowledgeable', () => {
    // expect(learner.dataset).toEqual(dataset) //cf. https://github.com/erelsgl/limdu/issues/62
    expect(Array.isArray(learner.trainSet)).toBeTruthy()
    expect(learner.trainSet.length).toStrictEqual(dataset.length * trainSplit)
    expect(Array.isArray(learner.testSet)).toBeTruthy()
    expect(learner.testSet.length).toStrictEqual(dataset.length * testSplit)
    expect(learner.trainSplit).toStrictEqual(trainSplit)
    expect(typeof learner.classifier).toStrictEqual('object')
    expect(
      'null' in learner.classifier.classifier.mapClassnameToClassifier,
    ).toBeTruthy()
    expect(
      'doc' in learner.classifier.classifier.mapClassnameToClassifier,
    ).toBeTruthy()
    expect(typeof learner.classifierBuilder).toStrictEqual('function')
    expect(learner.classifierBuilder.name).toStrictEqual('classifierBuilder')
    expect(learner.classifier.pastTrainingSamples.length).toStrictEqual(
      learner.trainSet.length,
    )
  })
})
