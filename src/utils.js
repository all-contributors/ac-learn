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

module.exports = {objectify, sum, column, matrixSum}
