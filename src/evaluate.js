// const ck = require('chalk')
const {PrecisionRecall} = require('limdu').utils
const ConfusionMatrix = require('./confusionMatrix')

const evalu = ({classifier, test, classes /* , log = true */}) => {
  const curStats = new PrecisionRecall()
  const stats = {
    total: 0,
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
    confusionMatrix2D: [],
    // confusionMatrix: new ConfusionMatrix(classes),
  }
  const actual = [] //t.map(t => t.output)
  const predicted = []
  test.forEach(t => {
    const predictedClasses = classifier.classify(t.input)

    /* const expl =  */ curStats.addCases([t.output], predictedClasses)
    // console.log(`explanations (on ${t.input}->${t.output})= ${expl.join('\t')}`)
    let tn = true
    // console.log(`expected "${ck.green.bold(t.output)}" on "${ck.cyan(t.input)}" and got: "${ck.yellow(predictedClasses.join('/'))}"`)
    predictedClasses.forEach(pc => {
      stats[pc === t.output ? 'TP' : 'FP']++
      tn = false
    })
    if (!predictedClasses.includes(t.output)) {
      tn = false
      stats.FN++
    }
    if (tn) stats.TN++
    stats.total += Math.max(predictedClasses.length, 1)
    if (predictedClasses.length) {
      /* predictedClasses.forEach(pc => {
        actual.push(t.output)
        predicted.push(pc)
      }) */
      actual.push(t.output)
      predicted.push(predictedClasses[0])
    } else {
      actual.push(t.output)
      predicted.push('')
    }
  })
  curStats.calculateStats()
  stats.confusionMatrix2D = [[stats.TP, stats.FP], [stats.FN, stats.TN]]
  stats.confusionMatrix = ConfusionMatrix.fromData(actual, predicted, classes)
  return {curStats, stats}
}

module.exports = evalu
