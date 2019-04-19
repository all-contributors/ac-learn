const ck = require('chalk')
const labels = require('./labels.json')
const cats = require('./categories.json')

const len = labels.length
const categorisedData = labels.filter(l => !!l.category)
const nullCategorisedData = labels.filter(l => l.category == 'null')
const validCategorisedData = labels.filter(l => cats.includes(l.category))
const badData = labels.filter(
  l => !!l.category && l.category != 'null' && !cats.includes(l.category),
)

/* eslint-disable no-console */
console.log(ck`# of labels: {cyan ${len}} 
# of categorised labels: {cyan ${
  categorisedData.length
}} {greenBright (${(categorisedData.length / len) * 100}%)}
# of labels categorised "null": {cyan ${
  nullCategorisedData.length
}} {greenBright (${(nullCategorisedData.length / len) * 100}%)}
# of labels with a valid category: {cyan ${
  validCategorisedData.length
}} {greenBright (${(validCategorisedData.length / len) * 100}%)}
# of labels to fix: {red ${badData.length}} {yellow (${(badData.length / len) *
  100}%)}`)
/* eslint-enable no-console */
