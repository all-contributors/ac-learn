const labels = require('./labels').getAll()

module.exports = format => {
  switch (format) {
    case 'io':
    case 'limdu':
      return labels.map(el => ({input: el.label, output: el.category}))
    case 'arr':
      return labels.map(el => [el.label, el.category])
    default:
      return labels
  }
}
