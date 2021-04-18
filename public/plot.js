/* eslint-disable no-console */
/* global Plotly */
import {loadData, orderEntriesByValues, perc, chunk, groupBy} from './utils.js'

const labelDistributionPlot = data => {
  const groups = groupBy(data, 'category')
  const orderedData = Object.entries(groups).map(entry => [
    entry[0],
    entry[1].length,
  ])
  orderedData.sort((a, b) => a[1] - b[1])
  const xVals = orderedData.map(entry => entry[1])
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(
      x => `${x} (<span style="color: #00f">${perc(x / data.length)}</span>)`,
    ),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Label distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Contribution categories (labels)',
      automargin: true,
    },
    xaxis: {
      title: 'Overall count',
      type: 'log',
      automargin: true,
      tick0: 0,
      dtick: Math.log10(1), //log10(2)
    },
  }

  Plotly.newPlot('labelDist', vizData, layout, {scrollZoom: true})
}

const predictionDistributionPlot = data => {
  const xVals = ['Correct', 'Incorrect']
  const yVals = [data.correctPredictions, data.incorrectPredictions]
  const partitionsPlot = {
    x: xVals,
    y: yVals,
    type: 'bar',
    text: yVals.map(
      y => `${y} (<span style="color: #00f">${perc(y / data.total)}</span>)`,
    ),
    hoverinfo: 'none',
    textposition: 'auto',
    marker: {
      color: 'rgb(158,202,225)',
      opacity: 0.6,
      line: {
        color: 'rgb(8,48,107)',
        width: 1.5,
      },
    },
  }

  const vizData = [partitionsPlot]
  const layout = {
    title: 'Model predictions',
    autosize: true,
    font: {
      size: 18,
    },
    yaxis: {
      title: 'Count',
      automargin: true,
    },
    xaxis: {
      title: 'Correctness',
    },
  }

  Plotly.newPlot('predictions', vizData, layout, {scrollZoom: true})
}

const accuracyDistributionPlot = data => {
  const orderedData = Object.entries(data.results).map(entry => [
    entry[0],
    entry[1].accuracy,
  ])
  orderedData.sort((a, b) => a[1] - b[1])
  const xVals = orderedData.map(entry => entry[1])
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Model accuracy distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Contribution categories (labels)',
      automargin: true,
    },
    xaxis: {
      title: 'Accuracy',
      type: 'linear',
      automargin: true,
      tick0: 0,
      dtick: 0.1,
    },
  }

  Plotly.newPlot('accDist', vizData, layout, {scrollZoom: true})
}

const f1DistributionPlot = data => {
  const orderedData = Object.entries(data.results).map(entry => [
    entry[0],
    entry[1].f1,
  ])
  orderedData.sort((a, b) => a[1] - b[1])
  const xVals = orderedData.map(entry => entry[1])
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Model F1 distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Contribution categories (labels)',
      automargin: true,
    },
    xaxis: {
      title: 'F1 Score',
      type: 'linear',
      automargin: true,
      tick0: 0,
      dtick: 0.1,
    },
  }

  Plotly.newPlot('f1Dist', vizData, layout, {scrollZoom: true})
}

const precisionDistributionPlot = data => {
  const orderedData = Object.entries(data.results).map(entry => [
    entry[0],
    entry[1].precision,
  ])
  orderedData.sort((a, b) => a[1] - b[1])
  const xVals = orderedData.map(entry => entry[1])
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Model Precision distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Contribution categories (labels)',
      automargin: true,
    },
    xaxis: {
      title: 'F1 Score',
      type: 'linear',
      automargin: true,
      tick0: 0,
      dtick: 0.1,
    },
  }

  Plotly.newPlot('prDist', vizData, layout, {scrollZoom: true})
}

