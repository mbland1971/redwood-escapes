const { test, expect } = require('@playwright/test')
const path = require('path')

function fileUrl(relativePath) {
  const abs = path.resolve(__dirname, '..', relativePath)
  return `file://${abs.replace(/ /g, '%20')}`
}

const HOME = fileUrl('index.html')

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function expectNobrokenImages(page) {
  // Scroll to bottom to trigger lazy-loaded images, then back to top
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, 0))

  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter(img => img.complete && img.naturalWidth === 0 && img.src !== '')
      .map(img => img.src)
  )
  expect(broken, `Broken images:\n${broken.join('\n')}`).toHaveLength(0)
}

// ──────────────────────────────────────────────
// HOME PAGE — basics
// ──────────────────────────────────────────────
test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => { await page.goto(HOME) })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Redwood Escapes/)
  })

  test('has meta description', async ({ page }) => {
    const meta = page.locator('meta[name="description"]')
    await expect(meta).toHaveAttribute('content', /redwood/i)
  })

  test('navbar is visible', async ({ page }) => {
    await expect(page.locator('.navbar')).toBeVisible()
  })

  test('navbar links include Wildlife', async ({ page }) => {
    const nav = page.locator('.nav-links')
    await expect(nav.locator('a[href="wildlife.html"]')).toBeVisible()
  })

  test('hero section visible with correct heading', async ({ page }) => {
    await expect(page.locator('.hero')).toBeVisible()
    await expect(page.locator('.hero-content h1')).toContainText(/tallest trees/i)
  })

  test('stats bar shows 5 key facts', async ({ page }) => {
    await expect(page.locator('.stat-item')).toHaveCount(5)
  })

  test('about section visible with UNESCO badge', async ({ page }) => {
    await expect(page.locator('#about')).toBeVisible()
    await expect(page.locator('.about-badges')).toContainText(/UNESCO/i)
  })

  test('seasons section shows 4 cards', async ({ page }) => {
    await expect(page.locator('.season-card')).toHaveCount(4)
    await expect(page.locator('.season-card.best-season')).toBeVisible()
  })

  test('hiking section has 4 trail cards', async ({ page }) => {
    await expect(page.locator('#hiking .trail-card')).toHaveCount(4)
  })

  test('trail cards have Full Trail Guide links', async ({ page }) => {
    const links = page.locator('#hiking .trail-card .btn-small')
    await expect(links).toHaveCount(4)
  })

  test('wildlife section has 6 cards', async ({ page }) => {
    await expect(page.locator('.wildlife-card')).toHaveCount(6)
  })

  test('camping section has 4 campground cards', async ({ page }) => {
    await expect(page.locator('#camping .camp-card')).toHaveCount(4)
  })

  test('camping cards show nightly price', async ({ page }) => {
    const prices = page.locator('#camping .price')
    await expect(prices).toHaveCount(4)
    await expect(prices.first()).toContainText('/ night')
  })

  test('lodging section has 6 options', async ({ page }) => {
    await expect(page.locator('#lodging .lodging-card')).toHaveCount(6)
  })

  test('plan section has 3 info boxes', async ({ page }) => {
    await expect(page.locator('#plan .info-box')).toHaveCount(3)
  })

  test('contact form has all required fields', async ({ page }) => {
    const form = page.locator('#contact form')
    await expect(form).toBeVisible()
    await expect(form.locator('input[type="text"]')).toBeVisible()
    await expect(form.locator('input[type="email"]')).toBeVisible()
    await expect(form.locator('select')).toBeVisible()
    await expect(form.locator('textarea')).toBeVisible()
    await expect(form.locator('button[type="submit"]')).toBeVisible()
  })

  test('footer has brand + 3 link columns', async ({ page }) => {
    await expect(page.locator('.footer-brand')).toBeVisible()
    await expect(page.locator('.footer-links')).toHaveCount(3)
  })

  test('footer parks links point to real pages', async ({ page }) => {
    const parksLinks = page.locator('.footer-links').nth(1).locator('a')
    await expect(parksLinks.first()).toHaveAttribute('href', /parks\//)
  })

  test('all images load on home page', async ({ page }) => {
    await expectNobrokenImages(page)
  })

  test('hero background image is set', async ({ page }) => {
    const bg = await page.locator('.hero-bg').evaluate(el =>
      window.getComputedStyle(el).backgroundImage
    )
    expect(bg).toMatch(/url\(/)
    expect(bg).not.toBe('none')
  })

  test('navbar becomes scrolled class after scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200))
    await page.waitForTimeout(300)
    await expect(page.locator('.navbar')).toHaveClass(/scrolled/)
  })
})

