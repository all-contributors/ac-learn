const {writeFile, readFile} = require('fs')
const serialize = require('serialization')
const tvts = require('tvt-split')
const {Spinner} = require('clui')
const {PrecisionRecall, partitions, test} = require('limdu').utils
const labelDS = require('./conv')('io')
const classifierBuilder = require('./classifier')
const categories = require('./categories')
const ConfusionMatrix = require('./confusionMatrix')

const spinner = new Spinner('Loading...', [
  '⣾',
  '⣽',
  '⣻',
  '⢿',
  '⡿',
  '⣟',
  '⣯',
  '⣷',
])

/**
 * NodeJS Classification-based learner.
 * @class Learner
 */
class Learner {
  /**
   * @param {Object} opts Options.
   * @param {Object[]} [opts.dataset=require('./conv')('io')] Dataset (for training and testing)
   * @param {number} [opts.splits=[.7, .15]] Dataset split percentage for the training/validation set (default: 70%/15%/15%)
   * @param {function(): Object} [opts.classifier=classifierBuilder] Classifier builder function
   * @param {Object[]} [opts.pastTrainingSamples=[]] Past training samples for the classifier
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
   *  splits: [.6, .2]
   * })
   * @public
   */
  constructor({
    dataset = labelDS,
    splits = [0.7, 0.15],
    classifier = classifierBuilder,
    pastTrainingSamples = [],
  } = {}) {
    this.dataset = dataset
    const [train, validation, _test] = tvts(dataset, ...splits)
    this.splits = splits
    this.trainSet = train
    this.validationSet = validation
    this.testSet = _test
    this.classifier = classifier(pastTrainingSamples)
    this.classifierBuilder = classifier
    this.confusionMatrix = null //new ConfusionMatrix(categories)
  }

  /**
   * @param {Object[]} trainSet Training set
   * @memberof Learner
   * @public
   */
  train(trainSet = this.trainSet) {
    //@todo Move this so it could be used for any potentially lengthy ops
    spinner.message('Training...')
    spinner.start()
    this.classifier.trainBatch(trainSet)
    // spinner.message('Training complete')
    spinner.stop()
  }

  /**
   * @memberof Learner
   * @returns {Object} Statistics from a confusion matrix
   * @public
   */
  eval() {
    spinner.message('Evaluating...')
    spinner.start()
    const actual = []
    const predicted = []
    const len = this.testSet.length
    let idx = 0
    for (const data of this.testSet) {
      const predictions = this.classify(data.input)
      actual.push(data.output)
      predicted.push(predictions.length ? predictions[0] : 'null') //Ignores the rest (as it only wants one guess)
      spinner.message(
        `Evaluating instances (${Math.round((idx++ / len) * 10000) / 100}%)`,
      )
    }
    this.confusionMatrix = ConfusionMatrix.fromData(
      actual,
      predicted,
      categories,
    )
    // spinner.message('Evaluation complete')
    spinner.stop()
    return this.confusionMatrix.getStats()
  }

  /**
   * @memberof Learner
   * @returns {string} Serialized classifier
   * @public
   */
  serializeClassifier() {
    return serialize.toString(this.classifier, this.classifierBuilder)
  }

  /**
   * @param {string} [file='classifier.json'] Filename
   * @memberof Learner
   * @returns {Promise<(string|Error)>} Serialized classifier
   * @public
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
   * @returns {Object} Deserialized classifier
   * @public
   */
  deserializeClassifier(serializedClassifier) {
    return serialize.fromString(serializedClassifier, __dirname)
  }

  /**
   * @param {string} [file='classifier.json'] Filename
   * @memberof Learner
   * @returns {Promise<(string|Error)>} Deserialized classifier
   * @public
   */
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
   * @public
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
   * @public
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
    spinner.message('Cross-validating...')
    spinner.start()
    this.macroAvg = new PrecisionRecall()
    this.microAvg = new PrecisionRecall()
    const set = [...this.trainSet, ...this.validationSet]

