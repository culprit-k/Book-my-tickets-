# Deployment and production checklist

## Current front-end deployment
1. Pushes to `main` trigger the GitHub Actions build workflow.
2. Import `culprit-k/Book-my-tickets-` into Vercel.
3. Keep the framework as Next.js and use the default build command `npm run build`.
4. If enabling trailer playback, set `NEXT_PUBLIC_TRAILER_URL` to a direct HTTPS MP4/WebM URL that you have rights to use.
5. After deployment, test desktop and mobile layouts, 3D controls, and seat selection.

## Supabase foundation (not connected to the UI yet)
1. Create a Supabase project.
2. Review `supabase/migrations/0001_cineverse_schema.sql` carefully before running it in the Supabase SQL Editor.
3. Add movie, theatre, auditorium, seat, and showtime data using a trusted admin workflow.
4. Integrate Supabase Auth and call the `hold_seats` RPC from a server-side booking flow.
5. Implement payment-provider checkout and a verified server-side webhook before changing a booking to `confirmed`.
6. Add cancellation/refund rules, hold expiry cleanup, rate limiting, logging, and tests.

## Security rules
- Never expose a Supabase service-role key or payment secret in browser code or a `NEXT_PUBLIC_*` variable.
- Do not treat the demo's browser-only seat state as a reservation.
- A seat hold is not a paid ticket. Confirm tickets only after a trusted payment verification flow.
- Use licensed movie metadata and trailer sources; do not upload or redistribute copyrighted trailers without permission.

## Before announcing launch
- [ ] GitHub Actions build passes.
- [ ] Production build and deployed page verified.
- [ ] Mobile layout and accessibility checked.
- [ ] Trailer URL tested on desktop and mobile browsers.
- [ ] Supabase schema reviewed and applied.
- [ ] Auth and server-side authorization tested.
- [ ] Concurrent seat-hold tests pass.
- [ ] Payment webhook signatures verified.
- [ ] Refunds, cancellations, receipts, and support process implemented.
