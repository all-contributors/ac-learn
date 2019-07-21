/* eslint-disable no-console */
const {writeFileSync, existsSync} = require('fs')
const Learner = require('./src')

let learner = null

if (existsSync('playground-learner.json')) {
  //If there's already a JSON version of a learner, use it's past training samples
  const pgl = require('./playground-learner.json')
  learner = Learner.fromJSON(pgl)
} else learner = new Learner() //Or use a fresh one

// Cross-validated training on the training/validation sets
const {microAvg} = learner.crossValidate(5)
const jsonData = learner.toJSON()
console.log('micro avg:', microAvg)
// Evaluation time
const stats = learner.eval()
console.log('\nShort stats=\n', stats)
// console.log('json=', jsonData);

if (process.env.SAVE)
  writeFileSync('playground-learner.json', JSON.stringify(jsonData))
