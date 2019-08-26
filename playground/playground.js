/* eslint-disable no-console */
const {writeFileSync, existsSync} = require('fs')
const Learner = require('../src')

let learner = null

if (existsSync('playground-learner.json') && !process.env.DRY) {
  //If there's already a JSON version of a learner, use it's past training samples
  const pgl = require('./playground-learner.json')
  learner = Learner.fromJSON(pgl)
} else learner = new Learner() //Or use a fresh one

// Cross-validated training on the training/validation sets
const {microAvg} = learner.crossValidate(5, 0, true)
const jsonData = learner.toJSON()
console.log('micro avg:', microAvg)
// Evaluation time
const longStats = learner.eval(process.env.VERBOSE)
const stats = learner.confusionMatrix.getShortStats()
console.log('\nShort stats=\n', stats)

/* eslint-disable babel/no-unused-expressions */
if (process.env.SAVE) {
  writeFileSync('playground-learner.json', JSON.stringify(jsonData)) &&
    console.log('Saved learner to "playground-learner.json"')
}

if (process.env.CM) {
  writeFileSync(
    'playground-confusionMatrix.json',
    JSON.stringify(learner.confusionMatrix, null, 2),
  ) && console.log('Saved learner to "playground-confusionMatrix.json"')
  writeFileSync(
    'confusionMatrix.txt',
    learner.confusionMatrix.toString({colours: false}),
  ) && console.log('Saved learner to "confusionMatrix.txt"')
  console.log('Confusion Matrix:')
  // console.log('\n\n', learner.confusionMatrix.toString({split: true, colours: false}));
  console.log(
    '\n',
    learner.confusionMatrix.toString({split: true, colours: true}),
  )
  // learner.confusionMatrix.toTable({split: true});
}

writeFileSync(
  'playground-fullStats.json',
  JSON.stringify(longStats, null, 2),
) && console.log('Saved learner to "playground-fullStats.json"')

console.log('More Stats:', learner.getStats(true, 'categoryPartitions.json'))

process.exit(0)
