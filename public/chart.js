/* eslint-disable no-console */
/* global Chart */
const ctx = document.getElementById('labels').getContext('2d')

/* const backgroundColor = [
    '#ff0000',
    '#ff0000',
    '#f60009',
    '#ec0013',
    '#e3001c',
    '#d90026',
    '#d0002f',
    '#c60039',
    '#bd0042',
    '#b3004c',
    '#aa0055',
    '#a1005e',
    '#970068',
    '#8e0071',
    '#84007b',
    '#7b0084',
    '#71008e',
    '#680097',
    '#5e00a1',
    '#5500aa',
    '#4c00b3',
    '#4200bd',
    '#3900c6',
    '#2f00d0',
    '#2600d9',
    '#1c00e3',
    '#1300ec',
    '#0900f6',
  ]; */

const loadData = async () => {
  try {
    const data = await Promise.all([
      fetch('../src/categories.json').then(res => res.json(), console.error),
      fetch('../playground/categoryPartitions.json').then(
        res => res.json(),
        console.error,
      ),
    ])

    return data //[categories, categoryPartitions]
  } catch (error) {
    console.log('Error downloading one or more files:', error)
  }
}

/**
 * Organise a dataset for ChartJS.
 * @param {[string[], object[]]} data Dataset of categories and instances
 * @returns {Object} configuration for ChartJS
 */
const buildConfig = data => {
  const res = {
    labels: data[0], //categories
    datasets: [
      {
        label: 'Training',
        data: new Array(data[0].length).fill(0),
        backgroundColor: '#00f',
      },
      {
        label: 'Validation',
        data: new Array(data[0].length).fill(0),
        backgroundColor: '#0f0',
      },
      {
        label: 'Test',
        data: new Array(data[0].length).fill(0),
        backgroundColor: '#f00',
      },
    ],
  }

  // data[1].forEach(instance => { //For labels.json
  //   const idx = data[0].indexOf(instance.category)
  //   res.datasets[0].data[idx]++
  // })
  for (const cat in data[1]) {
    if (data[1].hasOwnProperty(cat)) {
      const inf = data[1][cat]
      const idx = data[0].indexOf(cat)
      // res.datasets[0].data[idx] = inf.overall
      res.datasets[0].data[idx] = inf.train
      res.datasets[1].data[idx] = inf.validation
      res.datasets[2].data[idx] = inf.test
    }
  }
  return res
}

loadData().then(
  data => {
    const chartConfig = buildConfig(data, 'All Contributors Categories')
    console.log('cfg=', chartConfig)

    const chart = new Chart(ctx, {
      type: 'bar',
      data: chartConfig,
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              stacked: true,
            },
          ],
          xAxes: [
            {
              stacked: true,
            },
          ],
        },
      },
    })
    console.log(chart)
  },
  err => console.error('loadData error:', err),
)
