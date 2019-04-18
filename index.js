const natural = require('natural')
const trainSet = require('./src/dataset.json')
const testSet = require('./src/testset.json')

const classifier = new natural.BayesClassifier()


/* eslint-disable no-console */
console.log('Learning...')
trainSet.forEach(arr => classifier.addDocument(arr[0], arr[1]))
classifier.train()
console.log('Training complete')

let correctResults = 0;

for (let i = 0; i < testSet.length; i++) {
  const result = classifier.classify(testSet[i][0]) //label
  if (result === testSet[i][1]) correctResults++ //correct category
}

console.log(`Correct Results: ${correctResults}/${testSet.length}; (based on ${trainSet.length} data learnt)`);
/* eslint-enable no-console */
