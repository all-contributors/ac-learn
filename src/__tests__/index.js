const Learner = require('../../')
const dataset = require('../conv')('io')

const copy = x => JSON.parse(JSON.stringify(x))

describe('a learner', () => {
  test('is constructible', () => {
    const learner = new Learner({dataset})
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
    dataset: copy(dataset),
    trainSplit,
  })
  const testSplit = Math.round((1 - trainSplit) * 1000) / 1000 // because 1 - .8 = .199..
  learner.train()
  it('is knowledgeable', () => {
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

  it('is x-valid', () => {
    expect(learner.macroAvg).toBeUndefined()
    expect(learner.microAvg).toBeUndefined()
    learner.crossValidate(4)
    expect(typeof learner.macroAvg).toStrictEqual('object')
    expect(typeof learner.microAvg).toStrictEqual('object')
  })

  it('can generate bug labels', () => {
    const bugs = learner.backClassify('bug')
    expect(bugs).toContain('bug')
    expect(bugs).toContain(':bug: bug')
    expect(bugs).toContain('regression')
    expect(bugs).toContain('browser bug')
  })
  it('can generate code labels', () => {
    const code = learner.backClassify('code')
    expect(code).toContain('frontend')
    expect(code).toContain('breaking change')
    expect(code).toContain('html')
  })
})

describe('has stats', () => {
  const learner = new Learner({
    dataset: copy(dataset),
  })
  learner.crossValidate()

  const props = [
    'TP',
    'TN',
    'FP',
    'FN',
    'Accuracy',
    'Precision',
    'Recall',
    'F1',
    'count',
    'TRUE',
    'confusion',
  ]
  const objProps = ['confusion', 'labels']
  const details = []
  props.forEach(p => {
    details.push([p, 'macro'])
    details.push([p, 'micro'])
  })

  test.each(details)('has %s in %sAvg', (prop, avgType) => {
    const avg = learner[`${avgType}Avg`]
    expect(avg).toHaveProperty(prop)
    /* eslint-disable babel/no-unused-expressions */
    objProps.includes(prop)
      ? expect(typeof avg[prop]).toStrictEqual('object')
      : expect(avg[prop] >= 0).toBeTruthy()
    /* eslint-enable babel/no-unused-expressions */
  })

  // console.log('micro=', learner.microAvg, '\nmacro=', learner.macroAvg)
  it('has a correct accuracy', () => {
    const acc = avg => (avg.TP + avg.TN) / avg.count
    expect(learner.macroAvg.Accuracy).not.toEqual(acc(learner.macroAvg))
    // expect(learner.microAvg.Accuracy).toEqual(acc(learner.microAvg)) //cf. https://github.com/erelsgl/limdu/issues/64
  })

  it('has a correct precision', () => {
    const pr = avg => avg.TP / (avg.TP + avg.FP)
    expect(learner.macroAvg.Precision).not.toEqual(pr(learner.macroAvg))
    expect(learner.microAvg.Precision).toEqual(pr(learner.microAvg))
  })

  it('has a correct recall', () => {
    const re = avg => avg.TP / (avg.TP + avg.FN)
    expect(learner.macroAvg.Recall).not.toEqual(re(learner.macroAvg))
    expect(learner.microAvg.Recall).toEqual(re(learner.microAvg))
  })

  it('has a correct f1 score', () => {
    const f1 = avg =>
      (2 * (avg.Precision * avg.Recall)) / (avg.Precision + avg.Recall)
    expect(learner.macroAvg.F1).not.toEqual(f1(learner.macroAvg))
    expect(learner.microAvg.F1).toEqual(f1(learner.microAvg))
  })

  const stats = learner.getStats()
  const STAT_PROPS = [
    'TP',
    'TN',
    'FP',
    'FN',
    'Accuracy',
    'Precision',
    'Recall',
    'F1',
    'Specificity',
    'totalCount',
    'trainCount',
    'testCount',
    'confusion',
    'categoryPartition',
  ]
  test.each(STAT_PROPS)('has stat: %s', prop => {
    expect(stats).toHaveProperty(prop)
  })
  it('has category info', () => {
    expect(stats.categoryPartition.null).toHaveProperty('overall')
    expect(stats.categoryPartition.null).toHaveProperty('test')
    expect(stats.categoryPartition.null).toHaveProperty('train')
    expect(stats.categoryPartition.bug).toHaveProperty('overall')
    expect(stats.categoryPartition.bug).toHaveProperty('test')
    expect(stats.categoryPartition.bug).toHaveProperty('train')
    //assuming the other categories are set properly as well
  })
})

const setupLearners = () => {
  const learner = new Learner({
    dataset: copy(dataset),
  })
  learner.crossValidate(1)
  const learnerJSON = learner.toJSON()
  const jsonLearner = Learner.fromJSON(learnerJSON)
  return {learner, learnerJSON, jsonLearner}
}
describe('JSON', () => {
  const {learner, learnerJSON, jsonLearner} = setupLearners()
  const staticProps = [
    'classifierBuilder',
    'dataset',
    'trainSplit',
    'trainSet',
    'testSet',
    'macroAvg',
    'microAvg',
  ]

  test.each(staticProps)('(toJSON) has %s', prop => {
    expect(learnerJSON[prop]).toEqual(learner[prop])
  })

  it('(toJSON) has a classifier', () => {
    expect(typeof learnerJSON.classifier).toStrictEqual('string')
  })

  test.each(staticProps)('(fromJSON) has %s', prop => {
    expect(jsonLearner[prop]).toEqual(learnerJSON[prop])
  })

  it('(fromJSON) has a classifier', () => {
    expect(typeof jsonLearner.classifier).toStrictEqual('object')
  })
})