const tvtPartitionsPlot = data => {
  const tvtSplits = data
    .map(entry => entry[1])
    .reduce((acc, part) => {
      for (const key in part) {
        if (key in acc) acc[key] += part[key]
        else acc[key] = part[key]
      }
      return acc
    }, {})

  const xVals = Object.keys(tvtSplits).slice(1)
  const yVals = Object.values(tvtSplits).slice(1)
  const partitionsPlot = {
    x: xVals,
    y: yVals,
    type: 'bar',
    text: yVals.map(
      y =>
        `${y} (<span style="color: #00f">${perc(
          y / tvtSplits.overall,
        )}</span>)`,
    ),
    hoverinfo: 'none',
    textposition: 'auto',
    marker: {
      color: 'rgb(158,202,225)',
      opacity: 0.6,
      line: {
        color: 'rgb(8,48,107)',
        width: 1.5,
      },
    },
  }

  const vizData = [partitionsPlot]
  const layout = {
    title: 'Dataset partitions',
    autosize: true,
    font: {
      size: 18,
    },
    yaxis: {
      title: 'Count',
      automargin: true,
    },
    xaxis: {
      title: 'Partitions',
    },
  }

  Plotly.newPlot('tvtPartitions', vizData, layout, {scrollZoom: true})
}

const facettedPartitionPlot = data => {
  const orderedData = orderEntriesByValues(
    data,
    ['overall', 'train', 'test', 'validation'],
    ['desc', 'desc', 'desc', 'desc'],
  )
  const chunks = chunk(orderedData, 9)
  const plotName = 'partitions'
  const parentPlot = document.getElementById(plotName)

  chunks.forEach((chk, section) => {
    const vizData = chk.map(([name, categories], idx) => {
      return {
        x: Object.keys(categories).slice(1),
        y: Object.values(categories).slice(1),
        type: 'bar', //'scatter'??
        name,
        xaxis: `x${idx + 1}`,
        yaxis: `y${idx + 1}`,
      }
    })

    const size = Math.round(Math.sqrt(chk.length))
    const layout = {
      title: `Dataset partitions by category ${section + 1}/${chunks.length}`,
      autosize: true,
      yaxis: {
        title: 'Count',
      },
      grid: {
        rows: size,
        columns: size,
        pattern: 'independent',
      },
    }

    parentPlot.innerHTML += `<div id="${plotName}_${section}"></div>`
    Plotly.newPlot(`${plotName}_${section}`, vizData, layout, {
      scrollZoom: true,
    })
  })
}

const trainedCategories = data => {
  const orderedData = orderEntriesByValues(data, [
    'train',
    'overall',
    'validation',
  ])
  const xVals = orderedData.map(entry => entry[1].train)
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Training set label distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Training categories',
      automargin: true,
    },
    xaxis: {
      title: '# of training observations',
      // type: 'log',
      automargin: true,
      // tick0: 0,
      // dtick: Math.log10(1), //log10(e**1), 0.30102999566
    },
  }

  Plotly.newPlot('trainingLabelDist', vizData, layout, {scrollZoom: true})
}

const validatedCategories = data => {
  const orderedData = orderEntriesByValues(data, [
    'validation',
    'overall',
    'train',
    'test',
  ])
  const xVals = orderedData.map(entry => entry[1].validation)
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Validation set label distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Validation categories',
      automargin: true,
    },
    xaxis: {
      title: '# of validation observations',
      // type: 'log',
      automargin: true,
    },
  }

  Plotly.newPlot('validationLabelDist', vizData, layout, {scrollZoom: true})
}

const testedCategories = data => {
  const orderedData = orderEntriesByValues(data, [
    'test',
    'overall',
    'validation',
    'train',
  ])
  const xVals = orderedData.map(entry => entry[1].test)
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Test set label distribution',
    autosize: true,
    font: {
      size: 18,
    },
    height: 1000,
    yaxis: {
      title: 'Test categories',
      automargin: true,
    },
    xaxis: {
      title: '# of test observations',
      // type: 'log',
      automargin: true,
    },
  }

  Plotly.newPlot('testLabelDist', vizData, layout, {scrollZoom: true})
}

const build = async () => {
  const [data, categoryPartitions, modelStats] = await loadData()
  console.log(data)
  const entries = Object.entries(categoryPartitions)
  labelDistributionPlot(data)
  predictionDistributionPlot(modelStats)
  accuracyDistributionPlot(modelStats)
  f1DistributionPlot(modelStats)
  precisionDistributionPlot(modelStats)
  tvtPartitionsPlot(entries)
  facettedPartitionPlot(entries)
  trainedCategories(entries)
  validatedCategories(entries)
  testedCategories(entries)
}

build()
