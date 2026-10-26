# Frontend browser checks

Run the local Vite app, then run `npm run test:browser`. The default URL is `http://127.0.0.1:5173`; `PARKIVA_BASE_URL` can select another local test server.

Playwright remains an optional external test tool, not an application dependency. Set `PARKIVA_PLAYWRIGHT_PATH` to an existing Playwright `index.mjs` and, if necessary, `PARKIVA_CHROMIUM_PATH` to an existing Chromium executable. Otherwise the runner resolves an already installed Playwright normally. Tests create isolated contexts and do not use a real browser profile.

- Guest journey: search, filtering, sort, favorites, details, keyboard focus/Escape/backdrop, validation, edit navigation, draft retention, confirmation, QR, history, cancellation, corrupt storage, and overflow at 320/375/390/768/1280px.
- Davao catalog: source and Maps links, licensed local representative photos/credits/gallery, legacy favorite/override retirement and unchanged historical snapshots at 320/375/390/1280px.
- Accounts: compact forms, collapsed sample help, audience separation, required/invalid credentials, visibility toggle, registration preview, seeded driver/history, separate favorites and histories, assigned-facility guards, persistence, cross-tab logout, and quota failure at 320/375/390/1280px.
- Host marketplace: create/edit listing, upload size rejection and tab-only photo lifetime, shared Unavailable state, driver confirmation, host manual verification, early-entry rejection, check-in, late check-out, occupancy release, completed pass handling, and overflow at 320/375/390/768/1280px.

- Navigation: first-screen listings, mobile filter legibility, Saved context, Back/Forward and scroll restoration, direct links/refresh/404, guest-to-driver draft transfer, confirmation/pass/history navigation, account keyboard behavior, host edit retention, corrupt/unavailable tab storage at 320/375/390/430/768/1440px.

The host suite exercises the camera fallback in Chromium when BarcodeDetector is absent. It does not assert that a physical camera scanned a real QR. Unit tests cover additional invalid/cancelled/ambiguous passes, duplicate transitions, clock rules, storage failures, and serialized conflicts. `npm test` and `npm run build` require no browser tooling.

These checks establish frontend behavior only, not real availability or secure access control.
