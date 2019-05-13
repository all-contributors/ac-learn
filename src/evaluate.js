// const ck = require('chalk')
const {PrecisionRecall} = require('limdu').utils
const ConfusionMatrix = require('./confusionMatrix')

// function evaluate({classifier, test, train, log = true}) {
//   let correctResults = 0

//   test.forEach(t => {
//     const result = classifier.classify(t.input)
//     const noGuess = !result.length && t.output === 'null'
//     if (result[0] === t.output || noGuess) {
//       ++correctResults
//       if (log) process.stdout.write(`${t.input}: ${ck.greenBright(result)}\n`)
//     } else if (result.includes(t.output)) {
//       //2+ classed guessed
//       correctResults += 1 / result.length
//       if (log) process.stdout.write(`${t.input}: ${ck.yellowBright(result)}\n`)
//     } else if (log)
//       process.stdout.write(
//         `${t.input}: ${ck.redBright(result)} != ${ck.blueBright(t.output)}\n`,
//       )
//   })

//   const testAccuracy = Math.round((correctResults / test.length) * 1e5) / 1000

//   process.stdout.write(
//     `Correct Results: ${correctResults}/${
//       test.length
//     } (${testAccuracy}%); (based on ${train.length} data learnt)\n`,
//   )

//   return {
//     correctResults,
//     testAccuracy: testAccuracy / 100,
//   }
// }

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
    // const expectedClasses = [t.output]
    const predictedClasses = classifier.classify(t.input)

    /* const expl =  */ curStats.addCases([t.output], predictedClasses)
    // console.log(`explanations (on ${t.input}->${t.output})= ${expl.join('\t')}`)
    let tn = true
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
      predictedClasses.forEach(pc => {
        actual.push(t.output)
        predicted.push(pc)
      })
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
