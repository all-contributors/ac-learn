const {writeFile, readFile} = require('fs')
const serialize = require('serialization')
const trainTestSplit = require('train-test-split')
const {Spinner} = require('clui')
const labelDS = require('./src/conv')('io')
const classifierBuilder = require('./src/classifier')
const evaluate = require('./src/evaluate')

class Learner {
  /**
   * @param {Object} opts Options.
   * @param {Object[]} [opts.dataset=require('./src/conv')('io')] Dataset (for training and testing)
   * @param {number} [trainSplit=.8] Dataset split percentage for the training set
   * @param {function(): Object} [classifier=classifierBuilder] Classifier builder function
   */
  constructor({
    dataset = labelDS,
    trainSplit = 0.8,
    classifier = classifierBuilder,
  } = {}) {
    this.dataset = dataset
    const [train, test] = trainTestSplit(dataset, trainSplit)
    this.trainSplit = trainSplit
    this.trainSet = train
    this.testSet = test
    this.classifier = classifier()
    this.classifierBuilder = classifier
  }

  train() {
    const learning = new Spinner('Learning...', [
      '⣾',
      '⣽',
      '⣻',
      '⢿',
      '⡿',
      '⣟',
      '⣯',
      '⣷',
    ])
    learning.start()
    this.classifier.trainBatch(this.trainSet)
    learning.message('Learning complete')
    learning.stop()
  }

  eval(log = false) {
    return evaluate({
      classifier: this.classifier,
      test: this.testSet,
      train: this.trainSet,
      log,
    })
  }

  serializeClassifier() {
    return serialize.toString(this.classifier, this.classifierBuilder)
  }

  serializeAndSaveClassifier(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      const data = this.serializeClassifier()
      writeFile(file, data, err => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  deserializeClassifier(serializedClassifier) {
    return serialize.fromString(serializedClassifier, __dirname)
  }

  loadAndDeserializeClassifier(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      readFile(file, 'utf8', (err, data) => {
        if (err) reject(err)
        const content = this.deserializeClassifier(data)
        resolve(content)
      })
    })
  }

  classify(data) {
    return this.classifier.classify(data)
  }

  /*
    @todo add the ability to get:
    - # of T(P|N)s|F(P|N)s (cf. [..].report.explanations, utils.PrecisionRecall())
    - m(i|a)cro average (cf. utils.PrecisionRecall())
    - precision, recall, f1-score (cf. utils.PrecisionRecall())
    - diagrams of categories based on what its training and testing sets
    - confusion matrix (cf. utils.PrecisionRecall())
    - ROC/AUC graphs
    - back classification
    @todo use utils.PrecisionRecall.Accuracy instead of doing that manually
    @todo add randomization feature to limdu's partitions (with trainTestSplit as example) and fix typos
    @todo add a (to|from)JSON or (de|)serialize for the `Learner` class which will use the classifier's one
  */
}

module.exports = Learner
