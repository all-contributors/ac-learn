const {writeFile} = require('fs')
const serialize = require('serialization')
const trainTestSplit = require('train-test-split')
const ck = require('chalk')
const lutils = require('limdu').utils
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

evaluate({classifier, test, train, log: false})
const classifierStr = serialize.toString(classifier, classifierBuilder)
// console.log('classifier str=', classifierStr)

writeFile('classifier.json', classifierStr, err => {
  if (err) throw err
  console.log(`\n${ck.magenta('classifier.json')} ready`)
})

const microAvg = new lutils.PrecisionRecall()
const macroAvg = new lutils.PrecisionRecall() //requires the use of folds (cf, lutils.partitions)

lutils.test(classifier, test, /* verbosity = */ 0, microAvg, macroAvg)
microAvg.calculateStats()
console.log('microAvg=')
console.dir(microAvg.fullStats()) //or shortStats()?
/* eslint-enable no-console */
