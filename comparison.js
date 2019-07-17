const chalk = require('chalk')
const ngow = require('limdu').features.NGramsOfWords
const Lem = require('javascript-lemmatizer')
const Learner = require('./')
const dataset = require('./src/conv')('io')
const classifierFactory = require('./src/classifierFactory')

const lemmatizer = new Lem()

//learningRate?

const trainers = [
  {
    learner: new Learner({
      dataset: [...dataset],
    }),
    info: 'Default (trainSplit=.8)',
  },
  {
    learner: new Learner({
      dataset: [...dataset],
      trainSplit: 0.7,
    }),
    info: 'trainSplit=.7',
  },
  {
    learner: new Learner({
      dataset: [...dataset],
      trainSplit: 0.85,
    }),
    info: 'trainSplit=.85',
  },
]
const classifiers = [
  {
    learner: new Learner({
      dataset: [...dataset],
    }),
    info: 'Default',
  },
  {
    learner: new Learner({
      dataset: [...dataset],
      // trainSplit: .7,
      classifier: classifierFactory(ngow(1)),
    }),
    info: '1-gram',
  },
  {
    learner: new Learner({
      dataset: [...dataset],
      // trainSplit: .7,
      classifier: classifierFactory(ngow(2)),
    }),
    info: '2-grams',
  },
  {
    learner: new Learner({
      dataset: [...dataset],
      // trainSplit: .7,
      classifier: classifierFactory((input, features) => {
        input
          .split(/[ \t,;:.-]/) //like the default featureExtractor but w/o _
          .filter(Boolean)
          .forEach(word => {
            features[word.toLowerCase()] = 1
          })
      }),
    }),
    info: 'Keep "_"',
  },
  {
    learner: new Learner({
      //require('./extract').extract
      dataset: [...dataset],
      // trainSplit: .7,
      classifier: classifierFactory((input, features) => {
        input
          .split(/[ \t,;:.-_]/)
          .filter(Boolean)
          .map(token => lemmatizer.only_lemmas(token)[0])
          .forEach(word => {
            features[word] = 1
          })
      }),
    }),
    info: 'extract()',
  },
  {
    learner: new Learner({
      //require('./extract').extract w/o _ in `split`
      dataset: [...dataset],
      // trainSplit: .7,
      classifier: classifierFactory((input, features) => {
        input
          .split(/[ \t,;:.-]/)
          .filter(Boolean)
          .map(token => lemmatizer.only_lemmas(token)[0])
          .forEach(word => {
            features[word] = 1
          })
      }),
    }),
    info: 'extract() that keeps "_"',
  },
]

const round = x => Math.round(x * 1000) / 1000
const prc = x => round(x * 100)
const p = x => chalk.bold.yellow(prc(x))

/* eslint-disable no-console */

console.log(chalk.cyan('Training trainers...'))
trainers.forEach(trainer => trainer.learner.train())

const trainerEvs = []
console.log(chalk.cyan('Evaluating trainers...'))
trainers.forEach((trainer, i) => {
  const ev = trainer.learner.eval()
  trainerEvs.push(ev)
  console.log(
    `trainer#${i} (${chalk.green(trainer.info)})\n\t${chalk.green(
      ev.correctPredictions,
    )}/${chalk.green(ev.total)} = ${chalk.greenBright(
      prc(ev.correctPredictions / ev.total),
    )}% on ${ev.classes.length} classes`,
  )
  console.log(
    'm F1/A/P/R (in %)=',
    p(ev.microAvg.f1),
    p(ev.microAvg.accuracy),
    p(ev.microAvg.precision),
    p(ev.microAvg.recall),
  )
  console.log(
    'M F1/A/P/R (in %)=',
    p(ev.macroAvg.f1),
    p(ev.macroAvg.accuracy),
    p(ev.macroAvg.precision),
    p(ev.macroAvg.recall),
    '\n',
  )
})
// console.log('trainerEvs=', trainerEvs);

console.log(chalk.cyan('Training classifiers...'))
classifiers.forEach(cfr => cfr.learner.train())

const cfrEvs = []
console.log(chalk.cyan('Evaluating classifiers...'))
classifiers.forEach((cfr, i) => {
  const ev = cfr.learner.eval()
  cfrEvs.push(ev)
  console.log(
    `classifier#${i} (${chalk.green(cfr.info)}) ${chalk.green(
      ev.correctPredictions,
    )}/${chalk.green(ev.total)} = ${chalk.greenBright(
      prc(ev.correctPredictions / ev.total),
    )}% on ${ev.classes.length} classes`,
  )
  console.log(
    'm F1/A/P/R (in %)=',
    p(ev.microAvg.f1),
    p(ev.microAvg.accuracy),
    p(ev.microAvg.precision),
    p(ev.microAvg.recall),
  )
  console.log(
    'M F1/A/P/R (in %)=',
    p(ev.macroAvg.f1),
    p(ev.macroAvg.accuracy),
    p(ev.macroAvg.precision),
    p(ev.macroAvg.recall),
    '\n',
  )
})

/* eslint-enable no-console */
