# K-SSAMbap website

A static three-page restaurant website inspired by the overall dark, typography-forward layout of the provided Steadyhandsop template. All copy, photos, and menu data concern K-SSAMbap only.

## Preview
Open `index.html` in a browser, or run `python -m http.server 8000` here and visit `http://localhost:8000`. Works as a static site on GitHub Pages, Cloudflare Pages, or Netlify.

## Pages
- `index.html`: hero, Korean food sections, photo teasers, visit / map directions.
- `menu.html`: search and category filters for 32 items transcribed from supplied menu boards.
- `gallery.html`: 20 photos with filters and accessible dialog.

## IMPORTANT: owner sign-off before deployment
- Confirm current business hours and telephone number: neither is published on the site as verified.
- Confirm menu names and prices with owner; photographic prices are labeled as historical and not guaranteed current.
- Confirm permission to publish uploaded photographs. Original photo names are retained in `assets/images/`.
- Confirm any business social profiles or ordering/reservation system before linking them. No links invented.
- Banchan sign photo advertises $12.99 + tax; additional ssam $3 and drinks $3 appear on boards, but may have changed.
- Address sourced from prior research: 3909 W Sahara Ave, Suite 1, Las Vegas NV 89102.

## Source materials
`menu-data.js` is generated from the previously prepared K-SSAMbap photo-board CSV. Image mapping uses category / descriptive photography, not guarantees a photo matches an individual dish. Visual design adopts the reference's dark styling, display typography, menu/gallery/visit information architecture, not its business copy, logo, products, images, contact information or code.


## Complete photo library integration

The new `assets/photo-library/` holds 85 unique photographs extracted from the supplied menu-photo ZIP, preserving its menu-item and content-based organization. Exact-byte duplicates removed: 0.

`gallery.html` presents all 85 images with category filters and a lightbox. `menu.html` displays matching individual food photographs adjacent to dishes when the supplied library suggests a match. These dish-photo associations are **unconfirmed**, not validated labels.

`photo-index.csv` and `menu-photo-coverage.csv` document the source classifications. The source library includes a mixture of menu-board photos and suspected food matches. Confirm ownership/usage rights and dish labels before launch.

Website entry point: `index.html`. Open that file locally or publish the complete folder on a static host. Do not upload individual HTML files without assets and scripts.


## Video update
Eight supplied Yelp-named customer clips are included at `assets/videos/`, transcoded to H.264 MP4 without audio for reliable muted autoplay. Original clips are not included in the website export. The homepage has a muted looping hero, another muted looping background segment, and six player cards; `gallery.html` includes all eight clips on-demand. Users can pause or play the gallery clips. Browsers and accessibility preferences may prevent autoplay, in which case poster images display. Confirm video usage rights before publication.


## Latest visual updates
- Background: `assets/images/white-texture-background.png` (user supplied). CSS `background-size: 100% auto` scales to viewport width; `background-repeat: repeat-y` repeats vertically.
- Header brand: plain red Hangul text `케이쌈밥` replacing the earlier English/icon logo. This spelling is a Korean transliteration of K-SSAMbap; confirm the restaurant's preferred Hangul spelling before launch.
- The dark video hero and video feature keep overlays for contrast; other sections use the white texture and dark typography.


## Latest interactive update
- Visit-section location photo replaced by Google Maps embedded map. Map needs network access.
- Google Translate language popup after HOME: English, Korean, Spanish, and ten additional languages. Translation needs internet access; Google controls availability and banner appearance, which can vary by browser. A dynamic toolbar clearance avoids overlap where an iframe appears.
- Video backdrops on homepage, menu and gallery; there is no separate Videos page.
- Intersection Observer scroll-in animations on food/menu/gallery cards.
- White outline custom cursor on desktop pointer devices; shrinks to solid dot on interactive items. Difference blending makes it contrast on light/dark surfaces.
- Supports reduced-motion preferences.

Note: Google Translate sometimes shows no top banner depending on browser and Google widget changes.

## Latest enhancements
- Header Reviews link and homepage reviews discovery section; no fictional star ratings or testimonial quotes.
- Black bilingual menu cards with suggested Korean translations. Owner should confirm all Korean item names.
- No Videos navigation tab; videos are embedded throughout the site.
- Icons from Lucide free online CDN; requires connection.
- Location map and tighter Visit spacing.
- Korean wordmark `케이쌈밥` is a transliteration and needs owner approval.


## Latest appearance adjustments
- The dark charcoal/black theme dominates all pages; supplied white texture remains in page gutters and small exposed regions, scaled to page width and repeating vertically.
- Translate is the first item in navigation, immediately left of Home.
- Header displays Korean (케이쌈밥) then K-SSAMbap in English on a second line. This Korean rendering should be owner-confirmed.


## Charcoal paper background
The original white paper texture has been recolored to charcoal gray while preserving its grain. It remains scaled to the viewport width and repeats vertically.


## Oct 2026 motion upgrade
The red marquee now moves endlessly right-to-left (keeps moving on hover and respects reduced motion). The page uses expanded scroll entrance animations and inline open-source-style Lucide arrow SVGs (Lucide ISC license), so arrows do not depend on external services.
