# El Jefe de Jalisco — complete two-page website

## Open and upload

1. Extract the entire ZIP.
2. Open index.html for the homepage, or menu.html for the full menu.
3. Upload ALL extracted files and folders to your web host. Keep index.html and menu.html together at the root. Generated icons and metadata are included, so no build is required for initial upload. For future changes, use the build or watch commands below.

## Included

- index.html — homepage with a Menu preview, Food reference photos, embedded Feed, socials, location, contact and ordering section
- menu.html — all 29 photographed dishes, seven categories plus ALL, search, and alternate-photo dialogs
- css.css — shared black/red theme, stone background, responsive layout, white outlined custom cursor
- js.js — guarded page-specific initialization, menu filtering, search, dialogs, navigation and ordering entries
- motion.js — ticker, independent scroll effects, slow background movement, custom cursor and local icon rendering
- content.js — editable restaurant menu data, prices, photo paths and ordering URLs
- assets/images/menu/ — all 67 supplied image files, unchanged
- assets/images/ — original logo, supplied stone background, generated logo icons and social preview
- assets/icons/ — downloaded free Lucide and Bootstrap SVG icons, with original licenses
- assets/videos/ — reserved for future local MP4 files
- photo-notes/ — source archive's organization, photo selection and filename mapping notes

## Homepage media

The homepage leads with the supplied TikTok feature. The Feed section plays the three supplied Facebook clips as local MP4s with native browser controls, inline mobile playback, and stills extracted from those exact clips. These MP4s were recovered from the public media URLs supplied by Facebook's player. Original canonical Facebook post links remain under each clip. No expiring social CDN URLs are embedded in the website.

The old Facebook share URLs resolved to canonical posts but Facebook's embedded player returned “Video unavailable,” even with those canonical URLs. Hosting the actual clips avoids that failing player. Files are in `assets/videos/` and the build copies them into `dist/assets/videos/`.

TikTok still uses its documented embed player. Its public post resolved, but its media download returned HTTP 403 and no public download URL was supplied. The website handles TikTok's documented player error messages and keeps the original watch link available. Supply the original TikTok MP4 to replace that final external embed with native playback; playback of that feature has not been verified here.

The homepage Menu section includes three white-background professional front photos (quesabirria, street tacos, loaded nachos), a prominent VIEW THE FULL MENU button, and linked cards leading to menu.html. Main navigation scrolls to the Menu preview.

The separate Food section uses six alternate/reference images showing food in real settings: street tacos, quesabirria, loaded fries, sopes, consommé, and a breakfast burrito. White-background product photos appear in the Menu preview and full menu, while the Food section uses only the selected reference photos. Every preview and Food photo links to menu.html. The Feed section contains native video players with stills from the actual clips. Homepage section order is Menu, Food, Feed.

## Full menu

menu.html includes all 29 item cards directly in its HTML. If JavaScript is unavailable, the full menu remains visible and each item links to its photo. With JavaScript enabled, search, keyboard-accessible category tabs, and item dialogs work. Item dialogs include all alternate/reference views for that product. Press Escape or use the close button to close a dialog.

Search applies within the selected category. Choose ALL to search the full menu. Press / to focus search. No-match results include a reset button.

The old initialization bug is fixed: scripts no longer attempt to fill removed photo containers or initialize sections absent from the current page.

## Edit menu names and prices

Names currently follow the supplied descriptive photo index; confirm official product names and uncertain drink flavors before public launch. No prices have been invented. Change name, description, price, image, or photos for an existing item in content.js. Script enhancement updates existing menu cards from those records. Example: price: "$12.00".

If adding/removing/reordering products, update the static cards and matching data-product-index / data-product attributes in menu.html as well as content.js so the fallback page and detail data stay aligned. Current indices match the flattened category/item order.

## Ordering and reviews

Paste VERIFIED restaurant Square, DoorDash and Uber Eats checkout URLs into the ordering array in content.js. Empty entries remain visibly pending. The telephone button works with the supplied (901) 347-7406. This static site does not accept or process payments.

Google and Yelp links currently open business/location searches, not verified review profiles. Replace those links in index.html with the restaurant's exact review profile URLs once supplied. Ratings and testimonials have not been invented.

