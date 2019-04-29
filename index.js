const serialize = require('serialization')
const trainTestSplit = require('train-test-split')
const {writeFile, readFile} = require('fs')
const {Spinner} = require('clui')
const labelDS = require('./src/conv')('io')
const classifierBuilder = require('./src/classifier')
const evaluate = require('./src/evaluate')

class Learner {
  constructor({
    dataset = labelDS,
    trainSplit = 0.8,
    classifier = classifierBuilder,
  }) {
    this.dataset = dataset
    const [train, test] = trainTestSplit(dataset, trainSplit)
    this.trainSplit = trainSplit
    this.trainSet = train
    this.testSet = test
    this.classifier = classifier()
    this.classifierBuilder = classifier
  }

  train() {
    const learning = new Spinner('Learning...', [
      '⣾',
      '⣽',
      '⣻',
      '⢿',
      '⡿',
      '⣟',
      '⣯',
      '⣷',
    ])
    learning.start()
    this.classifier.trainBatch(this.trainSet)
    learning.message('Learning complete')
    learning.stop()
  }

  eval() {
    return evaluate(this.classifier, this.testSet, this.trainSet)
  }

  serialize() {
    return serialize.toString(this.classifier, this.classifierBuilder)
  }

  serializeAndSave(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      const data = this.serialize()
      writeFile(file, data, err => {
        if (err) reject(err)
        resolve(file)
      })
    })
  }

  deserialize() {
    return serialize.fromString(this.classifier, __dirname)
  }

  loadAndDeserialize(file = 'classifier.json') {
    return new Promise((resolve, reject) => {
      readFile(file, 'utf8', (err, data) => {
        if (err) reject(err)
        const content = this.deserialize(data)
        resolve(content)
      })
    })
  }
}

module.exports = Learner
