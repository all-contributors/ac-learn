const Table = require('easy-table')
const {objectify, sum, column, matrixSum} = require('./utils')

const fxSum = (cm, fx) => sum(...cm.classes.map(c => cm[`get${fx}`](c)))

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
    this.classes = classes
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

  //@todo fromData(actual: Array, predictions: Array, classes=: string[])

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
   * @returns {number} TP + TN
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
    const TPs = this.getTrue()
    const TNs = fxSum(this, 'TN')
    const FNs = fxSum(this, 'FN')
    const FPs = fxSum(this, 'FP')
    return (TPs + TNs) / (TPs + TNs + FPs + FNs)
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
    const TPs = fxSum(this, 'TP')
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
   * Prediction precision for `category`
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
    const TPs = fxSum(this, 'TP')
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
   * Prediction F1 score for `category`
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
   * @returns {number} 2 * ((Pr0 + ... + Pr_n) * (R0 + ... + Rn)) / ((Pr0 + ... + Pr_n) + (R0 + ... + Rn))
   */
  getMicroF1() {
    const Prs = fxSum(this, 'Precision')
    const Rs = fxSum(this, 'Recall')
    return (2 * (Prs * Rs)) / (Prs + Rs)
  }

  /**
   * Macro-average of the precsion.
   * @returns {number} (F0_1 + F1_1 + ... + F_n-1_1) / n
   */
  getMacroF1() {
    return fxSum(this, 'F1') / this.classes.length
  }

  //getMissRate, getFNRate: getFN() / getRealPositive() <=> getFN() / (getTP() + getFN())
  //getFallOut, getFPRate: getFP() / getRealNegative() <=> getFP() / (getFP() + getTN())
  //getSpecificity, getTNRate: getTN() / getRealNegative() <=> getTN() / (getFP() + getTN())
  //getPrevalence: getRealPositive() / getTotalPopulation()
  //getFalseDiscoveryRate: getFP() / getPredictedPositive()
  //getFalseOmmissionRate: getFN() / getPredictedNegative()
  //getNegPredictiveVal: getTN() / getPredictedNegative()
  //getPosLikelihoodRatio: getRecall() / getFallOut()
  //getNegLikelihoodRatio: getSpecificity() / getMissRate()
  //getDiagnosticOddsRatio: getPosLikelihoodRatio() / getNegLikelihoodRatio()

  //Macro/Micro Avg versions of the above

  toString() {
    const t = new Table()
    for (const row in this.matrix) {
      if (this.matrix.hasOwnProperty(row)) {
        t.cell('Actual \\ Predicted', `   ${row}`)
        this.classes.forEach(cls =>
          t.cell(cls, this.matrix[row][cls], Table.number(2)),
        )
        t.newRow()
      }
    }
    return t.toString()
  }
}

module.exports = ConfusionMatrix
