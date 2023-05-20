const Table = require('easy-table')
const camel = require('camel-case').camelCase
const {
  objectify,
  sum,
  column,
  matrixSum,
  half,
  rmEmpty,
  clrVal,
  fxSum,
  fxWeightedSum,
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
 * @private
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
 * @private
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
    res.confusionMatrix = [
      [res.tp, res.fp],
      [res.fn, res.tn],
    ]
    return res
  }
  return mapObject(cm.classes, cls => results(cls))
}

/**
 * Multi-class focused confusion matrix.
 * @class ConfusionMatrix
 */
class ConfusionMatrix {
  /**
   * @param {string[]} classes List of classes/categories
   * @param {?Object<Object, number>} matrix Matrix
   * @protected
   */
  constructor(classes, matrix = null) {
    this.classes = [...new Set(classes)]
    if (matrix === null) {
      this.matrix = objectify(this.classes)
      for (const category in this.matrix) {
        if (this.matrix.hasOwnProperty(category)) {
          this.matrix[category] = objectify(this.classes, 0)
        }
      }
    } else this.matrix = matrix
  }

  /**
   * @param {string} actual Actual class
   * @param {string} predicted Predicted class
   * @returns {number} Updated entry
   * @protected
   */
  addEntry(actual, predicted) {
    if (this.matrix[actual][predicted]) return ++this.matrix[actual][predicted]
    else {
      this.matrix[actual][predicted] = 1
      return this.matrix[actual][predicted]
    }
  }

  /**
   * @param {string} actual Actual class
   * @param {string} predicted Predicted class
   * @param {number} val New entry
   * @protected
   */
  setEntry(actual, predicted, val) {
    this.matrix[actual][predicted] = val
  }

  /**
   * @param {string} actual Actual class
   * @param {string} predicted Predicted class
   * @returns {number} Entry
   * @protected
   */
  getEntry(actual, predicted) {
    return this.matrix[actual][predicted]
  }

