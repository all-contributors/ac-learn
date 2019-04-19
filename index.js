const natural = require('natural')
const ck = require('chalk')
const trainSet = require('./src/labels.json')
const testSet = require('./src/testset.json')

const classifier = new natural.BayesClassifier()

/* eslint-disable no-console */
console.log('Learning...')
// trainSet.forEach(arr => classifier.addDocument(arr[0], arr[1]))
trainSet.forEach(data => {
  if (data.category.length) classifier.addDocument(data.label, data.category)
})
classifier.train()
console.log('Training complete')

let correctResults = 0

const tests = testSet //.filter(d => !!d.category)
// console.log(tests.length, testSet.length)

for (let i = 0; i < tests.length; i++) {
  const result = classifier.classify(tests[i][0]) //label
  if (result === tests[i][1]) {
    correctResults++ //correct category
    console.log(`${tests[i][0]}:`, ck.greenBright(result))
  } else
    console.log(
      `${tests[i][0]}:`,
      ck.redBright(result),
      '!=',
      ck.blueBright(tests[i][1]),
    )
}

console.log(
  `Correct Results: ${correctResults}/${tests.length}; (based on ${
    trainSet.length
  } data learnt)`,
)
/* eslint-enable no-console */
