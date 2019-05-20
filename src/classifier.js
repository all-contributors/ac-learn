// Creates a fresh stand-alone (untrained) classifier.
/* istanbul ignore next */
const classifierBuilder = (pastTrainingSamples = []) => {
  const {multilabel, Winnow, EnhancedClassifier} = require('limdu').classifiers

  // Word extractor - a function that takes a sample and adds features to a given features set:
  const featureExtractor = (input, features) => {
    //similar to limdu.features.NGramsOfWords(1)
    input
      .split(/[ \t,;:.-_]/) //perhaps remove _ to keep emoji words joint
      .filter(Boolean)
      .forEach(word => {
        features[word.toLowerCase()] = 1
      })
  }

  const TextClassifier = multilabel.BinaryRelevance.bind(0, {
    //eslint-disable-next-line babel/camelcase
    binaryClassifierType: Winnow.bind(0, {retrain_count: 10}),
  })

  const classifier = new EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor, //or extract
    pastTrainingSamples,
  })

  return classifier
}
/* istanbul ignore next */
module.exports = classifierBuilder
