/* eslint-disable no-console */
const {writeFileSync, existsSync} = require('fs')
<<<<<<< HEAD
const {succ, use} = require('nclr')
const Learner = require('../src')
=======
const {join} = require('path')
const Learner = require(join(__dirname, '../src'))
>>>>>>> 7d118eb (feat: automated update)

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
console.log(use('info', 'micro avg:'), microAvg)
// Evaluation time
const longStats = learner.eval(process.env.VERBOSE)
const stats = learner.confusionMatrix.getShortStats()
console.log(`\n${use('out', 'Short stats=')}\n`, stats)

/* eslint-disable babel/no-unused-expressions */
if (process.env.SAVE) {
<<<<<<< HEAD
  writeFileSync('playground-learner.json', JSON.stringify(jsonData)) &&
    succ('Saved learner to "playground-learner.json"')
=======
  writeFileSync(jsonPath, JSON.stringify(jsonData)) &&
    console.log(`Saved learner to "${jsonPath}"`)
>>>>>>> 7d118eb (feat: automated update)
}

if (process.env.CM) {
  const cmPath = join(__dirname, './playground-confusionMatrix.json')
  const cmTablePath = join(__dirname, './confusionMatrix.txt')
  writeFileSync(cmPath, JSON.stringify(learner.confusionMatrix, null, 2)) &&
    console.log(`Saved learner to "${cmPath}"`)
  writeFileSync(
<<<<<<< HEAD
    'playground-confusionMatrix.json',
    JSON.stringify(learner.confusionMatrix, null, 2),
  ) && succ('Saved learner to "playground-confusionMatrix.json"')
  writeFileSync(
    'confusionMatrix.txt',
    learner.confusionMatrix.toString({colours: false}),
  ) && succ('Saved learner to "confusionMatrix.txt"')
=======
    cmTablePath,
    learner.confusionMatrix.toString({colours: false}),
  ) && console.log(`Saved learner to "${cmTablePath}"`)
>>>>>>> 7d118eb (feat: automated update)
  console.log('Confusion Matrix:')
  // console.log('\n\n', learner.confusionMatrix.toString({split: true, colours: false}));
  console.log(
    '\n',
    learner.confusionMatrix.toString({split: true, colours: true}),
  )
  // learner.confusionMatrix.toTable({split: true});
}

<<<<<<< HEAD
writeFileSync(
  'playground-fullStats.json',
  JSON.stringify(longStats, null, 2),
) && succ('Saved learner to "playground-fullStats.json"')

console.log(use('info', 'More Stats:'), learner.getStats(true, 'categoryPartitions.json'))
=======
const fullStatsPath = join(__dirname, './playground-fullStats.json')
writeFileSync(fullStatsPath, JSON.stringify(longStats, null, 2)) &&
  console.log(`Saved learner to "${fullStatsPath}"`)

console.log(
  'More Stats:',
  learner.getStats(true, join(__dirname, './categoryPartitions.json')),
)
>>>>>>> 7d118eb (feat: automated update)

process.exit(0)
