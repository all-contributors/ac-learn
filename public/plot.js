/* eslint-disable no-console */
/* global Plotly */
import {loadData, orderEntriesByValues, perc} from './utils.js'

const labelDistributionPlot = data => {
  const orderedData = orderEntriesByValues(
    data,
    ['overall', 'train', 'test', 'validation'],
    ['asc', 'asc', 'asc', 'asc'],
  )
  // console.log('ordered:', orderedData)
  const xVals = orderedData.map(entry => entry[1].overall)
  const categoryDistPlot = {
    y: orderedData.map(entry => entry[0]),
    x: xVals,
    type: 'bar',
    orientation: 'h',
    text: xVals.map(String),
    textposition: 'outside',
    hoverinfo: 'none',
    // marker: {
    //   color: 'rgb(158,202,225)',
    //   opacity: 0.6,
    //   line: {
    //     color: 'rgb(8,48,107)',
    //     width: 1.5
    //   }
    // }
  }

  const vizData = [categoryDistPlot]
  const layout = {
    title: 'Label Distribution',
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
      dtick: Math.log10(1), //log10(e**1), 0.30102999566
    },
  }

  Plotly.newPlot('plot0', vizData, layout, {scrollZoom: true})
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
  console.log('tvt=', tvtSplits)

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

  // const pie = {
  //   labels: Object.keys(tvtSplits),
  //   values: Object.values(tvtSplits),
  //   type: 'pie',
  // }

  const vizData = [partitionsPlot]
  const layout = {
    title: 'Dataset partitions',
    autosize: true,
    font: {
      size: 18,
    },
    // height: 1000,
    yaxis: {
      title: 'Count',
      automargin: true,
    },
    xaxis: {
      title: 'Partitions',
      //   type: 'log',
      //   automargin: true,
      //   tick0: 0,
      //   dtick: Math.log10(1), //log10(e**1), 0.30102999566
    },
  }

  Plotly.newPlot('plot1', vizData, layout, {scrollZoom: true})
  // Plotly.newPlot('plot', [pie], layout);
}

const build = async () => {
  const [data] = await loadData()
  console.log(data)
  const entries = Object.entries(data)
  labelDistributionPlot(entries)
  tvtPartitionsPlot(entries)
}

build()
