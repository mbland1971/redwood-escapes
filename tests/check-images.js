#!/usr/bin/env node
/**
 * Checks every image URL in index.html (both <img> src and CSS background-image)
 * and reports which ones return HTTP 200 vs errors.
 * Run with: npm run test:images
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const htmlPath = path.resolve(__dirname, '../index.html')
const html = fs.readFileSync(htmlPath, 'utf8')

const urls = new Set()

// Extract <img src="..."> URLs
const imgMatches = html.matchAll(/img\s[^>]*src="(https?:\/\/[^"]+)"/g)
for (const m of imgMatches) urls.add(m[1])

// Extract CSS background-image: url('...') from style blocks or inline CSS
const bgMatches = html.matchAll(/background-image:\s*url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/g)
for (const m of bgMatches) urls.add(m[1])

// Also scan the stylesheet
const cssPath = path.resolve(__dirname, '../styles.css')
const css = fs.readFileSync(cssPath, 'utf8')
const cssMatches = css.matchAll(/background-image:\s*url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/g)
for (const m of cssMatches) urls.add(m[1])

function checkUrl(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 10000 }, res => {
      resolve({ url, status: res.statusCode, ok: res.statusCode < 400 })
    })
    req.on('error', err => resolve({ url, status: 0, ok: false, error: err.message }))
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }) })
    req.end()
  })
}

async function main() {
  console.log(`\nChecking ${urls.size} image URLs...\n`)

  const results = await Promise.all([...urls].map(checkUrl))
  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)

  console.log('✅ PASSING:')
  for (const r of passed) {
    const id = r.url.match(/photo-[a-zA-Z0-9_-]+/)?.[0] ?? r.url
    console.log(`   ${r.status}  ${id}`)
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILING:')
    for (const r of failed) {
      const id = r.url.match(/photo-[a-zA-Z0-9_-]+/)?.[0] ?? r.url
      console.log(`   ${r.status}  ${id}  ${r.error ?? ''}`)
    }
    console.log(`\nResult: ${passed.length}/${results.length} images OK — ${failed.length} broken\n`)
    process.exit(1)
  } else {
    console.log(`\nResult: All ${results.length} images OK ✅\n`)
  }
}

main()
