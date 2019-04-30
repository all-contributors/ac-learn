const ck = require('chalk')

module.exports = function evaluate({classifier, test, train, log = true}) {
  let correctResults = 0

  test.forEach(t => {
    const result = classifier.classify(t.input)
    const noGuess = !result.length && t.output === 'null'
    if (result[0] === t.output || noGuess) {
      ++correctResults
      if (log) process.stdout.write(`${t.input}: ${ck.greenBright(result)}\n`)
    } else if (result.includes(t.output)) {
      //2+ classed guessed
      correctResults += 1 / result.length
      if (log) process.stdout.write(`${t.input}: ${ck.yellowBright(result)}\n`)
    } else if (log)
      process.stdout.write(
        `${t.input}: ${ck.redBright(result)} != ${ck.blueBright(t.output)}\n`,
      )
  })

  const testAccuracy = Math.round((correctResults / test.length) * 1e5) / 1000

  process.stdout.write(
    `Correct Results: ${correctResults}/${
      test.length
    } (${testAccuracy}%); (based on ${train.length} data learnt)\n`,
  )

  return {
    correctResults,
    testAccuracy: testAccuracy / 100,
  }
}
