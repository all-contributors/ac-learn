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
//source: https://gist.github.com/antoniocsoares/fa794527a0a61f5decd515f502224af7#gistcomment-2360675
const duplicates = arr => {
  const seen = new Set()
  const store = []
  arr.filter(
    item =>
      seen.size === seen.add(item).size &&
      !store.includes(item) &&
      store.push(item),
  )
  return store.filter(el => el !== undefined)
}

const dups = duplicates(labels) //full
const dupLabels = duplicates(labels.map(l => l.labels)) //only the labels (not categories)

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
  100}%)}
# of duplicates to remove: {red ${dups.length}} ({yellow ${(dups.length / len) *
  100}%})
# of label duplicates to remove: {red ${
  dupLabels.length
}} ({yellow ${(dupLabels.length / len) * 100}%})`)

/* eslint-enable no-console */
