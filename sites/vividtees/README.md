# Vivid Apparel N Custom Engraving — original-theme website package

## Open the website

1. Extract this ZIP completely.
2. Open **index.html** in your browser.
3. Keep the `assets` folder beside the HTML files.

No installation or build command is needed. The pages, images, gallery, search, quote builder, and custom mouse work from the extracted folder. You can also upload this folder to a static web host.

## Original Vivid theme

The design preserves the original site’s dark plum/black surfaces, bright pink accents, pink-to-purple gradient buttons, rounded imagery and panels, and original branded artwork. The improved multipage structure and interactive features are retained.

## Pages

- `index.html` — home and service overview
- `apparel.html` — custom apparel
- `engraving.html` — laser engraving and personalized gifts
- `promotional.html` — branded merchandise and event products
- `gallery.html` — all 27 images, categories, search, and full-size viewing
- `about.html` — company information
- `contact.html` — contact details and three-step project enquiry builder
- `social.html` — Facebook page, video, photo, and post embeds with direct links

## Interactive features

- Compact 18px outline cursor that shrinks to a 9px solid dot over clickable items, and 6px while pressed. The cursor switches contrast on flat surfaces and inverts rendered colors over photos and gradients. Text inputs retain the native text cursor; touch, forced-color, and reduced-motion modes keep normal system cursors. A footer control turns the custom cursor off.
- Flowing purple/pink liquid-gradient background with subtle pointer ripples and a black overlay. Native WebGL is used with a static CSS fallback, a resolution cap, and a 30fps limit. Animation pauses in hidden tabs and becomes still for reduced-motion preferences.
- Self-hosted tall Oswald headings and Space Grotesk body/UI fonts, included in the ZIP for offline use. Font licenses are in `assets/fonts/`.
- Responsive navigation, reading progress, and back-to-top control.
- Taller, larger Oswald typography with readable body copy, a glowing SVG crown in the top-left brand, and expanded mobile sizing.
- Sticky in-page chapter navigation, spring-like card pop-ins with staggered entrances and a brief neon glow, a sticky guided process section with progress highlighting, gentle desktop hero parallax, and liquid movement influenced by scrolling. Cards re-arm after moving well outside the viewport, so they pop in again when revisited. New gallery cards are observed automatically, and keyboard focus reveals cards immediately. Desktop hover adds lift and a brighter glow. Native scrolling is preserved and reduced-motion preferences are respected.
- Phone-friendly horizontal chapter links, stacked service cards, at least 16px form inputs, larger touch controls, and a mobile quick-action bar that hides while entering form details.
- Gallery category filters, text search, and “Show more” pagination.
- Image viewer with previous/next controls, arrow-key navigation, Escape to close, original-image access, and project inspiration carried into the enquiry page.
- Quote builder with field validation, a review step, “Copy enquiry,” and “Open email draft.”
- Expandable frequently asked questions.
- Facebook embeds that load only after the visitor clicks, with direct Facebook links always available.

## What needs internet or another app?

Facebook embeds and Facebook links need internet access. Facebook controls whether individual posts can be embedded and may require sign-in or show an unavailable message. If an embed is blocked, use “Open on Facebook.”

“Open email draft” uses the visitor’s configured email app. The visitor reviews and sends the message there. The website does not send forms, take payments, accept orders, or store enquiry details on a server. If no mail app opens, use “Copy enquiry” and paste it into an email to vividteesllc@gmail.com.

## Images and content

All 27 supplied JPG images are included, unchanged, in `assets/originals/`. Web-optimized copies and gallery thumbnails are in `assets/images/`. The gallery includes every supplied image. Brand artwork is labeled separately from project photography.

Content is based on the pages extracted from https://www.shopvividcustoms.com/ on October 19, 2026: home, apparel, engraving, promotional products, gallery, about, and contact. An extracted text reference is included in `reference/original-site-content.txt`.

The original site links to one gallery image (`slingshot_background_person_removed.jpg`) that returns HTML instead of image data. That broken reference was not used. The supplied working promotional Slingshot image is included.

The old site's verified email, phone number, service area, and service descriptions have been retained. No street address, product prices, delivery promises, or testimonials have been invented.

## Editing

- Base layout and interactive component styling: `assets/style.css`
- Custom fonts, compact adaptive cursor, and background layering: `assets/experience.css`
- Liquid background shader, motion, and pointer response: `assets/liquid.js`
- Tall typography, expanded mobile layout, and scroll styling: `assets/scroll.css`
- Chapter navigation, reveals, parallax, and mobile quick actions: `assets/scroll.js`
- Glowing crown artwork: `assets/neon-crown.svg`
- Original-theme palette, gradients, rounded surfaces, responsive adjustments, and cursor appearance: `assets/theme.css`
- Shared interactive behavior: `assets/site.js`
- Gallery titles, descriptions, categories, and image filenames: `assets/data.js`
- Page copy and navigation: the individual HTML files
- Browser tab icon: `assets/favicon.svg`

This is a portable set of static HTML pages, not a framework project. Header and footer markup are present in every page for dependable local-file use; update them consistently when editing.

## Verification

JavaScript syntax, local page and image references, anchor targets, duplicate HTML IDs, the complete 27-image inventory, byte-for-byte original-image preservation, mobile hero text fit at 320/360/390/430px using the packaged font metrics, and ZIP integrity were checked. The liquid shader was compiled, linked, and rendered with native EGL, and differing animation frames were verified. Full browser rendering and third-party Facebook playback were not available for verification in this environment. Test the final package on your intended desktop/mobile browsers and hosting before using it as the business's public site.
