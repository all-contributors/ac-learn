/* eslint-disable no-console */
const loadData = async () => {
  try {
    const data = await Promise.all([
      // fetch('../src/categories.json').then(res => res.json(), console.error),
      // fetch('../src/labels.json').then(res => res.json(), console.error),
      fetch('../playground/categoryPartitions.json').then(
        res => res.json(),
        console.error,
      ),
    ])

    return data //[categories, dataset, categoryPartitions]
  } catch (error) {
    console.log('Error downloading one or more files:', error)
  }
}

//Source: https://www.30secondsofcode.org/js/s/order-by/
const orderBy = (arr, props, orders) =>
  [...arr].sort((a, b) =>
    props.reduce((acc, prop, i) => {
      if (acc === 0) {
        const [p1, p2] =
          orders && orders[i] === 'desc'
            ? [b[prop], a[prop]]
            : [a[prop], b[prop]]
        acc = p1 > p2 ? 1 : p1 < p2 ? -1 : 0
      }
      return acc
    }, 0),
  )

const orderEntriesByValues = (arr, props, orders) =>
  [...arr].sort(([, a], [, b]) =>
    props.reduce((acc, prop, i) => {
      if (acc === 0) {
        const [p1, p2] =
          orders && orders[i] === 'desc'
            ? [b[prop], a[prop]]
            : [a[prop], b[prop]]
        acc = p1 > p2 ? 1 : p1 < p2 ? -1 : 0
      }
      return acc
    }, 0),
  )

const perc = num => `${Math.round(num * 10000) / 100}%`

//Source: https://www.30secondsofcode.org/js/s/chunk/
const chunk = (arr, size) =>
  Array.from({length: Math.ceil(arr.length / size)}, (v, i) =>
    arr.slice(i * size, i * size + size),
  )

export {loadData, orderBy, orderEntriesByValues, perc, chunk}
