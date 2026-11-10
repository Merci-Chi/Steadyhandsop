# Steady Hands Supabase booking setup (NOT deployed)

Target project: `glonbvrcudwuzjundrii`

This branch contains the booking database schema, two Supabase Edge Function templates, and `booking-config.js` pointing to their intended URLs. **GitHub commits do not install SQL, deploy Edge Functions, configure email, or activate Supabase.**

## Before deploying the public website

1. Verify that you have access to the **correct** Supabase project `glonbvrcudwuzjundrii` (the connected Supabase account in ChatGPT currently does not expose it).
2. Review and run `supabase/booking_schema.sql` in that project's SQL Editor. Confirm the table exists and RLS is enabled.
3. Configure secure server-side bot protection (e.g., Turnstile) and rate limiting in **both** Edge Functions, especially the public submission endpoint. Origin/CORS restrictions alone do not prevent abusive requests.
4. Deploy `sh-booking-availability` and `sh-booking-submit` to the **same** project, with public function invocation (`verify_jwt=false`) only after request-abuse protections are added. These functions use server-side Supabase secret credentials. **Never put a service-role/secret key in frontend JavaScript or GitHub.**
5. Configure a real transactional email provider, confirm messages are queued/sent, and update submission responses to report `emailConfirmationQueued:true` **only** once an email is actually queued.
6. Confirm any website and API hostnames in the CORS origin allowlist match the deployed site.
7. Run end-to-end tests: future slots, timezone conversion, successful submission, double-booking conflict, declined/cancelled releases, notifications, and narrow-screen UI.

## Website configuration

`booking-config.js` contains the intended function URLs for this project. They will fail until the functions are deployed. To keep the currently live site functional, leave this as a non-merged PR until the backend is ready.

## Privacy and security

- Public clients get **no** direct SQL table read/write privileges; the table uses RLS.
- Booking records contain personal contact information. Give authenticated staff an appropriately secured admin interface rather than making records anonymously queryable.
- Availability returns only UTC timestamps, never names or email addresses.
- The schema reserves 30-minute slots and prevents two active bookings sharing the same start timestamp. Integrating an external calendar will require an additional synchronization layer.
- No email dispatch, CAPTCHA validation, or server-side rate limiter is implemented in these templates yet.

## Deploy status

Code committed to GitHub only. **No SQL has been executed and no Edge Functions have been deployed to the target project.**
