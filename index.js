const bayes = require('classificator')
const ds = require('./src/dataset.json')

const classifier = bayes()

/* eslint-disable no-console */
console.log('Learning....')
ds.forEach(el => classifier.learn(...el))

console.log('Test!!')
const testSet = ['bug', 'enhancement', 'documentation', 'release']

testSet.forEach(word => {
  console.log(`${word}?`)
  console.dir(classifier.categorize(word))
})
/* eslint-enable no-console */
