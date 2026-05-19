const { join } = require('node:path')

/** @type {import('puppeteer').Configuration} */
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
  browser: 'chrome-headless-shell',
}
