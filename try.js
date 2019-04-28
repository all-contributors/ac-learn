// const limdu = require('limdu')
// const trainTestSplit = require('train-test-split')
// const ck = require('chalk')
// const stem = require('natural').PorterStemmer.stem
const {isStopword} = require('is-stopword')
const {lemmaExtractor, wordExtractor} = require('./src/extract')
const dataset = require('./src/conv')('io')

// const [train, test] = trainTestSplit(dataset, 0.8)

const extractor = (input, features) => {
  const extract = input
    .replace(/[:-]/g, ' ') //normalisation
    .replace(/\s{2,}/, ' ')
    .split(' ') //tokenification
    //stop words? stemming?
    .filter(word => word.length && (!isStopword(word) || word === 'back'))
    .map(word => word.toLowerCase())
  extract.forEach(word => {
    features[word] = 1
  })
  return extract
}

const feat = {}

const data = dataset.map(d => {
  const extract = wordExtractor(d.input, feat)
  return [d.input, extract, extractor(d.input), lemmaExtractor(d.input, feat)]
})

/* eslint-disable no-console */
console.table([['input', 'e. input', 'extract', 'extract0'], ...data])

console.log(feat)
/* eslint-enable no-console */
