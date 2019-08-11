const fs = require('fs')

// For jsdom version 10 or higher.
// Require JSDOM Class.
const JSDOM = require('jsdom').JSDOM
// Create instance of JSDOM.
const jsdom = new JSDOM('<body><div id="container"></div></body>', {
  runScripts: 'dangerously',
})
// require anychart and anychart export modules
const anychart = require('anychart')(jsdom.window)
const anychartExport = require('anychart-nodejs')(anychart)

// const cats = require('../src/categories.json')
const data = require('../playground/categoryPartitions.json')

/* eslint-disable no-console */

// Process the data
const trainData = []
const validationData = []
const testData = []
Object.keys(data).forEach(d => {
  trainData.push([d, data[d].train])
  validationData.push([d, data[d].validation])
  testData.push([d, data[d].test])
})

// create and a chart to the jsdom window.
// chart creating should be called only right after anychart-nodejs module requiring
const chart = anychart.bar()
chart.yScale().stackMode('value')

const trainSeries = chart.bar(trainData)
const validationSeries = chart.bar(validationData)
const testSeries = chart.bar(testData)

trainSeries.name('Train')
validationSeries.name('Validation')
testSeries.name('Test')
// trainSeries.legendItem(true);
// validationSeries.legendItem(true);
// testSeries.legendItem(true);
// trainSeries.legendItem().enabled(true);

// Content
const title = chart.title()
title.enabled(true)
title.text('All Contributors Categories')
const yAxis = chart.yAxis()
yAxis.title('Overall count')
const xAxis = chart.xAxis()
xAxis.title('Categories')

chart.bounds(0, 0, 1600, 1000)
chart.container('container')

// enable major grids
// chart.xGrid(true);
chart.yGrid(true)
chart.yMinorGrid(true)
// chart.legend(true);
chart.draw()

// create a standalone legend
// const legend = anychart.standalones.legend();
// // set the container for the legend
// legend.container('container');
// legend.itemsSource([trainSeries, validationSeries, testSeries]);
// // draw the legend
// legend.draw();

// generate a JPG image and save it to a file
/* eslint-disable no-console */
anychartExport.exportTo(chart, 'jpg').then(
  image => {
    fs.writeFile('anychart.jpg', image, fsWriteError => {
      console.log(fsWriteError || 'Complete')
    })
  },
  generationError => {
    console.log(generationError)
  },
)
/* eslint-enable no-console */
