# Marketplace experience research

Reviewed 26 October 2026 before implementation. These are interaction references, not copied designs or assets.

| Public reference                                                                                 | What informed Parkiva                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [JustPark](https://www.justpark.com/)                                                            | Put destination and visit time before the results; provide a separate space-provider path.        |
| [SpotHero](https://spothero.com/)                                                                | Make comparison and pass access easy to find throughout the driver journey.                       |
| [ParkWhiz](https://www.parkwhiz.com/)                                                            | Keep parking search immediately usable without an account wall.                                   |
| [YourParkingSpace](https://www.yourparkingspace.co.uk/)                                          | Support individual spaces and parking businesses with a dedicated provider workspace.             |
| [Airbnb](https://www.airbnb.com/)                                                                | Use photo-led listing comparisons, a useful saved list, host context, and editable booking steps. |
| [W3C modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)              | Contain keyboard focus, support Escape, and return focus to the invoking control.                 |
| [W3C target size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Give controls adequate size/spacing; primary forms and navigation use 44px touch targets.         |
| [MDN BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)          | Feature-detect camera QR decoding; retain manual entry and stop camera tracks on exit.            |

The live Parkiva homepage was inspected in Chromium before editing. It exposed eight directory-style cards, a simple filter form and repeated preview notices. Existing reservation validation, conflict locks, cancellation, QR transitions, account keys, and researched location IDs were retained and extended rather than replaced.

## Design decisions

Parkiva keeps its existing blue, navy, green, supplied logo and JavaScript/JSX stack. A compact destination-led intro, visible listings, neighborhood shortcuts and a responsive filter sheet replace the directory introduction. Listing details combine gallery, host context, rules, source evidence, and an editable reservation panel. Mobile navigation remains visible at the bottom. Host tools use clear sections and compact summaries rather than large decorative statistics.

One persistent marketplace-preview disclosure covers ordinary browsing. Consequential confirmation, login and pass verification retain contextual notices. Fictional hosts are attached only to fictional properties. Real venues retain their factual names/addresses and are labeled preview inventory with no ownership or partnership claim.

The same-browser host workflow reads all three reservation partitions, writes a pass transition back to its original partition, and shares effective inventory. Personal histories and favorites remain separate. This intentionally changes the former isolated inventory behavior so a host can practice verifying a driver visit without copying or reassigning reservation records.

## Limits

No secure authentication, real property offers, payment, cross-device scanning, server-issued tokens, real availability or access control is implemented. Camera decoding depends on BarcodeDetector, HTTPS/localhost, a camera, and permission. Manual reference entry is always available. Hardware scanning requires a compatible device; automated tests do not establish physical camera compatibility.