User-supplied Instagram and Facebook references are preserved. The TikTok link is labeled as a @yourmemphisbestie feature rather than the restaurant's own account. Verify social profile ownership before public launch.

## Background, scroll and cursor

Both pages use the exact supplied stone texture. Four alternating reflected panels extend it vertically with matching edges. It moves at 12% of scroll distance, while individual headings, cards and other pieces receive independent reveal and parallax motion. The red ticker loops continuously on the homepage.

Desktop pointer: 32px empty white ring, contracting to a 12px solid white circle on interactive elements, and smaller while pressed. Dialogs have their own cursor overlay. Native video/iframe controls keep their normal pointer behavior. Touch devices retain ordinary interaction. Keyboard navigation restores the native cursor. Reduced-motion preferences disable background, ticker and content movement.

The stone source is 640 × 359 pixels, not native 4K. The browser theme color and fallback background are black.

## Business details from supplied screenshots

Taqueria y Birrieria El Jefe de Jalisco
1308 Getwell Rd, Memphis, TN 38111
(901) 347-7406
Tuesday–Sunday: 9 AM–9:30 PM; Monday closed.

Confirm current hours before launch. Private lead-management screenshots are not included in website assets.

## Icon credits

Lucide: https://github.com/lucide-icons/lucide — ISC and included upstream notices.
Bootstrap Icons: https://github.com/twbs/icons — MIT.
Original license files are in assets/icons/. SVGs are bundled locally, so icons work without a CDN.

## Verification

Both pages were initialized in a DOM test environment. Menu item count, search, category filtering, no-results reset, item dialogs, alternate-photo selection and dialog closing passed. Page initialization, shared motion initialization, local assets, internal links, and ZIP integrity were checked. Visual browser testing and successful playback of third-party social embeds could not be verified in this environment.


## Search metadata, app icons, and future updates

HOME is now the first link in both headers, with a current-page indicator on the homepage. Each page has a unique title and description, social sharing tags, and static Restaurant structured data using the supplied business details. The menu page now has a proper H1. No review ratings or prices have been invented.

The real logo is cropped from the supplied tall image without changing the original. Generated PNG sizes: 16, 32, 48, 96, 144, 152, 167, 180, 192, 256 and 512 px. favicon.ico contains six resolutions. Apple uses the 180 px touch icon; the other Apple sizes are also included. The web manifest includes 192 and 512 px regular icons and separate maskable icons with extra safe padding. The social card is 1200 × 630 px. Larger outputs are resized from the supplied artwork and cannot add source detail.

### Set the live domain before launch

Set `url` in site.config.json to the final public HTTPS website address, including a subdirectory if used, with no trailing slash. Then build. This enables absolute canonical URLs, social image URLs, WebSite identity, and sitemap.xml, and adds its location to robots.txt. No domain was supplied, so these domain-specific fields are deliberately omitted from this delivery. Social image references remain relative until configured; configure the live address for reliable sharing.

### Automatic regeneration

One-time developer setup: install Python 3 and run `python3 -m pip install -r requirements.txt`.

- `npm run build` (or `python3 tools/prepare.py`) regenerates all icons, the manifest and metadata, refreshes asset version identifiers, and creates a clean `dist/` upload folder.
- `npm run watch` (or `python3 tools/prepare.py --watch`) watches the logo, pages, styles, scripts and configuration and rebuilds when they change. Leave it running while editing.
- Configure your host's build command as `npm run build`, install the Python dependency, and set its published directory to `dist`. This runs regeneration automatically on each deployment.
- For manual hosting, build and upload the CONTENTS of dist/ together after changes. The included root files are also ready to upload as a complete set.

Replace the image at the configured `logo` path to change branding. The `logo_crop` values refer to the original tall image: [left, top, right, bottom]. Set `logo_crop` to null for a new square source, or set a suitable crop for a different image. Edit metadata in tools/prepare.py and business details in both the visible HTML and its structured-data definition. Head sections are generated and are overwritten by builds.

Stable favicon paths follow Google's guidance. App icons and linked styles/scripts use content revisions; the manifest retains a stable app ID. `_headers` requests cache revalidation on compatible static hosts. On other hosts, configure equivalent Cache-Control response headers for HTML, manifest, icons, and assets. There is no offline service worker retaining an old site: home-screen launches load the hosted pages. Updates require rebuilding and publishing the changed files; this ZIP does not independently deploy changes. Google controls recrawling and whether to display the favicon. Installed icon refresh timing is controlled by the browser/OS, and iOS shortcuts may need removing and adding again.

