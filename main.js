const {writeFile} = require('fs')
const serialize = require('serialization')
const trainTestSplit = require('train-test-split')
const ck = require('chalk')
const dataset = require('./src/conv')('io')
const classifierBuilder = require('./src/classifier')
const evaluate = require('./src/evaluate')

// 80% of the data is for training, the rest for testing
const [train, test] = trainTestSplit(dataset, 0.8)
const classifier = classifierBuilder()

// Train and test:
/* eslint-disable no-console */
console.log(ck.cyan('Learning...'))
classifier.trainBatch(train)
console.log(ck.cyan('Training complete'))

evaluate(classifier, test, train)
const classifierStr = serialize.toString(classifier, classifierBuilder)
// console.log('classifier str=', classifierStr)

writeFile('classifier.json', classifierStr, err => {
  if (err) throw err
  console.log(`\n${ck.magenta('classifier.json')} ready`)
})
/* eslint-enable no-console */
