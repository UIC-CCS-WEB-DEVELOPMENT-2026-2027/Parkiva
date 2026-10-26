# Frontend browser checks

`npm test` runs the dependency-free Node validation and storage tests. `npm run build` checks the production bundle.

`npm run test:browser` runs the complete browser journey at 320, 375, 390, and 1280 pixels using Playwright and Chromium. Start the local Vite app first. The default URL is `http://127.0.0.1:5173`; override it with `PARKIVA_BASE_URL` when needed.

Playwright is an optional external test tool, not an application dependency. If it is already installed outside this project, set `PARKIVA_PLAYWRIGHT_PATH` to its `index.mjs` file. Optionally set `PARKIVA_CHROMIUM_PATH` to an existing compatible Chromium executable. Otherwise the runner resolves `playwright` and its default Chromium installation normally. The suite creates isolated browser contexts and changes only their demo storage.

The suite covers search, combined filters, sorting, favorites after reload, modal keyboard focus and backdrop dismissal, required/past/range/vehicle validation, stale-slot recovery, edit navigation, confirmation, QR entry/exit, history, cancellation, operator editing, demo registration, storage error/empty states, and horizontal overflow. It uses a fixed local clock so entry/exit checks do not depend on the real date.

Supplementary storage unit tests cover cross-tab-style locking, quota/denied-storage failures, invalid data, duplicate references, and conflict prevention. These checks do not establish real availability, secure authentication, or real access control.
