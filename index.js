const limdu = require('limdu')
const trainTestSplit = require('train-test-split')
const ck = require('chalk')
const dataset = require('./src/conv')('io')
const {wordExtractor} = require('./src/extract')

// 80% of the data is for training, the rest for testing
const [train, test] = trainTestSplit(dataset, 0.8)

// First, define our base classifier type (a multi-label classifier based on winnow):
const TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
  binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10}),
})

// Initialize a classifier with the base classifier type and the feature extractor:
const intentClassifier = new limdu.classifiers.EnhancedClassifier({
  classifierType: TextClassifier,
  // normalizer: limdu.features.RegexpNormalizer([
  //   {source: /[:-_]/g, target: ''}
  // ]), //or [limdu.features.LowerCaseNormalizer, limdu.features.RegexpNormalize(...)]
  featureExtractor: wordExtractor, //or extract
})

// Train and test:
/* eslint-disable no-console */
console.log(ck.cyan('Learning...'))
intentClassifier.trainBatch(train)
console.log(ck.cyan('Training complete'))

let correctResults = 0
test.forEach(t => {
  const result = intentClassifier.classify(t.input)
  // console.log(result, typeof result)
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

console.log(
  `Correct Results: ${correctResults}/${
    test.length
  } (${testAccuracy}%); (based on ${train.length} data learnt)`,
)
/* eslint-enable no-console */