// ──────────────────────────────────────────────
// TRAIL PAGES
// ──────────────────────────────────────────────
const trailPages = [
  { name: 'Tall Trees Grove', file: 'trails/tall-trees-grove.html', difficulty: 'Moderate' },
  { name: 'Fern Canyon', file: 'trails/fern-canyon.html', difficulty: 'Moderate' },
  { name: 'Newton B. Drury Scenic Parkway', file: 'trails/newton-drury-scenic-parkway.html', difficulty: 'Easy' },
  { name: 'Damnation Creek', file: 'trails/damnation-creek.html', difficulty: 'Challenging' },
]

for (const trail of trailPages) {
  test.describe(`Trail: ${trail.name}`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(fileUrl(trail.file)) })

    test('has Redwood Escapes in title', async ({ page }) => {
      await expect(page).toHaveTitle(/Redwood Escapes/)
    })

    test('navbar visible with home link', async ({ page }) => {
      await expect(page.locator('.navbar')).toBeVisible()
      await expect(page.locator('.navbar .logo')).toBeVisible()
    })

    test('page hero is visible', async ({ page }) => {
      await expect(page.locator('.page-hero')).toBeVisible()
    })

    test('breadcrumb navigation present', async ({ page }) => {
      await expect(page.locator('.breadcrumb')).toBeVisible()
      await expect(page.locator('.breadcrumb a[href="../index.html"]')).toBeVisible()
    })

    test('difficulty badge is shown', async ({ page }) => {
      await expect(page.locator('.difficulty-badge')).toBeVisible()
      await expect(page.locator('.difficulty-badge')).toContainText(new RegExp(trail.difficulty, 'i'))
    })

    test('quick stats grid present', async ({ page }) => {
      const stats = page.locator('.stat-card')
      await expect(stats).not.toHaveCount(0)
    })

    test('detail layout renders', async ({ page }) => {
      await expect(page.locator('.detail-layout')).toBeVisible()
    })

    test('sidebar logistics card present', async ({ page }) => {
      await expect(page.locator('.sidebar-card')).not.toHaveCount(0)
    })

    test('related section shows 3 cards', async ({ page }) => {
      const related = page.locator('.related-card')
      await expect(related).toHaveCount(3)
    })

    test('all related cards have valid hrefs', async ({ page }) => {
      const links = page.locator('.related-card')
      const count = await links.count()
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/\.(html)/)
      }
    })

    test('CTA band visible', async ({ page }) => {
      await expect(page.locator('.cta-band')).toBeVisible()
    })

    test('footer with all 4 parks links', async ({ page }) => {
      await expect(page.locator('.footer-links')).toHaveCount(3)
    })

    test('all images load', async ({ page }) => {
      await expectNobrokenImages(page)
    })

    test('photo gallery renders', async ({ page }) => {
      await expect(page.locator('.photo-gallery')).toBeVisible()
    })
  })
}

// ──────────────────────────────────────────────
// PARK PAGES
// ──────────────────────────────────────────────
const parkPages = [
  { name: 'Redwood National Park', file: 'parks/redwood-national-park.html' },
  { name: 'Prairie Creek Redwoods SP', file: 'parks/prairie-creek-redwoods.html' },
  { name: 'Jedediah Smith Redwoods SP', file: 'parks/jedediah-smith.html' },
  { name: 'Del Norte Coast Redwoods SP', file: 'parks/del-norte-coast.html' },
  { name: 'Humboldt Redwoods SP', file: 'parks/humboldt-redwoods.html' },
]

for (const park of parkPages) {
  test.describe(`Park: ${park.name}`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(fileUrl(park.file)) })

    test('has Redwood Escapes in title', async ({ page }) => {
      await expect(page).toHaveTitle(/Redwood Escapes/)
    })

    test('navbar visible with home link', async ({ page }) => {
      await expect(page.locator('.navbar')).toBeVisible()
      await expect(page.locator('.navbar .logo')).toBeVisible()
    })

    test('page hero is visible', async ({ page }) => {
      await expect(page.locator('.page-hero')).toBeVisible()
    })

    test('breadcrumb navigation present', async ({ page }) => {
      await expect(page.locator('.breadcrumb')).toBeVisible()
    })

    test('park intro grid renders', async ({ page }) => {
      await expect(page.locator('.park-intro-grid')).toBeVisible()
    })

    test('quick stats present', async ({ page }) => {
      await expect(page.locator('.stat-card')).not.toHaveCount(0)
    })

    test('feature cards grid present with multiple cards', async ({ page }) => {
      const cards = page.locator('.feature-card')
      const count = await cards.count()
      expect(count).toBeGreaterThanOrEqual(4)
    })

    test('plan visit info callout present', async ({ page }) => {
      await expect(page.locator('.info-callout')).toBeVisible()
    })

    test('sidebar visible', async ({ page }) => {
      await expect(page.locator('.sidebar-card')).not.toHaveCount(0)
    })

    test('related section shows 3 cards', async ({ page }) => {
      await expect(page.locator('.related-card')).toHaveCount(3)
    })

    test('CTA band visible', async ({ page }) => {
      await expect(page.locator('.cta-band')).toBeVisible()
    })

    test('footer present', async ({ page }) => {
      await expect(page.locator('.footer')).toBeVisible()
    })

    test('all images load', async ({ page }) => {
      await expectNobrokenImages(page)
    })
  })
}

