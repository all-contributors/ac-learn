// Creates a fresh stand-alone (untrained) classifier.
const classifierBuilder = (pastTrainingSamples = []) => {
  const limdu = require('limdu')
  const {wordExtractor} = require('./extract')

  const TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
    binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10}),
  })

  const classifier = new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor: wordExtractor, //or extract
    pastTrainingSamples
  })

  return classifier
}

module.exports = classifierBuilder