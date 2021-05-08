/* eslint-disable no-console */
const {writeFileSync, existsSync} = require('fs')
const {join} = require('path')
const Learner = require(join(__dirname, '../src'))

let learner = null
const jsonPath = join(__dirname, './playground-learner.json')

if (existsSync(jsonPath) && !process.env.DRY) {
  //If there's already a JSON version of a learner, use it's past training samples
  const pgl = require(jsonPath)
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
  writeFileSync(jsonPath, JSON.stringify(jsonData)) &&
    console.log(`Saved learner to "${jsonPath}"`)
}

if (process.env.CM) {
  const cmPath = join(__dirname, './playground-confusionMatrix.json')
  const cmTablePath = join(__dirname, './confusionMatrix.txt')
  writeFileSync(cmPath, JSON.stringify(learner.confusionMatrix, null, 2)) &&
    console.log(`Saved learner to "${cmPath}"`)
  writeFileSync(
    cmTablePath,
    learner.confusionMatrix.toString({colours: false}),
  ) && console.log(`Saved learner to "${cmTablePath}"`)
  console.log('Confusion Matrix:')
  // console.log('\n\n', learner.confusionMatrix.toString({split: true, colours: false}));
  console.log(
    '\n',
    learner.confusionMatrix.toString({split: true, colours: true}),
  )
  // learner.confusionMatrix.toTable({split: true});
}

const fullStatsPath = join(__dirname, './playground-fullStats.json')
writeFileSync(fullStatsPath, JSON.stringify(longStats, null, 2)) &&
  console.log(`Saved learner to "${fullStatsPath}"`)

console.log(
  'More Stats:',
  learner.getStats(true, join(__dirname, './categoryPartitions.json')),
)

process.exit(0)
