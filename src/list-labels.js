#!/usr/bin/env node
const args = require('yargs/yargs')(process.argv.slice(2)).argv._
const {info, use, out} = require('nclr')
const labels = require('./labels')
const len = labels.size()

const perc = num => `${Math.round(num * 10000) / 100}%`

// eslint-disable-next-line no-console
args.forEach(category => {
  const data = labels.getLabelsFromCategory(category)
  info(
    `${use('inp', category)} (${data.length} / ${len} = ${use(
      'out',
      perc(data.length / len),
    )})`,
  )
  out(
    JSON.stringify(
      data.map(d => d.label),
      null,
      2,
    ),
  )
  out('')
})
