const {writeFile, readFile} = require('fs')
const serialize = require('serialization')
const trainTestSplit = require('train-test-split')
const {Spinner} = require('clui')
const {PrecisionRecall, partitions, test} = require('limdu').utils
const labelDS = require('./conv')('io')
const classifierBuilder = require('./classifier')
// const evaluate = require('./evaluate')
const categories = require('./categories')
const ConfusionMatrix = require('./confusionMatrix')

/** @class Learner */
class Learner {
  /**
   * @param {Object} opts Options.
   * @param {Object[]} [opts.dataset=require('./conv')('io')] Dataset (for training and testing)
   * @param {number} [opts.trainSplit=.8] Dataset split percentage for the training set
   * @param {function(): Object} [opts.classifier=classifierBuilder] Classifier builder function
   * @memberof Learner
   * @example <caption>Using pre-defined data</caption>
   * const learner = new Learner()
   * @example <caption>Using a custom dataset</caption>
   * const learner = new Learner({
   *  dataset: [{input: 'something bad', output: 'bad'}, {input: 'a good thing', output: 'good'}]
   * })
   * @example <caption>Using a specified classifier function</caption>
   * const learner = new Learner({
   *  classifier: myClassifierBuilderFn //see {@link module:./classifier} for an example (or checkout `limdu`'s examples)
   * })
   * @example <caption>Changing the train/test split percentage</caption>
   * const learner = new Learner({
   *  trainSplit: .6
   * })
   */
  constructor({
    dataset = labelDS,
    trainSplit = 0.8,
    classifier = classifierBuilder,
  } = {}) {
    this.dataset = dataset
    const [train, _test] = trainTestSplit(dataset, trainSplit)
    this.trainSplit = trainSplit
    this.trainSet = train
    this.testSet = _test
    this.classifier = classifier()
    this.classifierBuilder = classifier
    this.confusionMatrix = null //new ConfusionMatrix(categories)
  }

  /**
   * @param {Object[]} trainSet Training set
   * @memberof Learner
   */
  train(trainSet = this.trainSet) {
    const training = new Spinner('Training...', [
      '⣾',
      '⣽',
      '⣻',
      '⢿',
      '⡿',
      '⣟',
      '⣯',
      '⣷',
    ])
    training.start()
    this.classifier.trainBatch(trainSet)
    training.message('Training complete')
    training.stop()
  }

  /**
   * @memberof Learner
   * @returns {Object} Statistics from a confusion matrix
   */
  eval() {
    const actual = []
    const predicted = []
    for (const data of this.testSet) {
      const predictions = this.classify(data.input)
      actual.push(data.output)
      predicted.push(predictions.length ? predictions[0] : 'null') //Ignores the rest (as it only wants one guess)
    }
    this.confusionMatrix = ConfusionMatrix.fromData(
      actual,
      predicted,
      categories,
    )
    return this.confusionMatrix.getStats()
  }

  /**
   * @memberof Learner
   * @returns {string} Serialized classifier
   */
  serializeClassifier() {
    return serialize.toString(this.classifier, this.classifierBuilder)
  }

  /**
   * @param {string} file Filename
   * @memberof Learner
   * @returns {Promise<(string|Error)>} Serialized classifier
   */
  serializeAndSaveClassifier(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      const data = this.serializeClassifier()
      writeFile(file, data, err => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  /**
   * @param {string} serializedClassifier .
   * @memberof Learner
   * @returns {Object} Classifier Deserialized classifier
   */
  deserializeClassifier(serializedClassifier) {
    return serialize.fromString(serializedClassifier, __dirname)
  }

  loadAndDeserializeClassifier(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      readFile(file, 'utf8', (err, data) => {
        if (err) reject(err)
        const classifier = this.deserializeClassifier(data)
        resolve(classifier)
      })
    })
  }

  /**
   * @param {{input: *, output: *}} data Data to classify
   * @memberof Learner
   * @returns {string[]} Classes
   */
  classify(data) {
    return this.classifier.classify(data)
  }

