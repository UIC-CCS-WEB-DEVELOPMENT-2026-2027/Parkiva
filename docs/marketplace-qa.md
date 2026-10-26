# Marketplace QA record

Executed locally on 26 October 2026 for `feature/parkiva-marketplace-overhaul`.

- `npm ci`: completed; no new application dependencies.
- `npm test`: 61 passing Node tests, including host validation/storage, role scope, preview hours, shared reservation lookup, duplicate/invalid/cancelled QR transitions, checkout release and legacy inventory precedence.
- `npm run build`: production build passed with no build warnings.
- `npm run test:browser`: all four Chromium suites passed. Guest journeys and host/driver reservation verification ran at 320, 375, 390, 768 and 1280px. Catalog and account suites ran at 320, 375, 390 and 1280px.
- Guest journey checks cover search, price sorting, vehicle/status filters, favorites after reload, modal focus/Escape/backdrop, form errors, stale-slot recovery, retained edits, confirmation/pass, history filters and cancellation persistence.
- Marketplace checks cover visit-time search/prefill, browser Back, listing creation/editing, oversized-image rejection, tab-only photo lifetime, shared Unavailable status, cross-workspace booking conflicts, host lookup, early-entry rejection, check-in, late checkout, completed passes and bay release.
- Account checks cover quick-fill, invalid credentials, registration validation, password visibility, seeded records, identifier-only sessions, logout/reload, cross-tab session changes, assigned-facility guards and quota failure. No credential POSTs or passwords in browser storage were observed.
- Gallery checks cover local licensed imagery, source links, missing-image illustration and recovery when choosing a different gallery image. Legacy reservation snapshots remain associated with their original IDs.
- Visual inspection covered the live baseline and redesigned desktop/mobile discovery, listing details, driver home, host overview and verification. A tablet navigation overflow, favorite-button style collision and source encoding issues were corrected. The phone layout was then checked again after spacing refinement.

Camera limitations: Chromium's unsupported-scanner fallback was executed; permission-denial handling was tested with a mocked camera API. No physical camera scan, Safari/iOS test, cross-device verification, real authentication, payment or real parking access was tested or claimed.

PR checks run the build and Node tests through the added read-only frontend workflow. Browser tests require an existing external Playwright/Chromium installation as described in [the browser test notes](../tests/browser/README.md).
