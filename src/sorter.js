const fs = require('fs')
const chalk = require('chalk')
const labels = require('./labels.json')

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

  fs.writeFile('labels.json', JSON.stringify(sorted, null, 2), err => {
    /* eslint-disable no-console */
    if (err) throw err
    console.log(chalk.cyan(`${sorted.length} results saved`))
    /* eslint-enable no-console */
  })
}

update()