  /**
   * Creates a confusion matrix from the `actual` and `predictions` classes.
   * @param {string[]} actual Actual classes
   * @param {string[]} predictions Predicted classes
   * @param {string[]} classes Classes/categories to use
   * @returns {ConfusionMatrix} Filled confusion matrix
   * @protected
   */
  static fromData(actual, predictions, classes = []) {
    if (actual.length !== predictions.length) {
      throw new Error("actual and predictions don't have the same length")
    }
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
   * @protected
   */
  getTotal() {
    return matrixSum(this.matrix)
  }

  /**
   * Number of elements _in_ the `category` class correctly predicted.
   * @param {string} category Class/category considered as positive
   * @returns {number} True Positives
   * @protected
   */
  getTP(category) {
    return this.matrix[category][category]
  }

  /**
   * Number of elements that _aren't in_ the `category` class but predicted as such.
   * @param {string} category Class/category considered as positive
   * @returns {number} False Positives
   * @protected
   */
  getFP(category) {
    const predicted = column(this.matrix, category)
    return sum(...predicted) - this.getTP(category)
  }

  /**
   * Number of elements _in_ the `category` class but predicted as not being in it.
   * @param {string} category Class/category considered as positive
   * @returns {number} False Negatives
   * @protected
   */
  getFN(category) {
    return sum(...Object.values(this.matrix[category])) - this.getTP(category)
  }

  /**
   * Number of elements that _aren't in_ the `category` class correctly predicted.
   * @param {string} category Class/category considered as positive
   * @returns {number} True Negatives
   * @protected
   */
  getTN(category) {
    const FN_TP = sum(...Object.values(this.matrix[category]))
    return this.getTotal() - (this.getFP(category) + FN_TP)
  }

  /**
   * Diagonal of truth (top-left &rarr; bottom-right)
   * @returns {number[]} Numbers in the diagonal
   * @protected
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
   * @protected
   */
  getTrue() {
    return sum(...this.getDiagonal())
  }

  /**
   * Number of incorrect predictions.
   * @returns {number} FP + FN
   * @protected
   */
  getFalse() {
    return this.getTotal() - this.getTrue()
  }

  /**
   * Number of real (actual) "positive" elements (i.e. elements that belong to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TP + FN
   * @protected
   */
  getPositive(category) {
    return this.getTP(category) + this.getFN(category)
  }

  /**
   * Number of real (actual) "negative" elements (i.e. elements that don't belong to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TN + FP
   * @protected
   */
  getNegative(category) {
    return this.getTN(category) + this.getFP(category)
  }

  /**
   * Number of predicted "positive" elements (i.e. elements guessed as belonging to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TP + FN
   * @protected
   */
  getPredPositive(category) {
    return this.getTP(category) + this.getFP(category)
  }

  /**
   * Number of predicted "negative" elements (i.e. elements guessed as not belonging to the `category` class).
   * @param {string} category Class/category considered as positive
   * @returns {number} TN + FP
   * @protected
   */
  getPredNegative(category) {
    return this.getTN(category) + this.getFN(category)
  }

  /**
   * Support value (count/occurrences) of `category` in the matrix
   * @param {string} category Class/category to look at
   * @returns {number} Support value
   */
  getSupport(category) {
    const counts = Object.values(this.matrix[category])
    return sum(...counts)
  }

  /**
   * Prediction accuracy for `category`.
   * @param {string} category Class/category considered as positive
   * @returns {number} (TP + TN) / (TP + TN + FP + FN)
   * @protected
   */
  getAccuracy(category) {
    return (this.getTP(category) + this.getTN(category)) / this.getTotal()
  }

  /**
   * Micro-average of accuracy.
   * @returns {number} (TP0 + ... + TPn + TN0 + ... + TNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)
   * @protected
   */
  getMicroAccuracy() {
    return this.getTrue() / this.getTotal()
  }

  /**
   * Macro-average of accuracy.
   * @returns {number} (A0 + ...+ An_1) / n
   * @protected
   */
  getMacroAccuracy() {
    return fxSum(this, 'Accuracy') / this.classes.length
  }

  /**
   * Weighted accuracy.
   * @returns {number} (A0 * s0 + ... + An * sn) / Total
   */
  getWeightedAccuracy() {
    return fxWeightedSum(this, 'Accuracy') / this.getTotal()
  }

  /**
   * Predicition recall.
   * @param {string} category Class/category considered as positive
   * @alias getSensitivity
   * @alias getTotalPositiveRate
   * @returns {number} TP / (TP + FN)
   * @protected
   */
  getRecall(category) {
    return this.getTP(category) / this.getPositive(category)
  }

  /**
   * Micro-average of recall.
   * @returns {number} (TP0 + ... + TPn) / (TP0 + ... + TPn + FN0 + ... + FNn)
   * @protected
   */
  getMicroRecall() {
    const TPs = this.getTrue()
    const FNs = fxSum(this, 'FN')
    return TPs / (TPs + FNs)
  }

  /**
   * Macro-average of recall.
   * @returns {number} (R0 + R1 + ... + Rn-1) / n
   * @protected
   */
  getMacroRecall() {
    return fxSum(this, 'Recall') / this.classes.length
  }

  /**
   * Weighted recalll.
   * @returns {number} (R0 * s0 + ... + Rn * sn) / Total
   */
  getWeightedRecall() {
    return fxWeightedSum(this, 'Recall') / this.getTotal()
  }

  /**
   * Prediction precision for `category`.
   * @alias getPositivePredictiveValue
   * @param {string} category Class/category considered as positive
   * @returns {number} TP / (TP + FP)
   * @protected
   */
  getPrecision(category) {
    return this.getTP(category) / this.getPredPositive(category)
  }

  /**
   * Micro-average of the precision.
   * @returns {number} (TP0 + ... + TPn) / (TP0 + ... + TPn + FP0 + ... FPn)
   * @protected
   */
  getMicroPrecision() {
    const TPs = this.getTrue()
    const FPs = fxSum(this, 'FP')
    return TPs / (TPs + FPs)
  }

  /**
   * Macro-average of the precsion.
   * @returns {number} (Pr0 + Pr1 + ... + Pr_n-1) / n
   * @protected
   */
  getMacroPrecision() {
    return fxSum(this, 'Precision') / this.classes.length
  }

  /**
   * Weighted precision.
   * @returns {number} (Pr0 * s0 + ... + Prn * sn) / Total
   */
  getWeightedPrecision() {
    return fxWeightedSum(this, 'Precision') / this.getTotal()
  }

  /**
   * Prediction F1 score for `category`.
   * @alias getPositivePredictiveValue
   * @param {string} category Class/category considered as positive
   * @returns {number} 2 * (Pr * R) / (Pr + R)
   * @protected
   */
  getF1(category) {
    const Pr = this.getPrecision(category)
    const R = this.getRecall(category)
    return (2 * (Pr * R)) / (Pr + R)
  }

  /**
   * Micro-average of the F1 score.
   * @returns {number} 2 * (TP0 + ... + TPn) / (2 * (TP0 + ... + TPn) + (FN0 + ... + FNn) + (FP0 + ... + FPn))
   * @protected
   */
  getMicroF1() {
    const tp = 2 * this.getTrue()
    const FPs = fxSum(this, 'FP')
    const FNs = fxSum(this, 'FN')
    return tp / (tp + FNs + FPs)
  }

  /**
   * Macro-average of the F1 score.
   * @returns {number} (F0_1 + F1_1 + ... + F_n-1_1) / n
   * @protected
   */
  getMacroF1() {
    //@todo Perhaps convert NaNs to 0's to reflect correct calculations (e.g https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html)
    return fxSum(this, 'F1') / this.classes.length
  }

  /**
   * Weighted F1.
   * @returns {number} (F0_1 * s0 + ... + Fn_1 * sn) / Total
   */
  getWeightedF1() {
    return fxWeightedSum(this, 'F1') / this.getTotal()
  }

  /**
   * Miss rates on predictions for `category`.
   * @alias getFalseNegativeRate
   * @param {string} category Class/category considered as positive
   * @returns {number} FN / (TP + FN)
   * @protected
   */
  getMissRate(category) {
    return this.getFN(category) / this.getPositive(category)
  }

  /**
   * Micro-average of the miss rate.
   * @returns {number} (FN0 + ... + FNn) / (TP0 + ... + TPn + FN0 + ... FNn)
   * @protected
   */
  getMicroMissRate() {
    const TPs = this.getTrue()
    const FNs = fxSum(this, 'FN')
    return FNs / (TPs + FNs)
  }

  /**
   * Macro-average of the miss rate.
   * @returns {number} (M0 + M1 + ... + Mn) / n
   * @protected
   */
  getMacroMissRate() {
    return fxSum(this, 'MissRate') / this.classes.length
  }

  /**
   * Weighted miss rate.
   * @returns {number} (M0 * s0 + ... + Mn * sn) / Total
   */
  getWeightedMissRate() {
    return fxWeightedSum(this, 'MissRate') / this.getTotal()
  }

  /**
   * Fall out (false alarm) on predictions for `category`.
   * @alias getFalsePositiveRate
   * @param {string} category Class/category considered as positive
   * @returns {number} FP / (FP + TN)
   * @protected
   */
  getFallOut(category) {
    return this.getFP(category) / this.getNegative(category)
  }

  /**
   * Micro-average of the fall out.
   * @returns {number} (FP0 + ... + FPn) / (FP0 + ... + FPn + TN0 + ... TNn)
   * @protected
   */
  getMicroFallOut() {
    const FPs = fxSum(this, 'FP')
    const TNs = fxSum(this, 'TN')
    return FPs / (FPs + TNs)
  }

  /**
   * Macro-average of the fall out.
   * @returns {number} (Fo0 + Fo1 + ... + Fo_n) / n
   * @protected
   */
  getMacroFallOut() {
    return fxSum(this, 'FallOut') / this.classes.length
  }

  /**
   * Weighted fall out.
   * @returns {number} (Fo0 * s0 + ... + Fon * sn) / Total
   */
  getWeightedFallOut() {
    return fxWeightedSum(this, 'FallOut') / this.getTotal()
  }

  /**
   * Specificity on predictions for `category`.
   * @alias getSelectivity
   * @alias getTrueNegativeRate
   * @param {string} category Class/category considered as positive
   * @returns {number} TN / (FP + TN)
   * @protected
   */
  getSpecificity(category) {
    return this.getTN(category) / this.getNegative(category)
  }

  /**
   * Micro-average of the specificity.
   * @returns {number} (TN0 + ... + TNn) / (FP0 + ... + FPn + TN0 + ... TNn)
   * @protected
   */
  getMicroSpecificity() {
    const FPs = fxSum(this, 'FP')
    const TNs = fxSum(this, 'TN')
    return TNs / (FPs + TNs)
  }

  /**
   * Macro-average of the specificity.
   * @returns {number} (S0 + S1 + ... + Sn) / n
   * @protected
   */
  getMacroSpecificity() {
    return fxSum(this, 'Specificity') / this.classes.length
  }

  /**
   * Weighted specificity.
   * @returns {number} (S0 * s0 + ... + Sn * sn) / Total
   */
  getWeightedSpecificity() {
    return fxWeightedSum(this, 'Specificity') / this.getTotal()
  }

  /**
   * Prevalence on predictions for `category`.
   * @param {string} category Class/category considered as positive
   * @returns {number} (TP + FN) / (TP + TN + FP + FN)
   * @protected
   */
  getPrevalence(category) {
    return this.getPositive(category) / this.getTotal()
  }

  /**
   * Micro-average of the prevalence.
   * @returns {number} (TP0 + ... + TPn + FN0 + ... + FNn) / (TP0 + ... + TPn + TN0 + ... + TNn + FP0 + ... + FPn + FN0 + ... + FNn)
   * @protected
   */
  getMicroPrevalence() {
    const P = fxSum(this, 'Positive')
    const N = fxSum(this, 'Negative')
    return P / (P + N)
  }

  /**
   * Macro-average of the prevalence.
   * @returns {number} (Pe0 + Pe1 + ... + Pen) / n
   * @protected
   */
  getMacroPrevalence() {
    return fxSum(this, 'Prevalence') / this.classes.length
  }

  /**
   * Weighted prevalence.
   * @returns {number} (Pe0 * s0 + ... + Pen * sn) / Total
   */
  getWeightedPrevalence() {
    return fxWeightedSum(this, 'Prevalence') / this.getTotal()
  }

  //getFalseDiscoveryRate: getFP() / getPredictedPositive()
  //getFalseOmmissionRate: getFN() / getPredictedNegative()
  //getNegPredictiveVal: getTN() / getPredictedNegative()
  //getPosLikelihoodRatio: getRecall() / getFallOut()
  //getNegLikelihoodRatio: getSpecificity() / getMissRate()
  //getDiagnosticOddsRatio: getPosLikelihoodRatio() / getNegLikelihoodRatio()
  //Macro/Micro Avg versions of the above

  /**
   * Textual tabular representation of the confusion matrix.
   * @param {Object} opt Options
   * @param {boolean} [opt.split=false] Split the classes in half (&rarr; 2 matrices)
   * @param {boolean} [opt.clean=false] Remove empty column/row pairs
   * @param {boolean} [opt.colours=true] Colourize cells
   * @returns {string} String representation
   * @protected
   * @example <caption>Example output (cf. /src/__tests__/confusionMatrix.js)</caption>
   * ```
   * Actual \\ Predicted  bug   code  other
   * ------------------  ----  ----  -----
   * bug                 5.00  0.00  1.00
   * code                1.00  2.00  0.00
   * other               0.00  3.00  8.00
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
   * `console.table` version of `confusionMatrix.toString()`.
   * @param {Object} opt Options
   * @param {boolean} [opt.split=false] Split the classes in half (&rarr; 2 matrices)
   * @param {boolean} [opt.clean=false] Remove empty column/row pairs
   * @param {boolean} [opt.colours=true] Colourize cells
   * @protected
   */
  toTable({
    split = false,
    clean = false,
    colours = false,
    maxValue = 100,
  } = {}) {
    const mtx = clean ? rmEmpty(this.matrix) : this.matrix
    const classes = Object.keys(mtx)

    if (split) {
      const [head, tail] = half(classes)
      const t0 = objectify(classes) //objectify(head)
      const t1 = objectify(classes) //objectify(tail)

      for (const row of classes) {
        for (const cls of head) {
          let val = this.matrix[row][cls].toFixed(2)
          if (colours) {
            val = clrVal(val, maxValue, row === cls)
          }
          t0[row][cls] = val
        }
        for (const cls of tail) {
          let val = this.matrix[row][cls].toFixed(2)
          if (colours) {
            val = clrVal(val, maxValue, row === cls)
          }
          t1[row][cls] = val
        }
      }
      /* eslint-disable no-console */
      console.table(t0)
      console.table(t1)
    } else console.table(mtx)
    /* eslint-enable no-console */
  }

  /**
   * @returns {string} Short statistics (total, true, false, accuracy, precision, recall and f1)
   * @param {string} [type='micro'] Type of stats (`micro`/`macro`/`weighted` average)
   * @todo Add options to use `micro`/`macro`/`weighted`
   * @protected
   */
  getShortStats(type = 'micro') {
    const stats = `Total: ${this.getTotal()}\nTrue: ${this.getTrue()}\nFalse: ${this.getFalse()}\n`
    let Ac = 0
    let Pr = 0
    let R = 0
    let F1 = 0
    switch (type) {
      case 'macro':
        Ac = this.getMacroAccuracy()
        Pr = this.getMacroPrecision()
        R = this.getMacroRecall()
        F1 = this.getMacroF1()
        break
      case 'weighted':
        Ac = this.getWeightedAccuracy()
        Pr = this.getWeightedPrecision()
        R = this.getWeightedRecall()
        F1 = this.getWeightedF1()
        break
      default:
        Ac = this.getMicroAccuracy()
        Pr = this.getMicroPrecision()
        R = this.getMicroRecall()
        F1 = this.getMicroF1()
    }

    return `${stats}Accuracy: ${Ac * 100}%\nPrecision: ${Pr * 100}%\nRecall: ${
      R * 100
    }%\nF1: ${F1 * 100}%`
  }

  /**
   * @returns {{total: number, correctPredictions: number, incorrectPredictions: number, classes: string[], microAvg: Object, macroAvg: Object, results: Object}}
   * (Long) statistics
   * @protected
   */
  getStats() {
    const total = this.getTotal()
    const weightedAverage = () => {
      const res = {}
      for (const m of METRICS) res[camel(m)] = this[`getWeighted${m}`]()
      return res
    }
    return {
      total,
      correctPredictions: this.getTrue(),
      incorrectPredictions: this.getFalse(),
      classes: this.classes,
      microAvg: mAvg(this, 'Mi'),
      macroAvg: mAvg(this, 'Ma'),
      weightedAvg: weightedAverage(),
      results: getResults(this, total),
    }
  }
}

module.exports = ConfusionMatrix
