const Table = require('easy-table')
const camel = require('camel-case')
const {
  objectify,
  sum,
  column,
  matrixSum,
  half,
  rmEmpty,
  clrVal,
  fxSum,
  mapObject,
} = require('./utils')

const METRICS = [
  'Accuracy',
  'F1',
  'FallOut',
  'MissRate',
  'Precision',
  'Prevalence',
  'Recall',
  'Specificity',
]
const RES_METRICS = ['TP', 'FP', 'FN', 'TN', ...METRICS]

/**
 * @param {ConfusionMatrix} cm Confusion matrix
 * @param {string} type Average type (`Mi` or `Ma`)
 * @returns {{accuracy: number, f1: number, fallOut: number, missRate: number, precision: number, prevalence: number, recall: number, specificity: number}}
 * Micro/Macro-average metrics
 */
const mAvg = (cm, type) => {
  const prefix = `get${type}cro`
  const res = {}
  for (const m of METRICS) res[camel(m)] = cm[`${prefix}${m}`]()
  return res
}

/**
 * @param {ConfusionMatrix} cm Confusion matrix
 * @param {number} sampleSize Sample size (total)
 * @returns {{tp: number, fp: number, fn: number, tn: number, total: number, accuracy: number, f1: number, fallOut: number, missRate: number, precision: number, prevalence: number, recall: number, specificity: number}}
 * Results per class
 */
const getResults = (cm, sampleSize) => {
  const results = category => {
    const total = cm.getPositive(category)
    const res = {
      total,
      samplePortion: total / sampleSize,
    }
    RES_METRICS.forEach(m => {
      res[camel(m)] = cm[`get${m}`](category)
    })
    res.confusionMatrix = [[res.tp, res.fp], [res.fn, res.tn]]
    return res
  }
  return mapObject(cm.classes, cls => results(cls))
}

/**
 * Multi-class focused confusion matrix
 * @class ConfusionMatrix
 */
class ConfusionMatrix {
  /**
   * @param {string[]} classes List of classes/categories
   * @param {?Object<Object, number>} matrix Matrix
   */
  constructor(classes, matrix = null) {
    this.classes = [...new Set(classes)]
    if (matrix === null) {
      this.matrix = objectify(this.classes)
      for (const category in this.matrix) {
        if (this.matrix.hasOwnProperty(category))
          this.matrix[category] = objectify(this.classes, 0)
      }
    } else this.matrix = matrix
  }

  addEntry(actual, predicted) {
    if (this.matrix[actual][predicted]) return ++this.matrix[actual][predicted]
    else {
      this.matrix[actual][predicted] = 1
      return this.matrix[actual][predicted]
    }
  }

  setEntry(actual, predicted, val) {
    this.matrix[actual][predicted] = val
  }

  getEntry(actual, predicted) {
    return this.matrix[actual][predicted]
  }

  /**
   * Creates a confusion matrix from the `actual` and `predictions` classes.
   * @param {string[]} actual Actual classes
   * @param {string[]} predictions Predicted classes
   * @param {string[]} classes Classes/categories to use
   * @returns {ConfusionMatrix} Filled confusion matrix
   */
  static fromData(actual, predictions, classes = []) {
    if (actual.length !== predictions.length)
      throw new Error("actual and predictions don't have the same length")
    const cm = new ConfusionMatrix(
      classes.length ? classes : [...actual, ...predictions],
    )
    for (let i = 0; i < actual.length; ++i) {
      cm.addEntry(actual[i], predictions[i])
    }
    return cm
  }

  /**
   * Get the total count of **all** entries.
   * @returns {number} Total count
   */
  getTotal() {
    return matrixSum(this.matrix)
  }

  /**
   * Number of elements _in_ the `category` class correctly predicted.
   * @param {string} category Class/category considered as positive
   * @returns {number} True Positives
   */
  getTP(category) {
    return this.matrix[category][category]
  }

  /**
   * Number of elements that _aren't in_ the `category` class but predicted as such.
   * @param {string} category Class/category considered as positive
   * @returns {number} False Positives
   */
  getFP(category) {
    const predicted = column(this.matrix, category)
    return sum(...predicted) - this.getTP(category)
  }

