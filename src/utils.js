const chalk = require('chalk')

const objectify = (arr, val = {}) => {
  const res = {}
  arr.forEach(el => {
    res[el] = val
  })
  return res
}

const sum = (...arr) => [...arr].reduce((acc, val) => acc + val, 0)

/**
 * @param {Object} mtx Labelled matrix
 * @returns {Array<number>[]} 2D array
 * @example
 * const mtx = {
 *   bug: { bug: 1, code: 0, other: 0},
 *   code: { bug: 1, code: 2, other: 0},
 *   other: { bug: 0, code: 0, other: 3}
 * }
 * matrixTo2dArr(mtx) //[[1, 0, 0], [1, 2, 0], [0, 0, 3]]
 */
const matrixTo2dArr = mtx => Object.keys(mtx).map(k => Object.values(mtx[k]))

/**
 * @param {Object<Object, number>} matrix Labelled matrix
 * @returns {number} Sum of all values in `matrix`
 * @example
 * const mtx = {
 *  bug: { bug: 1, code: 0, other: 0},
 *  code: { bug: 1, code: 2, other: 0},
 *  other: { bug: 0, code: 0, other: 3}
 * }
 * matrixSum(mtx) //7
 */
const matrixSum = matrix => {
  const twoD = matrixTo2dArr(matrix).reduce((a, b) => a.concat(b), [])
  return sum(...twoD)
}

/**
 * Given a Object*Object matrix, give the array of entries in the specified column.
 * @param {Object<Object, number>} matrix NxN matrix with labelled rows
 * @param {string} colName Column name to filter
 * @returns {number[]} Values of the column
 * @example
 * const mtx = {
 *   bug: { bug: 1, code: 0, other: 0},
 *   code: { bug: 1, code: 2, other: 0},
 *   other: { bug: 0, code: 0, other: 3}
 * }
 * column(mtx, 'bug') //[1, 1, 0]
 * column(mtx, 'code') //[0, 2, 0]
 */
const column = (matrix, colName) => {
  const res = []
  for (const row in matrix) {
    if (matrix.hasOwnProperty(row)) res.push(matrix[row][colName])
  }
  return res
}

const PRECISION = 1000000000
const toPrecision = (num, precision = PRECISION) =>
  Math.round(num * precision) / precision

//https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_chunk
const chunk = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
  }, [])
}

/**
 * @param {Object<Object>} matrix Confusion matrix
 * @returns {Object<Object>} Matrix with no empty (zeroed) cross-entries
 */
const rmEmpty = matrix => {
  const empty = []
  Object.keys(matrix).forEach(k => {
    const emptyRow = !Object.values(matrix[k]).filter(Boolean).length
    const emptyCol = !column(matrix, k).filter(Boolean).length
    if (emptyRow && emptyCol) empty.push(k)
  })
  const nonEmpty = {}
  for (const row in matrix) {
    if (matrix.hasOwnProperty(row) && !empty.includes(row))
      nonEmpty[row] = matrix[row]
  }
  return nonEmpty
}

/**
 * Hexademical colour series.
 * @param {number} position Position in the R(0)G(1)B(2) order
 * @param {number} [inc=.1] Increment
 * @throws {Error} `0 <= position <= 2` condition not respected
 * @returns {string[]} Series
 */
const hexSeries = (position, inc = 0.1) => {
  if (position < 0 || position > 2)
    throw new Error('position needs be between 0 and 2')
  const TEMPLATE = ['00', '00', '00']
  const res = []
  for (let i = 0.1; i <= 1; i += inc) {
    res.push([...TEMPLATE])
    res[res.length - 1][position] = Math.round(parseFloat(0xff * i)).toString(
      16,
    )
    res[res.length - 1] = `#${res[res.length - 1].join('')}`
  }
  return res
}

const COLOURS = {
  good: hexSeries(1), //numbers in the True diagonal
  bad: hexSeries(0), //numbers in the other sections
}

/**
 * @param {number} num Number to colourize
 * @param {number} maxVal Highest value to expect
 * @param {boolean} [goodValue=false] Indication on whether it's a good or bad value
 * @returns {string} Coloured number
 */
const clrVal = (num, maxVal, goodValue = false) => {
  if (num == 0) return chalk.hex(goodValue ? '#ff0' : '#fff')('0.00')
  const palette = COLOURS[goodValue ? 'good' : 'bad']
  const pos = Math.round((num / maxVal) * palette.length)
  const clr = palette[pos]
  return chalk.hex(clr)(num)
}

/**
 * Functional sum on all classes of a confusion matrix.
 * @param {ConfusionMatrix} cm Confusion matrix instance
 * @param {string} fx Function name (without the `get`)
 * @returns {number} Sum
 */
const fxSum = (cm, fx) => sum(...cm.classes.map(c => cm[`get${fx}`](c)))

module.exports = {
  objectify,
  sum,
  column,
  matrixSum,
  toPrecision,
  chunk,
  rmEmpty,
  clrVal,
  fxSum,
}
