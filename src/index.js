/* eslint-disable jest/valid-title, jest/no-export */
const {writeFile, readFile, writeFileSync} = require('fs')
const serialize = require('serialization')
const tvts = require('tvt-split')
const {Spinner} = require('clui')
const {PrecisionRecall, partitions, test} = require('limdu').utils
const {use, succ, error, info} = require('nclr/symbols')
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
 * @param {Object} opts Options.
 * @param {Object[]} [opts.dataset=require('./conv')('io')] Dataset (for training and testing)
 * @param {number} [opts.splits=[.7, .15]] Dataset split percentage for the training/validation set (default: 70%/15%/15%)
 * @param {function(): Object} [opts.classifier=classifierBuilder] Classifier builder function
 * @param {Object[]} [opts.pastTrainingSamples=[]] Past training samples for the classifier
 * @param {string[]} [opts.classes=require('./categories')] List of classes (categories)
 * @example <caption>Using pre-defined data</caption>
 * const learner = new Learner()
 * @example <caption>Using a custom dataset</caption>
 * const learner = new Learner({
 *  dataset: [{input: 'something bad', output: 'bad'}, {input: 'a good thing', output: 'good'}]
 *  })
 * @example <caption>Using a specified classifier function</caption>
 * const learner = new Learner({
 *  classifier: myClassifierBuilderFn //see {@link module:./classifier} for an example (or checkout `limdu`'s examples)
 * })
 * @example <caption>Changing the train/test split percentage</caption>
 * const learner = new Learner({
 *  splits: [.6, .2]
 * })
 * @example <caption>(Re-)Using past-training samples</caption>
 * const learner = new Learner({
 *   pastTrainingSamples: [{input: 'something bad', output: 'bad'}, {input: 'a good thing', output: 'good'}]
 * })
 */
class Learner {
  constructor({
    dataset = labelDS,
    splits = [0.7, 0.15],
    classifier = classifierBuilder,
    pastTrainingSamples = [],
    classes = categories,
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
    this.classes = classes
  }

  /**
   * @param {Object[]} trainSet Training set
   * @memberof Learner
   * @public
   */
  train(trainSet = this.trainSet) {
    // spinner.start()
    // spinner.message('Training...')
    this.classifier.trainBatch(trainSet)
    // spinner.message('Training complete')
    // spinner.stop()
  }

  /**
   * @memberof Learner
   * @param {boolean} [log=false] Log events
   * @returns {Object} Statistics from a confusion matrix
   * @public
   */
  eval(log = false) {
    spinner.message('Evaluating...')
    spinner.start()
    const actual = []
    const predicted = []
    const len = this.testSet.length
    let idx = 0
    for (const data of this.testSet) {
      const predictions = this.classify(data.input)
      const guess = predictions.length ? predictions[0] : 'null'
      actual.push(data.output)
      predicted.push(guess) //Ignores the rest (as it only wants one guess)
      if (log) {
        if (guess === data.output)
          {succ(`Classified "${data.input}" as "${guess}"`)}
        else
          {error(
            `Classified "${data.input}" as "${guess}" instead of "${use(
              'info',
              data.output,
            )}"`,
          )}
      }
      spinner.message(
        `Evaluating instances (${Math.round((idx++ / len) * 10000) / 100}%)`,
      )
    }
    this.confusionMatrix = ConfusionMatrix.fromData(
      actual,
      predicted,
      this.classes,
    )

    const completeMsg = 'Evaluation complete'
    //eslint-disable-next-line babel/no-unused-expressions
    log ? succ(completeMsg) : spinner.message(completeMsg)
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
   * @param {number} [verboseLevel=0] Verbosity level on limdu's explainations
   * @param {boolean} [log=false] Cross-validation logging
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
    let fold = 0

    partitions.partitions(set, numOfFolds, (trainSet, validationSet) => {
      const status = `Fold #${fold++}\nTraining on ${
        trainSet.length
      } samples, testing ${validationSet.length} samples`
      //eslint-disable-next-line babel/no-unused-expressions
      log ? info(status) : spinner.message(status)
      this.train(trainSet)
      test(
        this.classifier,
        validationSet,
        verboseLevel,
        this.microAvg,
        this.macroAvg,
      )
    })
    if (!log) spinner.message('Calculating stats...')
    this.macroAvg.calculateMacroAverageStats(numOfFolds)
    this.microAvg.calculateStats()
    const completeMsg = 'Cross-validation complete'
    //eslint-disable-next-line babel/no-unused-expressions
    log ? succ(completeMsg) : spinner.message(completeMsg)
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
   * JSON representation of the learner with the serialized classification model.
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
   * Get the observational overall/train/validation/test count for each classes in the associated dataset.
   * @memberof Learner
   * @param {boolean} [log=false] Log events
   * @param {string} [outputFile=''] Filename for the output (to be used by chart.html)
   * @returns {Object<string, {overall: number, test: number, validation: number, train: number}>} Partitions
   * @public
   */
  getCategoryPartition(log = false, outputFile = '') {
    const hasInput = (set, input) => set.find(o => o.input === input)

    spinner.message('Generating category partitions...')
    spinner.start()
    const res = {}
    this.classes.forEach(cat => {
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
      if (hasInput(this.trainSet, data.input)) ++res[data.output].train
      if (hasInput(this.validationSet, data.input))
        {++res[data.output].validation}
      if (hasInput(this.testSet, data.input)) ++res[data.output].test
    })

    const completeMsg = 'Category partitions complete'
    //eslint-disable-next-line babel/no-unused-expressions
    log ? succ(completeMsg) : spinner.message(completeMsg)
    spinner.stop()
    if (outputFile.length) {
      writeFileSync(outputFile, JSON.stringify(res, null, 2))
      if (log) succ(`Saved the partitions to "${outputFile}"`)
    }
    return res
  }

  /**
   * @memberof Learner
   * @param {boolean} [log=false] Log events
   * @param {string} [categoryPartitionOutput=''] Filename for the output of the category partitions.
   * @returns {Object} Statistics
   * @public
   */
  getStats(log = false, categoryPartitionOutput = '') {
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
      categoryPartition: this.getCategoryPartition(
        log,
        categoryPartitionOutput,
      ),
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
