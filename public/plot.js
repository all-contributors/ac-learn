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

const build = async () => {
  const [/* categories,  */ data] = await loadData()
  console.log(data)
  const q1Plot = {
    x: Object.keys(data),
    y: Object.values(data).map(ctr => ctr.overall),
    type: 'bar',
  }

  const vizData = [q1Plot]
  const layout = {
    title: 'Label Distribution',
  }

  // eslint-disable-next-line no-undef
  Plotly.newPlot('plot', vizData, layout, {scrollZoom: true})
}

build()
