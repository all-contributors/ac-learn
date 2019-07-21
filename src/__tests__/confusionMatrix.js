const CM = require('../confusionMatrix')
const {toPrecision} = require('../utils')

const CATEGORIES = ['bug', 'code', 'other']
const MTX = {
  bug: {bug: 1, code: 0, other: 0},
  code: {bug: 1, code: 2, other: 0},
  other: {bug: 0, code: 0, other: 3},
}

test('has attributes', () => {
  const cm = new CM(CATEGORIES)
  expect(cm.classes).toEqual(CATEGORIES)
  expect(cm.matrix).not.toMatchObject(MTX)
  const ROW = {bug: 0, code: 0, other: 0}
  expect(cm.matrix.bug).toEqual(ROW)
  expect(cm.matrix.code).toEqual(ROW)
  expect(cm.matrix.other).toEqual(ROW)
})

test('can get a matrix', () => {
  const cm = new CM(CATEGORIES, MTX)
  expect(cm.classes).toEqual(CATEGORIES)
  expect(cm.matrix).toMatchObject(MTX)
})

describe('Entries', () => {
  test('can add to existing entries', () => {
    const cm = new CM(CATEGORIES)
    cm.addEntry('bug', 'bug')
    expect(cm.classes).toEqual(CATEGORIES)
    expect(cm.matrix.bug).toEqual({bug: 1, code: 0, other: 0})
    // expect(cm.matrix).toMatchObject(MTX)
  })

  test('can add new entries', () => {
    const cm = new CM(CATEGORIES)
    cm.addEntry('bug', 'chore')
    expect(cm.classes).toEqual(CATEGORIES)
    expect(cm.matrix.bug).toEqual({bug: 0, code: 0, other: 0, chore: 1})
  })

  test('can set entries', () => {
    const cm = new CM(CATEGORIES)
    cm.setEntry('code', 'bug', 1)
    cm.setEntry('code', 'code', 2)
    const ROW = {bug: 0, code: 0, other: 0}
    expect(cm.matrix.bug).toEqual(ROW)
    expect(cm.matrix.code).toEqual({bug: 1, code: 2, other: 0})
  })

  test('can get entries', () => {
    const cm = new CM(CATEGORIES, MTX)
    expect(cm.getEntry('bug', 'bug')).toStrictEqual(1)
    expect(cm.getEntry('code', 'other')).toStrictEqual(0)
  })
})

test('total 1/2', () => {
  const cm = new CM(CATEGORIES, MTX)
  expect(cm.getTotal()).toStrictEqual(7)
})

const M0 = {
  bug: {bug: 5, code: 0, other: 1},
  code: {bug: 1, code: 2, other: 0},
  other: {bug: 0, code: 3, other: 8},
}
const M = {
  13: 1 / 3,
  23: 2 / 3,
  56: 5 / 6,
  811: 8 / 11,
  89: 8 / 9,
}

test('total 2/2', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getTotal()).toStrictEqual(20)
})

test('TP', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getTP('bug')).toStrictEqual(5)
  expect(cm.getTP('code')).toStrictEqual(2)
  expect(cm.getTP('other')).toStrictEqual(8)
})

test('FP', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getFP('bug')).toStrictEqual(1)
  expect(cm.getFP('code')).toStrictEqual(3)
  expect(cm.getFP('other')).toStrictEqual(1)
})

test('FN', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getFN('bug')).toStrictEqual(1)
  expect(cm.getFN('code')).toStrictEqual(1)
  expect(cm.getFN('other')).toStrictEqual(3)
})

test('TN', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getTN('bug')).toStrictEqual(13)
  expect(cm.getTN('code')).toStrictEqual(14)
  expect(cm.getTN('other')).toStrictEqual(8)
})

test('Diagonal', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getDiagonal()).toEqual([5, 2, 8])
})

test('True', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getTrue()).toStrictEqual(15)
})

test('False', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getFalse()).toStrictEqual(5)
})

test('Actual Positives', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getPositive('bug')).toStrictEqual(6)
  expect(cm.getPositive('code')).toStrictEqual(3)
  expect(cm.getPositive('other')).toStrictEqual(11)
})

test('Actual Negatives', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getNegative('bug')).toStrictEqual(14)
  expect(cm.getNegative('code')).toStrictEqual(17)
  expect(cm.getNegative('other')).toStrictEqual(9)
})

