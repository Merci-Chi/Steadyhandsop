/* Set your real HTTPS scheduling page here before publishing.
   Examples: a Square Appointments, Calendly, Acuity, or Google Appointment Schedule booking link.
   Do not put credentials or personal data in this file. */
window.STEADY_BOOKING_URL = '';

/* OPTIONAL live availability integration.
   Set this to a HTTPS API endpoint you control after connecting your scheduling provider.
   The popup will request GET <endpoint>?date=YYYY-MM-DD&timezone=America/Los_Angeles
   and expects JSON: { "available": ["2026-11-17T17:00:00.000Z", ...] }.
   Only ISO instants matching the Pacific 9:00 AM–5:00 PM half-hour slots will show.
   Backend must independently re-check and reserve the selected slot before confirmation.
   Leave empty until your provider is connected: the UI shows the base time window,
   but these slots are not verified real-time availability. */
window.STEADY_AVAILABILITY_ENDPOINT = 'https://glonbvrcudwuzjundrii.supabase.co/functions/v1/sh-booking-availability';

/* Server-side booking submission. Must validate the selected slot, store the request,
   and (if desired) queue the confirmation email. Never place API secrets in JS.
   POST JSON: {services:[{id,title}],startTimeUTC,timezone,customer:{business,name,email,phone,notes}}
   Only return HTTP 2xx + {"success":true,"status":"submitted","requestId":"...",
   "emailConfirmationQueued":true} after actually accepting the request.
   Set emailConfirmationQueued to true ONLY when the confirmation email is queued.
   A separate scheduling link or availability-only endpoint is not a substitute. */
window.STEADY_BOOKING_SUBMIT_ENDPOINT = 'https://glonbvrcudwuzjundrii.supabase.co/functions/v1/sh-booking-submit';

/* Used only if no booking submission endpoint is configured.
   Opens a pre-filled email draft; the visitor must send it.
   A real scheduling backend is required for instant confirmations. */
window.STEADY_BOOKING_REQUEST_EMAIL = 'kiara@steadyhandsop.com';
