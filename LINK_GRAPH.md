# Link Graph & Crawlability Audit

## All Crawlable URLs

### Root Pages
- `/` (index.html) - Landing page with links to all sections
- `/about.html` - About & Leadership page
- `/contact.html` - Contact form page
- `/resources.html` - Resources page

### Institutional Pages
- `/institutional/index.html` - Institutional homepage
- `/institutional/product.html` - Institutional strategy page
- `/institutional/simulator.html` - Institutional portfolio simulator

### Retail Pages
- `/retail/index.html` - Retail homepage
- `/retail/product.html` - Retail strategy page
- `/retail/simulator.html` - Retail portfolio simulator

## Link Graph (Where Each Page is Linked From)

### `/` (index.html)
**Linked from:**
- All pages (via logo/home link in header)
- All pages (via footer "Home" link)

**Links to:**
- `/institutional/index.html`
- `/retail/index.html`
- `/about.html`
- `/institutional/product.html`
- `/institutional/simulator.html`
- `/resources.html`
- `/contact.html`

### `/about.html`
**Linked from:**
- All pages (via header "About" link)
- All pages (via footer "About" link)
- `/` (landing page)
- `/retail/index.html` (CTA card)

**Links to:**
- `/` (logo)
- `/about.html` (self)
- `/institutional/product.html` (strategy dropdown)
- `/institutional/simulator.html`
- `/resources.html`
- `/contact.html`

### `/contact.html`
**Linked from:**
- All pages (via header "Contact" link)
- All pages (via footer "Contact" link)
- All pages (via header CTA button)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/institutional/product.html` (strategy dropdown)
- `/institutional/simulator.html`
- `/resources.html`
- `/contact.html` (self)

### `/resources.html`
**Linked from:**
- All pages (via header "Resources" link)
- All pages (via footer "Resources" link)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/institutional/product.html` (strategy dropdown)
- `/institutional/simulator.html`
- `/resources.html` (self)
- `/contact.html`

### `/institutional/index.html`
**Linked from:**
- `/` (landing page)
- All institutional pages (via logo)

**Links to:**
- `/` (logo)
- `/about.html`
- `/institutional/product.html` (strategy + dropdown)
- `/institutional/simulator.html`
- `/resources.html`
- `/contact.html`
- `/institutional/product.html` (hero CTA)
- `/institutional/simulator.html` (hero CTA)
- `/institutional/simulator.html#bond-sleeve` (use case card)
- `/institutional/simulator.html#equity-carveout` (use case card)
- `/institutional/simulator.html#alt-credit` (use case card)

### `/institutional/product.html`
**Linked from:**
- All pages (via header "Strategy" link)
- `/institutional/index.html` (hero CTA, use case cards)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/institutional/product.html` (self + hash anchors)
- `/institutional/simulator.html`
- `/resources.html`
- `/contact.html`

### `/institutional/simulator.html`
**Linked from:**
- All pages (via header "Portfolio Simulator" link)
- `/institutional/index.html` (hero CTA, use case cards)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/institutional/product.html` (strategy dropdown)
- `/institutional/simulator.html` (self)
- `/resources.html`
- `/contact.html`

### `/retail/index.html`
**Linked from:**
- `/` (landing page)
- All retail pages (via logo)

**Links to:**
- `/` (logo)
- `/about.html`
- `/retail/product.html` (strategy + dropdown)
- `/retail/simulator.html`
- `/resources.html`
- `/contact.html`
- `/retail/product.html` (hero CTA)
- `/retail/simulator.html` (hero CTA)
- `/about.html` (CTA card)
- `/retail/simulator.html` (CTA card)
- `/retail/product.html` (CTA card)

### `/retail/product.html`
**Linked from:**
- All pages (via header "Strategy" link when in retail mode)
- `/retail/index.html` (hero CTA, CTA card)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/retail/product.html` (self + hash anchors)
- `/retail/simulator.html`
- `/resources.html`
- `/contact.html`

### `/retail/simulator.html`
**Linked from:**
- All pages (via header "Portfolio Simulator" link when in retail mode)
- `/retail/index.html` (hero CTA, CTA card)
- `/` (landing page)

**Links to:**
- `/` (logo)
- `/about.html`
- `/retail/product.html` (strategy dropdown)
- `/retail/simulator.html` (self)
- `/resources.html`
- `/contact.html`

## Orphaned Pages
**None** - All pages are linked from at least one other page via static HTML links.

## Crawlability Status

### ✅ Fixed Issues
1. **Root index.html no longer auto-redirects** - Now serves as a proper landing page with static links
2. **All `href="#"` replaced** - All navigation links now use proper root-relative paths
3. **Consistent linking strategy** - All pages use root-relative links (starting with `/`)
4. **Sitewide footer navigation** - All pages now have footer links to main pages
5. **Investor-type toggle fixed** - No longer creates broken paths when switching modes

### ✅ Verified
- CSS/JS assets load correctly from all page locations:
  - Root pages: `styles.css`, `js/investor-type.js`
  - Subdirectory pages: `../styles.css`, `../js/investor-type.js`
- All navigation links use root-relative paths
- Footer navigation present on all pages
- No meta robots tags blocking crawlers
- No canonical tags pointing incorrectly

### Remaining Considerations
1. **JavaScript-enhanced links** - Some pages still have JavaScript that updates links based on investor type, but all links have proper static fallbacks
2. **Hash anchors** - Dropdown links use hash anchors (e.g., `#instruments-mechanics`) which are crawlable but may need JavaScript to scroll
3. **Investor type toggle** - Currently disabled (RETAIL_ENABLED = false), but when enabled, it now correctly maps equivalent pages

## Testing Recommendations

1. **Test with Screaming Frog:**
   - Start crawl from `https://www.firstprincipleam.com/`
   - Verify all 10 pages are discovered
   - Check that no pages return 404 errors
   - Verify CSS/JS assets load correctly

2. **Test navigation:**
   - Navigate between `/institutional/` and `/retail/` pages
   - Verify links work correctly from all page locations
   - Test hash anchor links in dropdowns

3. **Test investor toggle (if re-enabled):**
   - Verify toggle doesn't create broken paths
   - Test switching from `/institutional/product.html` to `/retail/product.html`
   - Test fallback when equivalent page doesn't exist