test('Predicted Positives', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getPredPositive('bug')).toStrictEqual(6)
  expect(cm.getPredPositive('code')).toStrictEqual(5)
  expect(cm.getPredPositive('other')).toStrictEqual(9)
})

test('Predicted Negatives', () => {
  const cm = new CM(CATEGORIES, M0)
  expect(cm.getPredNegative('bug')).toStrictEqual(14)
  expect(cm.getPredNegative('code')).toStrictEqual(15)
  expect(cm.getPredNegative('other')).toStrictEqual(11)
})

describe('Accuracy', () => {
  const cm = new CM(CATEGORIES, M0)
  test('Accuracy', () => {
    expect(cm.getAccuracy('bug')).toStrictEqual(0.9)
    expect(cm.getAccuracy('code')).toStrictEqual(0.8)
    expect(cm.getAccuracy('other')).toStrictEqual(0.8)
  })

  test('Macro accuracy', () => {
    expect(cm.getMacroAccuracy()).toStrictEqual(M[56])
  })
  test('Micro accuracy', () => {
    expect(cm.getMicroAccuracy()).toStrictEqual(0.75)
  })
})

describe('Recall', () => {
  const cm = new CM(CATEGORIES, M0)
  test('Recall', () => {
    expect(cm.getRecall('bug')).toStrictEqual(M[56]) //.833
    expect(cm.getRecall('code')).toStrictEqual(M[23]) //.667
    expect(cm.getRecall('other')).toStrictEqual(M[811]) //.727
  })

  test('Macro recall', () => {
    expect(cm.getMacroRecall()).toStrictEqual((3 / 2 + M[811]) / 3) //~.742
  })

  test('Micro recall', () => {
    expect(cm.getMicroRecall()).toStrictEqual(0.75)
  })
})

describe('Precision', () => {
  const cm = new CM(CATEGORIES, M0)
  test('Precision', () => {
    expect(cm.getPrecision('bug')).toStrictEqual(M[56]) //.833
    expect(cm.getPrecision('code')).toStrictEqual(0.4)
    expect(cm.getPrecision('other')).toStrictEqual(M[89]) //.889
  })

  test('Macro precision', () => {
    expect(cm.getMacroPrecision()).toStrictEqual((M[56] + 0.4 + M[89]) / 3) //~.707
  })

  test('Micro precision', () => {
    expect(cm.getMicroPrecision()).toStrictEqual(0.75)
  })
})

describe('F1', () => {
  const cm = new CM(CATEGORIES, M0)
  test('F1', () => {
    expect(cm.getF1('bug')).toStrictEqual(M[56]) //.833
    expect(cm.getF1('code')).toStrictEqual(0.5)
    expect(toPrecision(cm.getF1('other'))).toStrictEqual(0.8) //FPA is fun (not)!
  })

  test('Macro F1', () => {
    expect(cm.getMacroF1()).toStrictEqual((M[56] + 1.3) / 3) //~.711
  })

  test('Micro F1', () => {
    expect(cm.getMicroF1()).toStrictEqual(0.75)
  })
})

describe('MissRate', () => {
  const cm = new CM(CATEGORIES, M0)
  test('MissRate', () => {
    expect(cm.getMissRate('bug')).toStrictEqual(1 / 6) //.167
    expect(cm.getMissRate('code')).toStrictEqual(M[13]) //.333
    expect(cm.getMissRate('other')).toStrictEqual(3 / 11) //.273
  })

  test('Macro MissRate', () => {
    expect(cm.getMacroMissRate()).toStrictEqual((0.5 + 3 / 11) / 3) //~.258
  })

  test('Micro MissRate', () => {
    expect(cm.getMicroMissRate()).toStrictEqual(0.25)
  })
})

describe('FallOut', () => {
  const cm = new CM(CATEGORIES, M0)
  const FOs = [1 / 14, 3 / 17, 1 / 9]
  test('FallOut', () => {
    expect(cm.getFallOut('bug')).toStrictEqual(FOs[0]) //.071
    expect(cm.getFallOut('code')).toStrictEqual(FOs[1]) //.176
    expect(cm.getFallOut('other')).toStrictEqual(FOs[2]) //.111
  })

  test('Macro FallOut', () => {
    expect(cm.getMacroFallOut()).toStrictEqual((FOs[0] + FOs[1] + FOs[2]) / 3) //.12
  })

  test('Micro FallOut', () => {
    expect(cm.getMicroFallOut()).toStrictEqual(0.125)
  })
})