  /**
   * Number of elements _in_ the `category` class but predicted as not being in it.
   * @param {string} category Class/category considered as positive
   * @returns {number} False Negatives
   */
  getFN(category) {
    return sum(...Object.values(this.matrix[category])) - this.getTP(category)
  }

  /**
   * Number of elements that _aren't in_ the `category` class correctly predicted.
   * @param {string} category Class/category considered as positive
   * @returns {number} True Negatives
   */
  getTN(category) {
    const FN_TP = sum(...Object.values(this.matrix[category]))
    return this.getTotal() - (this.getFP(category) + FN_TP)
  }

  /**
   * Diagonal of truth (top-left &rarr; bottom-right)
   * @returns {number[]} Numbers in the diagonal
   */
  getDiagonal() {
    const diag = []
    for (const row in this.matrix) {
      if (this.matrix.hasOwnProperty(row)) diag.push(this.matrix[row][row])
    }
    return diag
  }

  /**
   * Number of correct (truthful) predictions.
   * @returns {number} TP
   */
  getTrue() {
    return sum(...this.getDiagonal())
  }

  /**
   * Number of incorrect predictions.
   * @returns {number} FP + FN
   */
  getFalse() {
    return this.getTotal() - this.getTrue()
  }

  /**
   * Number of real (actual) "positive" elements (i.e. elements that belong to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TP + FN
   */
  getPositive(category) {
    return this.getTP(category) + this.getFN(category)
  }

  /**
   * Number of real (actual) "negative" elements (i.e. elements that don't belong to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TN + FP
   */
  getNegative(category) {
    return this.getTN(category) + this.getFP(category)
  }

  /**
   * Number of predicted "positive" elements (i.e. elements guessed as belonging to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TP + FN
   */
  getPredPositive(category) {
    return this.getTP(category) + this.getFP(category)
  }

  /**
   * Number of predicted "negative" elements (i.e. elements guessed as not belonging to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TN + FP
   */
  getPredNegative(category) {
    return this.getTN(category) + this.getFN(category)
  }

  /**
   * Prediction accuracy for `category`.
   * @param {string} category Class/category considered as positive
   * @returns {number} (TP + TN) / (TP + TN + FP + FN)
   */
  getAccuracy(category) {
    return (this.getTP(category) + this.getTN(category)) / this.getTotal()
  }

  /**
   * Micro-average of accuracy.
   * @returns {number} (TP0 + ... + TPn + TN0 + ... + TNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)
   */
  getMicroAccuracy() {
    const Ts = this.getTrue()
    return Ts / (Ts + this.getFalse())
  }

  getMacroAccuracy() {
    return fxSum(this, 'Accuracy') / this.classes.length
  }

  /**
   * Predicition recall.
   * @param {string} category Class/category considered as positive
   * @alias getSensitivity
   * @alias getTotalPositiveRate
   * @returns {number} TP / (TP + FN)
   */
  getRecall(category) {
    return this.getTP(category) / this.getPositive(category)
  }

  /**
   * Micro-average of recall.
   * @returns {number} (TP0 + ... + TPn) / (TP0 + ... + TPn + FN0 + ... + FNn)
   */
  getMicroRecall() {
    const TPs = this.getTrue()
    const FNs = fxSum(this, 'FN')
    return TPs / (TPs + FNs)
  }

  /**
   * Macro-average of recall.
   * @returns {number} (R0 + R1 + ... + Rn-1) / n
   */
  getMacroRecall() {
    return fxSum(this, 'Recall') / this.classes.length
  }

  /**
   * Prediction precision for `category`.
   * @alias getPositivePredictiveValue
   * @param {string} category Class/category considered as positive
   * @returns {number} TP / (TP + FP)
   */
  getPrecision(category) {
    return this.getTP(category) / this.getPredPositive(category)
  }

  /**
   * Micro-average of the precision.
   * @returns {number} (TP0 + ... + TPn) / (TP0 + ... + TPn + FP0 + ... FPn)
   */
  getMicroPrecision() {
    const TPs = this.getTrue()
    const FPs = fxSum(this, 'FP')
    return TPs / (TPs + FPs)
  }

