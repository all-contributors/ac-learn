const chalk = require('chalk')
const ngow = require('limdu').features.NGramsOfWords
const Lem = require('javascript-lemmatizer')
const {writeFileSync, existsSync} = require('fs')
const Learner = require('./')
const dataset = require('./src/conv')('io')
const classifierFactory = require('./src/classifierFactory')
const svmFactory = require('./src/svmFactory')
const extract = require('./src/extract').extract

const lemmatizer = new Lem()

const keepLodash = (input, features) => {
  input
    .split(/[ \t,;:.-]/) //like the default featureExtractor but w/o _
    .filter(Boolean)
    .forEach(word => {
      features[word.toLowerCase()] = 1
    })
}

const extractKeep = (input, features) => {
  input
    .split(/[ \t,;:.-]/)
    .filter(Boolean)
    .map(token => lemmatizer.only_lemmas(token)[0])
    .forEach(word => {
      features[word] = 1
    })
}

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

const setupClassifiers = () => {
  const list = [
    'Default',
    '1-gram',
    '2-grams',
    'Keep "_"',
    'extract()',
    'extract() that keeps "_"',
    'SVM',
    'SVM ... 1-gram',
    'SVM ... 2-grams',
    'SVM ... keep "_"',
    'SVM ... extract()',
    'SVM ... extract() & keep "_"',
  ]

  if (process.env.DRY) {
    return [
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
          classifier: classifierFactory(keepLodash),
        }),
        info: 'Keep "_"',
      },
      {
        learner: new Learner({
          //require('./extract').extract
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: classifierFactory(extract),
        }),
        info: 'extract()',
      },
      {
        learner: new Learner({
          //require('./extract').extract w/o _ in `split`
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: classifierFactory(extractKeep),
        }),
        info: 'extract() that keeps "_"',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(),
        }),
        info: 'SVM',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(ngow(1)),
        }),
        info: 'SVM ... 1-gram',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(ngow(2)),
        }),
        info: 'SVM ... 2-grams',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(keepLodash),
        }),
        info: 'SVM ... keep "_"',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(extract),
        }),
        info: 'SVM ... extract()',
      },
      {
        learner: new Learner({
          dataset: [...dataset],
          // trainSplit: .7,
          classifier: svmFactory(extractKeep),
        }),
        info: 'SVM ... extract() & keep "_"',
      },
      //limdu.classifiers.(Baysian|NeuralNetwork|kNN|DecisionTree|...)?
    ]
  }

  const cfrs = []
  list.forEach(info => {
    if (!existsSync(`./comparisons/classifiers/${info}.json`))
      throw new Error(`Missing "${info}.json" classifier`)
    const learner = Learner.fromJSON(
      require(`./comparisons/classifiers/${info}.json`),
    )
    cfrs.push({
      learner,
      info,
    })
  })
  return cfrs
}

const classifiers = setupClassifiers()

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
classifiers.forEach(cfr => {
  console.log('Training', cfr.info)
  cfr.learner.train()
})

const cfrEvs = []
console.log(chalk.cyan('Evaluating classifiers...'))
classifiers.forEach((cfr, i) => {
  const ev = cfr.learner.eval()
  cfrEvs.push(ev)

  const classifier = JSON.stringify(cfr.learner.toJSON(), null, 2)
  if (process.env.SAVE) {
    writeFileSync(`./comparisons/classifiers/${cfr.info}.json`, classifier)
    writeFileSync(`./comparisons/results/${cfr.info}.json`, JSON.stringify(ev))
  }

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
