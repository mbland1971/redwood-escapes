const { defineConfig, devices } = require('@playwright/test')
const path = require('path')

const filePath = path.resolve(__dirname, 'index.html')
const fileUrl = `file://${filePath.replace(/ /g, '%20')}`

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: fileUrl,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
