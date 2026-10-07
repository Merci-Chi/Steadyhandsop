# Steady Hands Website

This build keeps the existing preview, login, reference, billing, example, and plan interactions from `script.js`, while upgrading the visual design to better match the main Steady Hands GitHub site.

## Visual upgrades

- Uses the same GitHub-hosted `background.jpg` and `background2.jpg` artwork as layered page backgrounds.
- Uses the GitHub site's deep navy, muted blue, warm gold, glass-card, and soft-shadow visual direction.
- Uses Bricolage Grotesque + Manrope + Cormorant Garamond to match the stronger typography direction.
- Uses the local logo, wordmarks, hero tagline, and numbered reference images in `images/`.
- Improves hero hierarchy, pricing presentation, mobile navigation, portfolio cards, and dashboard presentation.

## Important note about the backgrounds

The two large background images are referenced from the public GitHub repository so the ZIP stays small. The site still has gradient/color fallbacks if those remote images cannot load. If you want a completely offline/self-contained build, copy `images/background.jpg` and `images/background2.jpg` from the `Merci-Chi/Steadyhandsop` repository into this ZIP and replace the two `--github-bg-*` URLs in `styles.css` with local paths.

## Before launch

Edit `config.js` to connect live client portal, preview portal, billing, references, examples, and checkout URLs.


## Background artwork
This version follows the live GitHub treatment more closely: the original `background.jpg`, `background2.jpg`, and a flipped repeat of `background.jpg` are stacked at full page width behind transparent sections. There are no full-section color overlays covering the artwork; only localized translucent content cards are used where text needs contrast.


## Main pages
- `index.html` — Home
- `preview.html` — client website preview access
- `references.html` — real client references
- `pricing.html` — website development and hosting pricing
