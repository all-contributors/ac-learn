/* eslint-disable no-console */
/* global Chart */
const ctx = document.getElementById('labels').getContext('2d')

// const loadData = async () => {
//     try {
//         const data = await Promise.all([
//             fetch('../src/categories.json').then(res => res.json(), console.error),
//             fetch('../src/labels.json').then(res => res.json(), console.error),
//         ]);

//         return data //[categories, dataset]
//     } catch (error) {
//         console.log('Error downloading one or more files:', error);
//     }
// }

// const rainbow = new Rainbow();

// const init = async () => {
//     const [CATEGORIES, DATASET] = await loadData();
//     rainbow.setNumberRange(1, CATEGORIES.length);
//     rainbow.setSpectrum('red', 'blue'); //purple

//     const colours = CATEGORIES.map((_, i) => `#${rainbow.colourAt(i)}`);

//     /**
//      * Organise a dataset for ChartJS.
//      * @param {[...{label: string, category: string}]} data Dataset
//      * @param {string} caption Caption of the chart
//      * @returns {Object} Data for ChartJS
//      */
//     const organize = (data, caption = 'Data') => {
//         const res = {
//             labels: CATEGORIES,
//             datasets: {
//                 label: caption,
//                 data: new Array(CATEGORIES.length).fill(0),
//                 backgroundColor: colours
//             }
//         }

//         data.forEach(instance => {
//             const idx = CATEGORIES.indexOf(instance.category);
//             res.datasets.data[idx]++;
//         });
//         // console.log('dataset=', res.dataset.backgroundColor);
//         return res;
//     };

//     const data = organize(DATASET);
//     console.log('data=', data);

//     const chart = new Chart(ctx, {
//         type: 'bar',
//         data,
//         options: {
//             scales: {
//                 yAxes: [{
//                     ticks: {
//                         beginAtZero: true
//                     }
//                 }]
//             }
//         }
//     });
//     console.log(chart);
// }

const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [
      'blog',
      'bug',
      'business',
      'code',
      'content',
      'design',
      'doc',
      'eventOrganizing',
      'example',
      'financial',
      'fundingFinding',
      'ideas',
      'infra',
      'maintenance',
      'null',
      'platform',
      'plugin',
      'projectManagement',
      'question',
      'review',
      'security',
      'talk',
      'test',
      'tool',
      'translation',
      'tutorial',
      'userTesting',
      'video',
    ],
    datasets: [
      {
        label: 'Categories',
        data: [
          3,
          20,
          3,
          57,
          2,
          11,
          22,
          4,
          2,
          4,
          2,
          25,
          13,
          30,
          197,
          23,
          4,
          5,
          5,
          1,
          7,
          2,
          8,
          13,
          1,
          2,
          3,
          3,
        ],
        backgroundColor: [
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
        ],
      },
    ],
  },
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

console.log(myChart)

// init();
