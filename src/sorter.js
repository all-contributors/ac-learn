const fs = require('fs')
const {join} = require('path')
const chalk = require('chalk')

const labelsPath = join(__dirname, './labels.json')
const labels = require(labelsPath)

const update = () => {
  const sorted = []
  const set = new Set()
  labels.forEach(l => set.add(l.label.toLowerCase()))

  Array.from(set)
    .sort()
    .forEach(l => {
      const label = labels.find(lbl => lbl.label.toLowerCase() === l)
      sorted.push({label: l, category: label.category})
    })

  fs.writeFile(labelsPath, JSON.stringify(sorted, null, 2), err => {
    /* eslint-disable no-console */
    if (err) throw err
    console.log(chalk.cyan(`${sorted.length} results saved`))
    /* eslint-enable no-console */
  })
}

update()
