const ck = require('chalk')

module.exports = function evaluate (classifier, test, train) {
  let correctResults = 0

  test.forEach(t => {
    const result = classifier.classify(t.input)
    const noGuess = !result.length && t.output === 'null'
    if (result[0] === t.output || noGuess) {
      ++correctResults
      console.log(`${t.input}:`, ck.greenBright(result))
    } else if (result.includes(t.output)) {
      //2+ classed guessed
      correctResults += 1 / result.length
      console.log(`${t.input}:`, ck.yellowBright(result))
    } else {
      console.log(
        `${t.input}:`,
        ck.redBright(result),
        '!=',
        ck.blueBright(t.output),
      )
    }
  })

  const testAccuracy = Math.round((correctResults / test.length) * 1e5) / 1000

  //@todo add precision/recall/f1-score

  console.log(
    `Correct Results: ${correctResults}/${
      test.length
    } (${testAccuracy}%); (based on ${train.length} data learnt)`,
  )

  return {
    correctResults,
    testAccuracy
  }
}