describe('Specificity', () => {
  const cm = new CM(CATEGORIES, M0)
  const Ss = [13 / 14, 14 / 17, M[89]]
  test('Specificity', () => {
    expect(cm.getSpecificity('bug')).toStrictEqual(Ss[0]) //.929
    expect(cm.getSpecificity('code')).toStrictEqual(Ss[1]) //.824
    expect(cm.getSpecificity('other')).toStrictEqual(Ss[2]) //.889
  })

  test('Macro Specificity', () => {
    expect(cm.getMacroSpecificity()).toStrictEqual((Ss[0] + Ss[1] + Ss[2]) / 3) //.88
  })

  test('Micro Specificity', () => {
    expect(cm.getMicroSpecificity()).toStrictEqual(0.875)
  })
})

describe('Prevalence', () => {
  const cm = new CM(CATEGORIES, M0)
  test('Prevalence', () => {
    expect(cm.getPrevalence('bug')).toStrictEqual(0.3)
    expect(cm.getPrevalence('code')).toStrictEqual(0.15)
    expect(cm.getPrevalence('other')).toStrictEqual(0.55)
  })

  test('Macro Prevalence', () => {
    expect(cm.getMacroPrevalence()).toStrictEqual(M[13]) //.333
  })

  test('Micro Prevalence', () => {
    expect(cm.getMicroPrevalence()).toStrictEqual(M[13])
  })
})

describe('fromData', () => {
  const actual = [
    'code',
    'code',
    'other',
    'other',
    'bug',
    'bug',
    'code',
    'other',
    'code',
    'bug',
  ]
  const predicted = [
    'other',
    'code',
    'other',
    'other',
    'bug',
    'other',
    'code',
    'bug',
    'code',
    'bug',
  ]
  it('works', () => {
    const cm = CM.fromData(actual, predicted, CATEGORIES)
    expect(cm.classes).toEqual(CATEGORIES)
    expect(cm.matrix).toMatchObject({
      bug: {bug: 2, code: 0, other: 1},
      code: {bug: 0, code: 3, other: 1},
      other: {bug: 1, code: 0, other: 2},
    })
  })

  it('fails on disparate arrays', () => {
    const pred = [
      'other',
      'code',
      'other',
      'other',
      'bug',
      'other',
      'code',
      'bug',
      'code',
    ]
    expect(() => CM.fromData(actual, pred, CATEGORIES)).toThrowError(
      "actual and predictions don't have the same length",
    )
  })

  it('can gather classes', () => {
    const cm = CM.fromData(actual, predicted)
    expect(cm.classes).toEqual(['code', 'other', 'bug'])
    expect(cm.matrix).toMatchObject({
      bug: {bug: 2, code: 0, other: 1},
      code: {bug: 0, code: 3, other: 1},
      other: {bug: 1, code: 0, other: 2},
    })
  })
})