  /**
   * @param {number} [numOfFolds=5] Cross-validation folds
   * @param {number} [verboseLevel=0] Verbosity
   * @param {boolean} [log=false] Pre-training logging
   * @returns {{microAvg: Object, macroAvg: Object}} Averages
   * @memberof Learner
   */
  crossValidate(numOfFolds = 5, verboseLevel = 0, log = false) {
    /* ML Reminder (https://o.quizlet.com/Xc3kmIUi19opPDYn3hTo3A.png)
    T: True     F: False
    P: Positive N: Negative
    TP: The actual and expected category are the same
    FP: The actual category isn't the same as the expected one
    FN: The expected category isn't in the list of actual (guessed) categories
    TN: The rest

    Precision (Pr, PPV): TP / (TP + FP) <=> TP / predictedP
    Recall (R, TPR): TP / (TP + FN) <=> TP / actualP
    Accuracy (A): (TP + TN) / Total
    Specificity (S, TNR): TN / (FP + TN) <=> TN / actualN
    F_1 (or effectiveness)  = 2 * (Pr * R) / (Pr + R)
    ...
    */
    this.macroAvg = new PrecisionRecall()
    this.microAvg = new PrecisionRecall()

    partitions.partitions(this.dataset, numOfFolds, (trainSet, testSet) => {
      if (log)
        process.stdout.write(
          `Training on ${trainSet.length} samples, testing ${
            testSet.length
          } samples`,
        )
      this.train(trainSet)
      test(this.classifier, testSet, verboseLevel, this.microAvg, this.macroAvg)
    })
    this.macroAvg.calculateMacroAverageStats(numOfFolds)
    this.microAvg.calculateStats()
    return {
      macroAvg: this.macroAvg.fullStats(), //preferable in 2-class settings or in balanced multi-class settings
      microAvg: this.microAvg.fullStats(), //preferable in multi-class settings (in case of class imbalance)
      //https://pdfs.semanticscholar.org/1d10/6a2730801b6210a67f7622e4d192bb309303.pdf and https://datascience.stackexchange.com/a/24051/73511
    }
  }

  /**
   * @param {string} category Category name
   * @memberof Learner
   * @returns {string[]} Labels associated with `category`
   */
  backClassify(category) {
    return this.classifier.backClassify(category)
  }

  /**
   * @memberof Learner
   * @returns {Object} JSON representation
   */
  toJSON() {
    const classifier = this.serializeClassifier()
    const json = {
      classifier,
      classifierBuilder: this.classifierBuilder,
      dataset: this.dataset,
      trainSplit: this.trainSplit,
      trainSet: this.trainSet,
      testSet: this.testSet,
    }
    if (this.macroAvg) json.macroAvg = this.macroAvg
    if (this.microAvg) json.microAvg = this.microAvg
    return json
  }

  /**
   * @param {JSON|Object} json JSON form
   * @memberof Learner
   * @returns {Learner} Generated learner from `json`
   */
  static fromJSON(json) {
    const ALLOWED_PROPS = [
      'classifierBuilder',
      'trainSet',
      'testSet',
      'macroAvg',
      'microAvg',
    ]
    const newLearner = new Learner({
      dataset: json.dataset,
      trainSplit: json.trainSplit,
    })
    for (const prop in json) {
      if (ALLOWED_PROPS.includes(prop)) newLearner[prop] = json[prop]
    }

    newLearner.classifier = newLearner.deserializeClassifier(json.classifier)
    return newLearner
  }

  /**
   * @memberof Learner
   * @returns {Object<string, {overall: number, test: number, train: number}>} Partitions
   */
  getCategoryPartition() {
    const res = {}
    categories.forEach(cat => {
      res[cat] = {
        overall: 0,
        test: 0,
        train: 0,
      }
    })
    this.dataset.forEach(data => {
      ++res[data.output].overall
      if (this.trainSet.includes(data)) ++res[data.output].train
      if (this.testSet.includes(data)) ++res[data.output].test
    })
    return res
  }

  /**
   * @memberof Learner
   * @returns {Object} Statistics
   */
  getStats() {
    //@todo use C3.js for a stacked baar chart
    const {
      TP,
      TN,
      FP,
      FN,
      Precision,
      Accuracy,
      Recall,
      F1,
      count,
      confusion,
    } = this.microAvg
    return {
      TP,
      TN,
      FP,
      FN,
      confusion,
      Precision,
      Accuracy,
      Recall,
      F1,
      Specificity: TN / (FP + TN),
      totalCount: count,
      trainCount: this.trainSet.length,
      testCount: this.testSet.length,
      categoryPartition: this.getCategoryPartition(),
      //ROC, AUC
    }
  }
  /*
    @todo add the ability to get:
    - diagrams of categories based on what its training and testing sets
    - [WIP] confusion matrix (cf. utils.PrecisionRecall()) //cf. https://github.com/erelsgl/limdu/issues/63
    - ROC/AUC graphs
    @todo use utils.PrecisionRecall.Accuracy instead of doing that manually //waiting on ^
    @todo add randomization feature to limdu's partitions (with trainTestSplit as example) and fix typos //cf. https://github.com/erelsgl/limdu/issues/65
  */
}

module.exports = Learner
