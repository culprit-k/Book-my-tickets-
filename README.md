# CineVerse 3D — Interactive Movie Booking Concept

A premium dark, cinematic movie-ticket booking prototype built with **Next.js, TypeScript, Three.js, React Three Fiber, and Drei**.

## Experience
- Interactive 3D auditorium with drag-to-orbit camera and scroll-to-zoom.
- Front, Back, and Explore camera presets.
- Clickable 3D seats with available, selected, and sample-booked states.
- Live demo seat count and price total.
- Responsive landing page with featured film cards and cinematic styling.

## Run locally
Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build check
```bash
npm run build
```

## Enable a trailer video
1. Copy `.env.example` to `.env.local` for local development, or add `NEXT_PUBLIC_TRAILER_URL` in your deployment provider's environment settings.
2. Set it to a YouTube watch/share URL or a direct HTTPS MP4/WebM URL that you have permission to use. YouTube is embedded using its privacy-enhanced player; direct videos use the browser video player.
3. The video is muted, loops, and shows browser controls; users can unmute it. Browsers may still apply autoplay restrictions.

## Deploy
1. Import this GitHub repository into Vercel.
2. Select Next.js as the framework (normally detected automatically).
3. Deploy the project. No environment variables are required for the current demo.

## Current limitations — important
This is a **front-end prototype**, not a live ticketing service:
- The 3D auditorium screen supports autoplaying a direct MP4/WebM trailer URL through `NEXT_PUBLIC_TRAILER_URL`. Without this setting, it displays a branded placeholder. Video starts muted because browsers commonly block autoplay with sound.
- Film titles, ratings, showtimes, and seat availability are demo content.
- Seat selections are not saved or locked in a database.
- Checkout is not connected to payments and does not create a real booking.
- Sign-in and movie discovery are not connected to a backend.

## Planned production milestones
1. Integrate a legally embeddable trailer or licensed video as a Three.js video texture; account for browser autoplay restrictions.
2. Connect a permitted movie metadata/trailer API and real showtimes.
3. Add Supabase or another database for accounts, theatres, showtimes, and transactional seat reservation.
4. Add authentication, server-side booking validation, payment integration, and confirmation emails.
5. Add automated tests, accessibility checks, monitoring, and deployment previews.

Do not commit API keys, payment secrets, private credentials, or unlicensed movie files.