    partitions.partitions(set, numOfFolds, (trainSet, validationSet) => {
      const status = `Training on ${trainSet.length} samples, testing ${validationSet.length} samples`
      //eslint-disable-next-line babel/no-unused-expressions
      log ? process.stdout.write(status) : spinner.message(status)
      this.train(trainSet)
      test(
        this.classifier,
        validationSet,
        verboseLevel,
        this.microAvg,
        this.macroAvg,
      )
    })
    spinner.message('Calculating stats')
    this.macroAvg.calculateMacroAverageStats(numOfFolds)
    this.microAvg.calculateStats()
    // spinner.message('Cross-validation complete')
    spinner.stop()
    return {
      macroAvg: this.macroAvg.fullStats(), //preferable in 2-class settings or in balanced multi-class settings
      microAvg: this.microAvg.fullStats(), //preferable in multi-class settings (in case of class imbalance)
      //https://pdfs.semanticscholar.org/1d10/6a2730801b6210a67f7622e4d192bb309303.pdf and https://datascience.stackexchange.com/a/24051/73511
    }
  }

  /**
   * @param {string} category Category name.
   * @memberof Learner
   * @returns {string[]} Labels associated with `category`
   * @public
   */
  backClassify(category) {
    return this.classifier.backClassify(category)
  }

  /**
   * @memberof Learner
   * @returns {Object} JSON representation
   * @public
   */
  toJSON() {
    const classifier = this.serializeClassifier()
    const json = {
      classifier,
      classifierBuilder: this.classifierBuilder,
      dataset: this.dataset,
      splits: this.splits,
      trainSet: this.trainSet,
      validationSet: this.validationSet,
      testSet: this.testSet,
    }
    if (this.macroAvg) json.macroAvg = this.macroAvg
    if (this.microAvg) json.microAvg = this.microAvg
    if (this.confusionMatrix) json.confusionMatrix = this.confusionMatrix
    return json
  }

  /**
   * @param {JSON|Object} json JSON form
   * @memberof Learner
   * @returns {Learner} Generated learner from `json`
   * @public
   */
  static fromJSON(json) {
    const ALLOWED_PROPS = [
      'classifierBuilder',
      'confusionMatrix',
      'trainSet',
      'validationSet',
      'testSet',
      'macroAvg',
      'microAvg',
    ]
    const newLearner = new Learner({
      dataset: json.dataset,
      splits: json.splits,
    })
    for (const prop in json) {
      if (ALLOWED_PROPS.includes(prop)) newLearner[prop] = json[prop]
    }

    newLearner.classifier = newLearner.deserializeClassifier(json.classifier)
    return newLearner
  }

  /**
   * @memberof Learner
   * @returns {Object<string, {overall: number, test: number, validation: number, train: number}>} Partitions
   * @public
   */
  getCategoryPartition() {
    spinner.message('Generating category partitions...')
    spinner.start()
    const res = {}
    categories.forEach(cat => {
      res[cat] = {
        overall: 0,
        test: 0,
        validation: 0,
        train: 0,
      }
    })
    this.dataset.forEach(data => {
      spinner.message(`Adding ${data.output} data`)
      ++res[data.output].overall
      if (this.trainSet.includes(data)) ++res[data.output].train
      if (this.validationSet.includes(data)) ++res[data.output].validation
      if (this.testSet.includes(data)) ++res[data.output].test
    })
    // spinner.message('Category partitions complete')
    spinner.stop()
    return res
  }

  /**
   * @memberof Learner
   * @returns {Object} Statistics
   * @public
   */
  getStats() {
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
      validationCount: this.validationSet.length,
      testCount: this.testSet.length,
      categoryPartition: this.getCategoryPartition(),
      //ROC, AUC
    }
  }
  /*
    @todo add the ability to get:
    - diagrams of categories including what are in training/validation/testing sets
    - ROC/AUC graphs
  */
}

module.exports = Learner
