// const ck = require('chalk')
const {PrecisionRecall} = require('limdu').utils

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

const evalu = ({classifier, test /* , log = true */}) => {
  const curStats = new PrecisionRecall()
  const stats = {
    total: 0,
    TP: 0,
    TN: 0,
    FP: 0,
    FN: 0,
    confusionMatrix: [],
  }
  test.forEach(t => {
    // const expectedClasses = [t.output]
    const actualClasses = classifier.classify(t.input)
    // const expl = curStats.addCases([t.output], actualClasses, log)
    // console.log(`explanations (on ${t.input}->${t.output})= ${expl.join('\t')}`)
    let tn = true
    actualClasses.forEach(ac => {
      stats[ac === t.output ? 'TP' : 'FP']++
      tn = false
    })
    if (!actualClasses.includes(t.output)) {
      tn = false
      stats.FN++
    }
    if (tn) stats.TN++
  })
  curStats.calculateStats()
  stats.confusionMatrix = [[stats.TP, stats.FP], [stats.FN, stats.TN]]
  return {curStats, stats}
}

module.exports = evalu
