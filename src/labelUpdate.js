const fs = require('fs')
const labels = require('./labels-draft.json')
const ds = require('./dataset.json')
const chalk = require('chalk')

let sorted = []
let set = new Set()
labels.forEach(l => set.add(l.label.toLowerCase()))

Array.from(set)
  .sort()
  .forEach(l => {
    // console.log('l=', l)
    let label = labels.find(lbl => lbl.label.toLowerCase() === l)
    let category = label.category || '' //Keep the category
    // console.log('cat=', category)
    if (category === '') {
      let knownData = ds.filter(d => d[0].toLowerCase() === l)
      if (knownData.length) {
        category = knownData[0][1] //Otherwise get the known one
        // console.log('knownCat=', category)
      }
    }
    sorted.push({label: l, category})
  })

fs.writeFile('labels.json', JSON.stringify(sorted, null, 2), err => {
  if (err) console.error(err)
  console.log(chalk.cyan(`${sorted.length} results saved`))
})
