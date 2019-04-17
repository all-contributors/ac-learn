const RFClassifier = require('ml-random-foreset').RandomForestClassifier
const LabelDataset = require('./src/dataset')

const trainingSet = LabelDataset.getLabels()
const predictions = LabelDataset.getCategories().map(elem =>
  LabelDataset.getDistinctCategories().indexOf(elem),
)

const options = {
  seed: 3,
  maxFeatures: 0.8,
  replacement: true,
  nEstimators: 25,
}

const classifier = new RFClassifier(options)
classifier.train(trainingSet, predictions)
const result = classifier.predict(trainingSet)
/* eslint-disable no-console */
console.log('result=')
console.dir(result)
/* /* eslint-enable no-console */
