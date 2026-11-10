STEADY HANDS — CONSULTATION-FIRST WEBSITE

To preview, open index.html in your browser. All pages share the same design, service selections, and consultation popup.

IMPORTANT: CONNECT YOUR BOOKING CALENDAR BEFORE PUBLISHING
1. Open booking-config.js.
2. Paste your real, public HTTPS appointment-scheduling link between the quotes in STEADY_BOOKING_URL.
   Example: window.STEADY_BOOKING_URL = 'https://your-booking-provider.example/appointments';
3. Save and redeploy the website. Test the Choose a Time button.

The site does not provide a calendar, submit appointment requests, or confirm bookings on its own. When configured, Choose a Time opens your external booking provider. That provider may request contact details needed to confirm the appointment.

WHAT CHANGED
- All 40 service cards remain available, except two New Businesses website offerings were combined into one: Website Development (39 distinct services).
- Website Development appears first under New Businesses > Digital Presence. Domain Registration is last.
- Service requests, questionnaires, validation gates, required fields, progress trackers, quote-only forms, and request-email drafting have been removed.
- Each service can be added using + and explained using ?. A single consultation covers multiple selected services.
- The optional notes are kept only in current page memory and are never sent or saved by Steady Hands. Copy discussion notes allows users to manually paste them into their scheduling provider, if desired.
- Selected service IDs are saved locally in the visitor's browser to allow browsing between pages; this is not a server submission. No contact, tax, banking, login, or payment information is collected here.
- Unused Square checkout/server files removed from this deployment copy.

Privacy reminder: Do not ask for confidential identification, login, tax, or banking details in the notes. Handle sensitive details during the private consultation via an appropriate secure process.


NEW NAVIGATION / REFERENCES PAGE
- About and Industries are dropdowns on desktop and mobile across all pages.
- Industries links to all 3 existing service-category pages.
- About > About Steady Hands opens the existing information panel.
- About > Client References opens references.html.
- references.html shows four public clients and a published testimonial from steadyhandsop.com/references.html (checked November 2026).
- The website preview artwork on references.html is illustrative CSS artwork, not screenshots of client websites.
- Existing consultation configuration in booking-config.js remains unchanged.

TRANSLATION (ALL PAGES)
The top-right cart icon was replaced with a circular globe icon. The custom language menu shows English first, Spanish second, ten popular languages and a More languages expansion. Actual automatic translation uses the Google Translate website element and requires an internet connection. Google controls the translated text and any translation toolbar; the header adapts when that toolbar is visible.
