**PLACEHOLDER BUILD — checkout is intentionally hard-disabled, and no Square payments can be made.**

See `SQUARE-CONFIGURATION-HERE.txt` and `.env.example`.

# Steady Hands — Square Production setup

## Current configuration
- Square mode: **Production** (not Sandbox).
- Production Application ID: `sq0idp-8TzUojWRr9qQ96wmo9MsWg` (a public identifier).
- Real card charges: **DISABLED**. No production Location ID or server access token has been configured.
- Card entry uses Square Web Payments SDK. Your website must not accept or store raw card details itself.

## What you need
1. From https://developer.squareup.com/apps select your Square application, switch to **Production**, and retrieve the **Production Location ID**.
2. Put the **Production Access Token** in a secure server secret/environment variable (never in the website, ZIP, chat, or GitHub).
3. Create the monthly **static** subscription plan variation in the **Production** Square catalog for the extra mailboxes and configure `SQUARE_MONTHLY_PLAN_VARIATION_ID`.
4. Deploy a secure HTTPS backend with persistent orders, idempotency keys, Square webhook verification, transaction reconciliation, refunds/cancellation processes, and appropriate customer consent before enabling real charges.
5. Only after completing security review, implement and enable a production checkout on a secure backend. This placeholder build cannot be enabled by changing environment variables alone.

This ZIP contains a sample Node backend and Square browser integration; **it is not a deploy-ready production payment processor**. In-memory idempotency is unsafe for live transactions, and a one-time domain charge plus a subscription are not an atomic operation. Domain registration and mailbox provisioning are also not automatic. Verify domain availability and confirm fulfillment before charging a customer.

## Prices shown
- Domain TLD prices are the configured annual prices.
- One mailbox is included with a new domain.
- Additional mailboxes: **$5/month each**, displayed separately.
- No first-year estimate.

## Local preview
Run `node square-server.mjs` and visit `http://localhost:8787`. It serves the website, but does not allow real payments without the missing credentials and deliberate production enablement. Never collect or submit a real card using the prototype checkout until backend safeguards are implemented.

Official references:
- https://developer.squareup.com/docs/web-payments/overview
- https://developer.squareup.com/docs/subscriptions-api/overview
