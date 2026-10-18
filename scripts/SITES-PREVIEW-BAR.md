All HTML documents under sites/ share the navy “Approve preview & continue” bar.
Links use the existing public preview code from config.js, or the top-level
site folder name for a new site. No CRM keys or database records are created.
Green House retains its existing SHS-GHWH26M9R7Q2 code. Menu, contact, nested
pages and checked-in dist HTML are covered. Existing site interactions remain
available; approval occurs only after signing in to the portal.

After adding new HTML files, run from the repository root:

    node scripts/add-sites-preview-bar.cjs
    node --test tests/sites-preview-bar.test.cjs

The generator is idempotent and changes only its marked blocks and the body
class. It embeds its styles and height measurement in each document so copied
dist pages do not need a new shared asset. The bar hides inside an iframe
because the portal already has its own approval controls. Sticky headers sit
below the bar, including the Green House mobile header.
