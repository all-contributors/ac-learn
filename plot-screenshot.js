const puppeteer = require('puppeteer')
const {succ, use} = require('nclr')

const URL = process.env.URL || 'http://localhost:5000/public/plot'

const screenshotElement = async (page, id) => {
  await page.waitForSelector(`#${id}`)
  const element = await page.$(`#${id}`)
  await element.screenshot({path: `public/${id}.png`})
  succ(`${use('out', id)} screenshot done`)
}

;(async () => {
  // 1. Launch the browser
  const browser = await puppeteer.launch()
  // 2. Open a new page
  const page = await browser.newPage()
  // 3. Navigate to URL
  await page.goto(URL, {waitUntil: 'networkidle2'})
  // 4. Take screenshot
  await page.screenshot({path: 'public/plot-fullpage.png', fullPage: true})
  succ(`${use('out', 'Plot.html')} full-page screenshot done`)
  await screenshotElement(page, 'labelDist')
  await screenshotElement(page, 'playgroundGraphs')

  await browser.close()
})()
