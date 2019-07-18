// Creates a fresh stand-alone (untrained) classifier.
/* istanbul ignore next */
const svmFactory = customFeatureExtractor => (pastTrainingSamples = []) => {
  const {classifiers, features} = require('limdu')

  // Word extractor - a function that takes a sample and adds features to a given features set:
  const wordExtractor = (input, attributes) => {
    //similar to limdu.features.NGramsOfWords(1)
    input
      .split(/[ \t,;:.-_]/) //perhaps remove _ to keep emoji words joint
      .filter(Boolean)
      .forEach(word => {
        attributes[word.toLowerCase()] = 1
      })
  }
  const featureExtractor = customFeatureExtractor || wordExtractor

  const TextClassifier = classifiers.multilabel.BinaryRelevance.bind(0, {
    //eslint-disable-next-line babel/camelcase
    binaryClassifierType: classifiers.SvmJs.bind(0, {C: 1.0}),
  })

  const classifier = new classifiers.EnhancedClassifier({
    classifierType: TextClassifier,
    featureExtractor,
    featureLookupTable: new features.FeatureLookupTable(),
    pastTrainingSamples,
  })

  return classifier
}
/* istanbul ignore next */
module.exports = svmFactory