describe('toString', () => {
  const cm = new CM(CATEGORIES, M0)
  const S = ' '.repeat(12)
  const S4 = `${S}    `
  // const E = '\u001b[39m'
  // const W = '\u001b[38;5;231m'

  it('can show a colourless table', () => {
    const cmStr = `Actual \\ Predicted  bug   code  other
------------------  ----  ----  -----
   bug${S}  5.00  0.00  1.00 
   code${S} 1.00  2.00  0.00 
   other${S}0.00  3.00  8.00 \n`
    expect(cm.toString({colours: false})).toStrictEqual(cmStr)
    expect(cm.toString({colours: false, clean: true})).toStrictEqual(cmStr)
    expect(cm.toString({colours: false, maxValue: 10})).toStrictEqual(cmStr)
  })

  // eslint-disable-next-line jest/no-commented-out-tests
  /* if (!process.env.CI) { //@todo re-enable those tests once there's a better way (re `nclr/chalk` issue) to test colours
    it('can show a coloured table', () => {
      const colouredStr0 = `Actual \\ Predicted  bug   code  other
------------------  ----  ----  -----
   bug${S}  \u001b[38;5;22m5.00${E}  ${W}0.00${E}  \u001b[38;5;52m1.00${E} 
   code${S} \u001b[38;5;52m1.00${E}  \u001b[38;5;22m2.00${E}  ${W}0.00${E} 
   other${S}${W}0.00${E}  \u001b[38;5;52m3.00${E}  \u001b[38;5;22m8.00${E} \n`
      expect(cm.toString()).toStrictEqual(colouredStr0)
      const colouredStr = `Actual \\ Predicted  bug   code  other
------------------  ----  ----  -----
   bug${S}  \u001b[38;5;28m5.00${E}  ${W}0.00${E}  \u001b[38;5;52m1.00${E} 
   code${S} \u001b[38;5;52m1.00${E}  \u001b[38;5;22m2.00${E}  ${W}0.00${E} 
   other${S}${W}0.00${E}  \u001b[38;5;88m3.00${E}  \u001b[38;5;34m8.00${E} \n`
      expect(cm.toString({maxValue: 20})).toStrictEqual(colouredStr)
    })

    it('can show split coloured table', () => {
      const splitColouredStr = `1/2 Actual \\ Predicted  bug   code
----------------------  ----  ----
   bug${S4}  \u001b[38;5;22m5.00${E}  ${W}0.00${E}
   code${S4} \u001b[38;5;52m1.00${E}  \u001b[38;5;22m2.00${E}
   other${S4}${W}0.00${E}  \u001b[38;5;52m3.00${E}

2/2 Actual \\ Predicted  other
----------------------  -----
   bug${S4}  \u001b[38;5;52m1.00${E} 
   code${S4} ${W}0.00${E} 
   other${S4}\u001b[38;5;22m8.00${E} \n`
      expect(cm.toString({split: true})).toStrictEqual(splitColouredStr)
    })
  } */
  it('can show a split colourless table', () => {
    const cmSplitStr = `1/2 Actual \\ Predicted  bug   code
----------------------  ----  ----
   bug${S4}  5.00  0.00
   code${S4} 1.00  2.00
   other${S4}0.00  3.00

2/2 Actual \\ Predicted  other
----------------------  -----
   bug${S4}  1.00 
   code${S4} 0.00 
   other${S4}8.00 \n`
    expect(cm.toString({colours: false, split: true})).toStrictEqual(cmSplitStr)
  })
})

test('shortStats', () => {
  const cm = new CM(CATEGORIES, M0)
  const ss = `Total: 20
True: 15
False: 5
Accuracy: 75%
Precision: 75%
Recall: 75%
F1: 75%`
  expect(cm.getShortStats()).toStrictEqual(ss)
})

describe('Long stats', () => {
  const cm = new CM(CATEGORIES, M0)
  const stats = cm.getStats()
  it('has general stats', () => {
    expect(stats).toMatchObject({
      total: 20,
      correctPredictions: 15,
      incorrectPredictions: 5,
      classes: CATEGORIES,
      microAvg: {},
      macroAvg: {},
      results: {
        bug: {},
        code: {},
        other: {},
      },
    })
  })

  it('has micro details', () => {
    expect(stats.microAvg).toMatchObject({
      accuracy: 0.75,
      f1: 0.75,
      fallOut: 0.125,
      missRate: 0.25,
      precision: 0.75,
      prevalence: M[13],
      recall: 0.75,
      specificity: 0.875,
    })
  })

  it('has macro details', () => {
    expect(stats.macroAvg).toMatchObject({
      accuracy: M[56],
      f1: 19.2 / 27,
      fallOut: 59 / 714 + 1 / 27,
      missRate: 25.5 / 99,
      precision: (M[56] + 0.4 + M[89]) / 3,
      prevalence: M[13],
      recall: (3 / 2 + 8 / 11) / 3,
      specificity: 417 / 714 + 8 / 27,
    })
  })

  it('has class details', () => {
    const bugStats = stats.results.bug
    expect(bugStats).toMatchObject({
      total: 6,
      samplePortion: 0.3,
      tp: 5,
      fp: 1,
      fn: 1,
      tn: 13,
      confusionMatrix: [[5, 1], [1, 13]],
    })
    expect(bugStats).toHaveProperty('accuracy')
    expect(bugStats).toHaveProperty('f1')
    expect(bugStats).toHaveProperty('fallOut')
    expect(bugStats).toHaveProperty('missRate')
    expect(bugStats).toHaveProperty('precision')
    expect(bugStats).toHaveProperty('prevalence')
    expect(bugStats).toHaveProperty('recall')
    expect(bugStats).toHaveProperty('specificity')
  })
})