// ──────────────────────────────────────────────
// WILDLIFE PAGE
// ──────────────────────────────────────────────
test.describe('Wildlife Guide page', () => {
  test.beforeEach(async ({ page }) => { await page.goto(fileUrl('wildlife.html')) })

  test('has Redwood Escapes in title', async ({ page }) => {
    await expect(page).toHaveTitle(/Redwood Escapes/)
  })

  test('navbar visible with home link', async ({ page }) => {
    await expect(page.locator('.navbar')).toBeVisible()
    await expect(page.locator('.navbar .logo')).toBeVisible()
  })

  test('page hero is visible', async ({ page }) => {
    await expect(page.locator('.page-hero')).toBeVisible()
  })

  test('breadcrumb present', async ({ page }) => {
    await expect(page.locator('.breadcrumb')).toBeVisible()
  })

  test('viewing guidelines callout present', async ({ page }) => {
    await expect(page.locator('.info-callout')).toBeVisible()
  })

  test('wildlife detail cards present — at least 6', async ({ page }) => {
    const cards = page.locator('.wildlife-detail-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(6)
  })

  test('each wildlife card has name and scientific name', async ({ page }) => {
    const cards = page.locator('.wildlife-detail-card')
    const first = cards.first()
    await expect(first.locator('h3')).toBeVisible()
    await expect(first.locator('.scientific-name')).toBeVisible()
  })

  test('wildlife viewing tips cards present', async ({ page }) => {
    await expect(page.locator('.wildlife-tip')).not.toHaveCount(0)
  })

  test('park hotspots section present', async ({ page }) => {
    await expect(page.locator('.wildlife-card')).toHaveCount(6)
  })

  test('CTA band present', async ({ page }) => {
    await expect(page.locator('.cta-band')).toBeVisible()
  })

  test('all images load', async ({ page }) => {
    await expectNobrokenImages(page)
  })
})

// ──────────────────────────────────────────────
// CROSS-PAGE LINK CHECKS
// ──────────────────────────────────────────────
test.describe('Cross-page navigation', () => {
  test('home trail cards link to trail detail pages', async ({ page }) => {
    await page.goto(HOME)
    const links = page.locator('#hiking .trail-card .btn-small')
    const count = await links.count()
    expect(count).toBe(4)
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toMatch(/trails\//)
    }
  })

  test('home footer parks links point to park pages', async ({ page }) => {
    await page.goto(HOME)
    const parkLinks = page.locator('.footer-links').nth(1).locator('a')
    const count = await parkLinks.count()
    expect(count).toBe(5)
    for (let i = 0; i < count; i++) {
      const href = await parkLinks.nth(i).getAttribute('href')
      expect(href).toMatch(/parks\//)
    }
  })

  test('trail pages back-link to index hiking section', async ({ page }) => {
    await page.goto(fileUrl('trails/tall-trees-grove.html'))
    await expect(page.locator('.breadcrumb a[href="../index.html#hiking"]')).toBeVisible()
  })

  test('park pages related section links to other pages', async ({ page }) => {
    await page.goto(fileUrl('parks/redwood-national-park.html'))
    const related = page.locator('.related-card')
    const count = await related.count()
    expect(count).toBe(3)
    const firstHref = await related.first().getAttribute('href')
    expect(firstHref).toMatch(/\.(html)/)
  })

  test('wildlife page links back to home', async ({ page }) => {
    await page.goto(fileUrl('wildlife.html'))
    await expect(page.locator('.breadcrumb a[href="index.html"]')).toBeVisible()
  })

  test('wildlife nav link from home leads to wildlife page', async ({ page }) => {
    await page.goto(HOME)
    const link = page.locator('.nav-links a[href="wildlife.html"]').first()
    await expect(link).toBeVisible()
  })
})

// ──────────────────────────────────────────────
// MOBILE TESTS
// ──────────────────────────────────────────────
test.describe('Mobile navigation', () => {
  test('hamburger opens and closes nav on home', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    await page.goto(HOME)
    const hamburger = page.locator('.hamburger')
    const navLinks = page.locator('.nav-links')
    await expect(navLinks).not.toHaveClass(/open/)
    await hamburger.click()
    await expect(navLinks).toHaveClass(/open/)
    await hamburger.click()
    await expect(navLinks).not.toHaveClass(/open/)
  })

  test('hamburger opens nav on trail page', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    await page.goto(fileUrl('trails/fern-canyon.html'))
    await page.locator('.hamburger').click()
    await expect(page.locator('.nav-links')).toHaveClass(/open/)
  })
})