  /**
   * Macro-average of the precsion.
   * @returns {number} (Pr0 + Pr1 + ... + Pr_n-1) / n
   */
  getMacroPrecision() {
    return fxSum(this, 'Precision') / this.classes.length
  }

  /**
   * Prediction F1 score for `category`.
   * @alias getPositivePredictiveValue
   * @param {string} category Class/category considered as positive
   * @returns {number} 2 * (Pr * R) / (Pr + R)
   */
  getF1(category) {
    const Pr = this.getPrecision(category)
    const R = this.getRecall(category)
    return (2 * (Pr * R)) / (Pr + R)
  }

  /**
   * Micro-average of the F1 score.
   * @todo Check if it's correct if the TPs/... is the right way
   * @returns {number} 2 * (TP0 + ... + TPn) / (2 * (TP0 + ... + TPn) + (FN0 + ... + FNn) + (FP0 + ... + FPn))
   */
  getMicroF1() {
    // const Prs = fxSum(this, 'Precision')
    // const Rs = fxSum(this, 'Recall')
    /* 2 * ((Pr0 + ... + Pr_n) * (R0 + ... + Rn)) / ((Pr0 + ... + Pr_n) + (R0 + ... + Rn)) */
    // return (2 * (Prs * Rs)) / (Prs + Rs)
    const tp = 2 * this.getTrue()
    const FPs = fxSum(this, 'FP')
    const FNs = fxSum(this, 'FN')
    return tp / (tp + FNs + FPs)
  }

  /**
   * Macro-average of the precision.
   * @returns {number} (F0_1 + F1_1 + ... + F_n-1_1) / n
   */
  getMacroF1() {
    return fxSum(this, 'F1') / this.classes.length
  }

  /**
   * Miss rates on predictions for `category`.
   * @alias getFalseNegativeRate
   * @param {string} category Class/category considered as positive
   * @returns {number} FN / (TP + FN)
   */
  getMissRate(category) {
    return this.getFN(category) / this.getPositive(category)
  }

  /**
   * Micro-average of the miss rate.
   * @returns {number} (FN0 + ... + FNn) / (TP0 + ... + TPn + FN0 + ... FNn)
   */
  getMicroMissRate() {
    const TPs = this.getTrue()
    const FNs = fxSum(this, 'FN')
    return FNs / (TPs + FNs)
  }

  /**
   * Macro-average of the miss rate.
   * @returns {number} (M0 + M1 + ... + Mn) / n
   */
  getMacroMissRate() {
    return fxSum(this, 'MissRate') / this.classes.length
  }

  /**
   * Fall out (false alarm) on predictions for `category`.
   * @alias getFalsePositiveRate
   * @param {string} category Class/category considered as positive
   * @returns {number} FP / (FP + TN)
   */
  getFallOut(category) {
    return this.getFP(category) / this.getNegative(category)
  }

  /**
   * Micro-average of the fall out.
   * @returns {number} (FP0 + ... + FPn) / (FP0 + ... + FPn + TN0 + ... TNn)
   */
  getMicroFallOut() {
    const FPs = fxSum(this, 'FP')
    const TNs = fxSum(this, 'TN')
    return FPs / (FPs + TNs)
  }

  /**
   * Macro-average of the fall out.
   * @returns {number} (Fo0 + Fo1 + ... + Fo_n) / n
   */
  getMacroFallOut() {
    return fxSum(this, 'FallOut') / this.classes.length
  }

  /**
   * Specificity on predictions for `category`.
   * @alias getSelectivity
   * @alias getTrueNegativeRate
   * @param {string} category Class/category considered as positive
   * @returns {number} TN / (FP + TN)
   */
  getSpecificity(category) {
    return this.getTN(category) / this.getNegative(category)
  }

  /**
   * Micro-average of the specificity.
   * @returns {number} (TN0 + ... + TNn) / (FP0 + ... + FPn + TN0 + ... TNn)
   */
  getMicroSpecificity() {
    const FPs = fxSum(this, 'FP')
    const TNs = fxSum(this, 'TN')
    return TNs / (FPs + TNs)
  }

  /**
   * Macro-average of the specificity.
   * @returns {number} (S0 + S1 + ... + Sn) / n
   */
  getMacroSpecificity() {
    return fxSum(this, 'Specificity') / this.classes.length
  }

