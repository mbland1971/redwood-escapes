const { test, expect } = require('@playwright/test')
const path = require('path')

const filePath = path.resolve(__dirname, '../index.html')
const pageUrl = `file://${filePath.replace(/ /g, '%20')}`

test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl)
})

// ──────────────────────────────────────────────
// Page basics
// ──────────────────────────────────────────────
test('has correct page title', async ({ page }) => {
  await expect(page).toHaveTitle(/Redwood Escapes/)
})

test('has meta description', async ({ page }) => {
  const meta = page.locator('meta[name="description"]')
  await expect(meta).toHaveAttribute('content', /redwood/i)
})

// ──────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────
test('navbar is visible', async ({ page }) => {
  await expect(page.locator('.navbar')).toBeVisible()
})

test('navbar contains all expected links', async ({ page }) => {
  const nav = page.locator('.nav-links')
  await expect(nav.locator('a[href="#hiking"]')).toBeVisible()
  await expect(nav.locator('a[href="#camping"]')).toBeVisible()
  await expect(nav.locator('a[href="#lodging"]')).toBeVisible()
  await expect(nav.locator('a[href="#contact"]')).toBeVisible()
})

// ──────────────────────────────────────────────
// Sections exist
// ──────────────────────────────────────────────
test('hero section is visible', async ({ page }) => {
  await expect(page.locator('.hero')).toBeVisible()
  await expect(page.locator('.hero-content h1')).toContainText(/tallest trees/i)
})

test('stats bar shows 5 key facts', async ({ page }) => {
  const items = page.locator('.stat-item')
  await expect(items).toHaveCount(5)
})

test('about section is visible with UNESCO badge', async ({ page }) => {
  await expect(page.locator('#about')).toBeVisible()
  await expect(page.locator('.about-badges')).toContainText(/UNESCO/i)
})

test('seasons section shows 4 season cards', async ({ page }) => {
  const cards = page.locator('.season-card')
  await expect(cards).toHaveCount(4)
  await expect(page.locator('.season-card.best-season')).toBeVisible()
})

test('hiking section has 4 trail cards', async ({ page }) => {
  const cards = page.locator('#hiking .trail-card')
  await expect(cards).toHaveCount(4)
})

test('hiking trail cards have difficulty badges', async ({ page }) => {
  const badges = page.locator('#hiking .trail-badge')
  await expect(badges).toHaveCount(4)
})

test('wildlife section has 6 cards', async ({ page }) => {
  const cards = page.locator('.wildlife-card')
  await expect(cards).toHaveCount(6)
})

test('camping section has 4 campground cards', async ({ page }) => {
  const cards = page.locator('#camping .camp-card')
  await expect(cards).toHaveCount(4)
})

test('camping cards show nightly price', async ({ page }) => {
  const prices = page.locator('#camping .price')
  await expect(prices).toHaveCount(4)
  await expect(prices.first()).toContainText('/ night')
})

test('lodging section has 6 options', async ({ page }) => {
  const cards = page.locator('#lodging .lodging-card')
  await expect(cards).toHaveCount(6)
})

test('lodging badges cover all types', async ({ page }) => {
  const section = page.locator('#lodging')
  await expect(section.locator('.lodging-badge.luxury')).toBeVisible()
  await expect(section.locator('.lodging-badge.eco')).toBeVisible()
  await expect(section.locator('.lodging-badge.budget')).toBeVisible()
  await expect(section.locator('.lodging-badge.glamping')).toBeVisible()
})

test('plan section has 3 info boxes', async ({ page }) => {
  const boxes = page.locator('#plan .info-box')
  await expect(boxes).toHaveCount(3)
})

test('contact section has a form with required fields', async ({ page }) => {
  const form = page.locator('#contact form')
  await expect(form).toBeVisible()
  await expect(form.locator('input[type="text"]')).toBeVisible()
  await expect(form.locator('input[type="email"]')).toBeVisible()
  await expect(form.locator('select')).toBeVisible()
  await expect(form.locator('textarea')).toBeVisible()
  await expect(form.locator('button[type="submit"]')).toBeVisible()
})

test('footer has 4 columns', async ({ page }) => {
  await expect(page.locator('.footer-brand')).toBeVisible()
  const cols = page.locator('.footer-links')
  await expect(cols).toHaveCount(3)
})

test('footer copyright text is present', async ({ page }) => {
  await expect(page.locator('.footer-bottom')).toContainText(/Redwood Escapes/i)
})

// ──────────────────────────────────────────────
// Images
// ──────────────────────────────────────────────
test('all images load successfully (no broken images)', async ({ page }) => {
  // Wait for network idle so images have a chance to load
  await page.waitForLoadState('networkidle')

  const broken = await page.evaluate(() => {
    return Array.from(document.images)
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src)
  })

  expect(broken, `Broken images found:\n${broken.join('\n')}`).toHaveLength(0)
})

test('hero background image is set', async ({ page }) => {
  const bgImage = await page.locator('.hero-bg').evaluate(el =>
    window.getComputedStyle(el).backgroundImage
  )
  expect(bgImage).toMatch(/url\(/)
  expect(bgImage).not.toBe('none')
})

test('about section image has a valid src', async ({ page }) => {
  const img = page.locator('.about-image img')
  await expect(img).toHaveAttribute('src', /unsplash\.com/)
})

// ──────────────────────────────────────────────
// Interactivity
// ──────────────────────────────────────────────
test('navbar becomes scrolled after scrolling down', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, 200))
  await page.waitForTimeout(300)
  await expect(page.locator('.navbar')).toHaveClass(/scrolled/)
})

test('contact form subject dropdown has expected options', async ({ page }) => {
  const options = page.locator('#contact select option')
  await expect(options).toHaveCount(5)
  await expect(options.first()).toContainText(/Trip Planning/i)
})

// ──────────────────────────────────────────────
// Mobile
// ──────────────────────────────────────────────
test('hamburger menu appears on mobile', async ({ page, isMobile }) => {
  if (!isMobile) test.skip()
  await expect(page.locator('.hamburger')).toBeVisible()
})

test('hamburger menu opens and closes nav', async ({ page, isMobile }) => {
  if (!isMobile) test.skip()
  const hamburger = page.locator('.hamburger')
  const navLinks = page.locator('.nav-links')

  await expect(navLinks).not.toHaveClass(/open/)
  await hamburger.click()
  await expect(navLinks).toHaveClass(/open/)
  await hamburger.click()
  await expect(navLinks).not.toHaveClass(/open/)
})
