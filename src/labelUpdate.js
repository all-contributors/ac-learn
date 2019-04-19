const fs = require('fs')
const chalk = require('chalk')
const labels = require('./labels-draft.json')
const ds = require('./dataset.json')

const update = () => {
  const sorted = []
  const set = new Set()
  labels.forEach(l => set.add(l.label.toLowerCase()))

  Array.from(set)
    .sort()
    .forEach(l => {
      const label = labels.find(lbl => lbl.label.toLowerCase() === l)
      let category = label.category || '' //Keep the category
      if (category === '') {
        const knownData = ds.filter(d => d[0].toLowerCase() === l)
        if (knownData.length) category = knownData[0][1] //Otherwise get the known one
      }
      sorted.push({label: l, category})
    })

  fs.writeFile('labels.json', JSON.stringify(sorted, null, 2), err => {
    /* eslint-disable no-console */
    if (err) throw err
    console.log(chalk.cyan(`${sorted.length} results saved`))
    /* eslint-enable no-console */
  })
}

update()