  /**
   * Prevalence on predictions for `category`.
   * @param {string} category Class/category considered as positive
   * @returns {number} (TP + FN) / (TP + TN + FP + FN)
   */
  getPrevalence(category) {
    return this.getPositive(category) / this.getTotal()
  }

  /**
   * Micro-average of the prevalence.
   * @returns {number} (TP0 + ... + TPn + FN0 + ... + FNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)
   */
  getMicroPrevalence() {
    const P = fxSum(this, 'Positive')
    const N = fxSum(this, 'Negative')
    return P / (P + N)
  }

  /**
   * Macro-average of the prevalence.
   * @returns {number} (S0 + S1 + ... + Sn) / n
   */
  getMacroPrevalence() {
    return fxSum(this, 'Prevalence') / this.classes.length
  }

  //getFalseDiscoveryRate: getFP() / getPredictedPositive()
  //getFalseOmmissionRate: getFN() / getPredictedNegative()
  //getNegPredictiveVal: getTN() / getPredictedNegative()
  //getPosLikelihoodRatio: getRecall() / getFallOut()
  //getNegLikelihoodRatio: getSpecificity() / getMissRate()
  //getDiagnosticOddsRatio: getPosLikelihoodRatio() / getNegLikelihoodRatio()
  //Macro/Micro Avg versions of the above

  /**
   * @param {Object} opt Options
   * @param {boolean} [opt.split=false] Split the classes in half (&rarr; 2 matrices)
   * @param {boolean} [opt.clean=false] Remove empty column/row pairs
   * @param {boolean} [opt.colours=true] Colourize cells
   * @returns {string} String representation
   */
  toString({
    split = false,
    clean = false,
    colours = true,
    maxValue = 100,
  } = {}) {
    const mtx = clean ? rmEmpty(this.matrix) : this.matrix
    const classes = Object.keys(mtx)

    if (split) {
      const [head, tail] = half(classes)
      const t0 = new Table()
      const t1 = new Table()
      for (const row of classes) {
        t0.cell('1/2 Actual \\ Predicted', `   ${row}`)

        head.forEach(cls => {
          let val = this.matrix[row][cls].toFixed(2)
          if (colours) {
            val = clrVal(val, maxValue, row === cls)
          }
          t0.cell(cls, val)
        })
        t0.newRow()

        t1.cell('2/2 Actual \\ Predicted', `   ${row}`)
        tail.forEach(cls => {
          let val = this.matrix[row][cls].toFixed(2)
          if (colours) {
            val = clrVal(val, maxValue, row === cls)
          }
          t1.cell(cls, val)
        })
        t1.newRow()
      }
      return `${t0.toString()}\n${t1.toString()}`
    }
    const t = new Table()
    for (const row in this.matrix) {
      if (this.matrix.hasOwnProperty(row)) {
        t.cell('Actual \\ Predicted', `   ${row}`)
        this.classes.forEach(cls => {
          let val = this.matrix[row][cls].toFixed(2)
          if (colours) {
            val = clrVal(val, maxValue, row === cls)
          }
          t.cell(cls, val)
        })
        t.newRow()
      }
    }
    return t.toString()
  }

  /**
   * @returns {string} Short statistics (total, true, false, accuracy, precision, recall and f1)
   */
  getShortStats() {
    return `Total: ${this.getTotal()}\nTrue: ${this.getTrue()}\nFalse: ${this.getFalse()}\nAccuracy: ${this.getMicroAccuracy() *
      100}%\nPrecision: ${this.getMicroPrecision() *
      100}%\nRecall: ${this.getMicroPrecision() *
      100}%\nF1: ${this.getMicroF1() * 100}%`
  }

  /**
   * @returns {{total: number, correctPredictions: number, incorrectPredictions: number, classes: string[], microAvg: Object, macroAvg: Object, results: Object}}
   * (Long) statistics
   */
  getStats() {
    const total = this.getTotal()
    return {
      total,
      correctPredictions: this.getTrue(),
      incorrectPredictions: this.getFalse(),
      classes: this.classes,
      microAvg: mAvg(this, 'Mi'),
      macroAvg: mAvg(this, 'Ma'),
      results: getResults(this, total),
    }
  }
}

module.exports = ConfusionMatrix
