# Listing-first marketplace and navigation QA

Branch: `feature/marketplace-first-homepage`. Executed locally on 26 October 2026.

## Scope and design references

The latest merged main was inspected before editing. The separate unmerged automation branch was left untouched. ParkNow's [list-your-space experience](https://parknow.ph/list-your-space) and [ParkDito parking discovery](https://parkdito.ph/parking) were opened and rendered in Chromium. Their clear provider entry point and compact search/results informed the interaction hierarchy. No layouts, branding, photos or code were copied.

Public discovery now starts with a short heading, working search, compact filters and photo-led listings. Desktop has three/four columns; phones have one. The existing blue identity, verified location data and licensed representative imagery remain. Illustrative photos are labeled, real locations retain no-partnership context, and sample rates are identified on cards. The persistent gray preview banner was removed in favor of a footer disclosure and contextual reservation/access notices.

## Navigation

- Public destinations: Explore, Saved, My Reservations and List your space. Account offers the relevant workspace and sign out. Guests browse without authentication.
- Compact driver/host sign-in forms have separate entry points, field errors, visibility controls and collapsed public sample credentials. No account-selection cards or quick-fill buttons remain.
- Hash routes support existing page bookmarks plus `#host`, `#host-login`, `#host-register`, `#parking/<facility-id>` and `#pass/<reference>`. Invalid routes/listings have a return-to-discovery state.
- Browser Back/Forward, active states, titles, page focus and scroll restoration are integrated. Listing overlays close to the page that opened them; directly opened listing links close to discovery.
- Reservation drafts are scoped per guest/sample account in sessionStorage. Refresh, backtracking and sign-in from a chosen listing preserve the draft. Only the explicitly selected, unconfirmed guest draft is copied into the driver workspace. Passwords are never stored.
- Confirmed records retain the existing localStorage structure. QR routes reload the current record, including cancellation/completion state. Confirmation links directly to the pass and My Reservations.
- Host editors remain mounted during public browsing so an unfinished edit is retained. Camera verification unmounts when leaving the workspace, releasing camera resources. Assigned-facility guards and shared browser-local inventory remain unchanged.

## Executed checks

- Clean dependency install, production build and all 64 Node tests passed.
- Existing Chromium guest, catalog, accounts and host suites, updated for the new controls without removing coverage.
- New navigation Chromium suite at 320, 375, 390, 430, 768 and 1440px: first useful listing position, readable mobile filters, overflow, Saved context, Back/Forward, restored scroll, default discovery, direct links, refresh, friendly 404, guest draft through sign-in, editing/review/confirmation, direct QR and history, account keyboard focus, and retained host form inputs.
- Corrupted tab drafts are preserved safely; unavailable sessionStorage falls back to in-memory drafts.
- Actual visual inspection of desktop/phone discovery, compact sign-in, reservation pass and host editor. Fixes included squeezed mobile vehicle filters, modal focus return, clipped sorting and duplicate mobile host navigation.

Screenshots are local QA artifacts, not shipped assets. Physical camera scanning and Safari/iOS were not tested. Existing camera fallback and mocked permission-denial checks remain; this is frontend behavior only, not real parking or secure access control.