### Mobile changes and verification limits

The header collapses by 900 px to fit the extra Home link. Navigation, category buttons, dialog close buttons and video fallback links have at least 44 px touch targets. Search uses 16 px text to avoid iOS input zoom. Small-screen headings and cards have tighter constraints, dialog height follows the dynamic viewport, and safe-area padding accounts for display cutouts. Escape returns focus to the menu toggle; outside taps and viewport changes close the menu.

This revision was checked for JS syntax, generated image dimensions and ICO frames, manifest references, static metadata, local asset links, deterministic rebuilds, and configured-domain sitemap generation. Browser rendering and physical iOS/Android home-screen installation were not available in this environment; third-party video playback remains dependent on the platforms.

### GitHub Pages asset placement

This site is served directly from `sites/eljefedejalisco/`. Keep the `assets/`
folder alongside `index.html` and `menu.html`; the copy in `dist/assets/` alone
does not serve those pages. The source assets have been restored from the
existing deployment output without changing the supplied photos.

Run `npm run check` to verify local photo/icon references and decode every image.
After `npm run build`, also run `python3 tools/check_assets.py dist` to check the
standalone upload folder.

### Mobile viewport and gestures

The homepage and full menu use a fixed initial/minimum/maximum viewport scale.
Touch devices allow vertical page panning; pinch gesture events and multi-touch
zoom gestures are cancelled. Menu categories and product thumbnails wrap instead
of requiring horizontal scrolling. Page overflow is clipped horizontally, and
flex/grid children can shrink inside the viewport. Keep these changes in
`tools/prepare.py`, `css.css`, and `js.js` when rebuilding.

Browser or operating-system accessibility overrides and gestures inside
cross-origin video players remain controlled by that browser or provider.

### Custom Google translation picker

Both pages have a custom black/red Translate button immediately after Menu in
`.header-controls`. It opens a searchable, keyboard-accessible themed dialog.
English and Español are first; the curated top-ten group continues with Chinese,
Hindi, Arabic, French, Bengali, Portuguese, Russian, and Urdu. All other languages
follow alphabetically. The bundled catalogue uses Google's documented NMT
language codes; live Website Translator options are merged when available.

Google's Website Translator is loaded on first use and applies the selected
language in place when available. If its script or the selected language cannot
load, the same choice opens Google's website translation service for that exact
page. English clears translation cookies and returns to the original page. The
picker and controls are marked notranslate so their labels stay usable.

The Google translation toolbar is kept visible. Its visible iframe height sets
`--google-bar-height`; body padding and the sticky header offset move the site
below it and reset when it closes. Google controls its own translation service,
which may be unavailable in some regions. End-to-end Google service rendering
and physical mobile QA were not available in this environment.

### Popup photo and dish navigation

Left and right arrow keys move through the open dish's photos, then continue to
the next dish's first photo or the previous dish's last photo. Navigation follows
the visible category/search results in menu order and loops at the ends. The
popup also includes matching Previous/Next buttons for touch users and announces
the dish and photo position. Clicking a thumbnail updates the keyboard position.
Escape still closes the popup; focus returns to the currently viewed dish card.

### Homepage dish arrivals

The homepage's three menu-preview cards and six Food photos link to their exact
menu dish and photo using `menu.html?dish=<image-slug>&photo=<zero-based-index>`.
The build regenerates those links from `content.js` and checks that each photo
belongs to a menu record. Generic full-menu links still open the menu normally.

After the menu renders, a dish link opens the selected popup with a brief drop-in
animation. Invalid links leave the normal menu usable, and a manual popup action
cancels any pending automatic opening. Reduced-motion settings skip the animation.

### Header alignment

The header uses a centered 1240px inner row. On desktop, equal-width outer grid
columns keep navigation centered on the page, with the brand on the left and
actions on the right. At 900px and below the brand, Menu, and Translate controls
form one centered group. Translate shows only its icon on mobile and includes
its text label on desktop; an explicit accessible label remains on both.
