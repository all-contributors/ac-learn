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
      fetch('../src/labels.json').then(res => res.json(), console.error),
    ])

    return data //[categories, dataset]
  } catch (error) {
    console.log('Error downloading one or more files:', error)
  }
}

/**
 * Organise a dataset for ChartJS.
 * @param {[string[], object[]]} data Dataset of categories and instances
 * @param {string} caption Caption of the chart
 * @returns {Object} configuration for ChartJS
 */
const buildConfig = (data, caption = 'Categories') => {
  const res = {
    labels: data[0], //categories
    datasets: [
      {
        label: caption,
        data: new Array(data[0].length).fill(0),
        backgroundColor: '#00f',
      },
    ],
  }

  data[1].forEach(instance => {
    const idx = data[0].indexOf(instance.category)
    res.datasets[0].data[idx]++
  })
  // console.log('dataset=', res.dataset.backgroundColor);
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
            },
          ],
        },
      },
    })
    console.log(chart)
  },
  err => console.error('loadData error:', err),
)
