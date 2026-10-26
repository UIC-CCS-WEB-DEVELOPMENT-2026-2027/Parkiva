# Parkiva [Visit Us!](https://prkiva.vercel.app)

**Find your spot in Davao.**

Parkiva is a Davao parking marketplace preview for drivers, neighborhood hosts and parking businesses.

**Demo Only — No Actual Parking Reservation Created.** Real venues use researched Davao City names and locations. Private-space listings and their hosts are fictional. All inventory, prices, hours, reservations and entry/exit checks are simulated. No facility partnership is implied. The preview has no backend, database, real authentication, payment processing or connection to parking facilities.

## Development Workflow

Parkiva follows a developer-led workflow supported by a dedicated Quality Assurance (QA) team.

```mermaid
flowchart TB
    DEV["Full-Stack Developer<br/>Cyrus Gabriel Macrohon<br/>Development & Deployment"]

    QA1["Christian Angelo Refalbor<br/>Coder & QA Tester"]
    QA2["Christene Pearl Baes<br/>Coder & QA Tester"]
    QA3["Christian Reynz Agosto<br/>Coder & QA Tester"]
    QA4["Real Ryan Abarquez<br/>Coder & QA Tester"]

    ISSUES["GitHub Issues<br/>Bug Reports, Feature Requests & Testing"]

    DEV --> QA1
    DEV --> QA2
    DEV --> QA3
    DEV --> QA4

    QA1 --> ISSUES
    QA2 --> ISSUES
    QA3 --> ISSUES
    QA4 --> ISSUES

    classDef developer fill:#243447,stroke:#58a6ff,color:#ffffff
    classDef qa fill:#2d333b,stroke:#8b949e,color:#ffffff
    classDef issues fill:#173b2e,stroke:#3fb950,color:#ffffff

    class DEV developer
    class QA1,QA2,QA3,QA4 qa
    class ISSUES issues
```

### Project Management

Development tasks, feature requests, and QA reports are
tracked using GitHub Issues and GitHub Projects.

[View Parkiva Development Board](https://github.com/orgs/UIC-CCS-WEB-DEVELOPMENT-2026-2027/projects/12)

## Project Objectives

- Reduce the time drivers spend searching for parking.
- Let users check availability before arriving at a destination.
- Provide a simple parking reservation process.
- Maintain clear reservation and vehicle records.
- Support QR-based verification for parking entry and exit.
- Help operators monitor occupancy and reservations.
- Provide an organized parking experience for drivers and operators.

## Implemented Marketplace Experience

- Listing-first guest discovery with compact location and optional visit-time search, vehicle, covered/open-air, illustrative price and availability filters, sorting, and saved listings.
- Eight researched real Davao locations plus three clearly fictional private/independent spaces. Host-created fictional listings appear in public discovery in the same browser.
- Licensed local representative parking photos, gallery controls, photographer credits, and an original illustration if an image cannot load. These photos do not claim to show a listed facility.
- Rich listing details with factual source links, host context, preview rates/amenities/hours, entrance information, rules, Maps links and a four-step reservation panel.
- Available-only bay selection, date/time and vehicle validation, editable review, account-scoped tab drafts retained through navigation, refresh and sign-in, unique preview references, and no payment step.
- My Reservations with upcoming/active/past/cancelled filters, vehicle details, QR passes, and confirmation before cancelling an upcoming visit.
- A driver home with preloaded favorites, vehicle information and reservation history.
- A host workspace with assigned training inventory and fictional properties, add/edit forms, safe local persistence, illustrative prices/hours, and Available/Reserved/Occupied/Unavailable bay management.
- Host QR lookup by camera on supported browsers or manual reference entry. Scheduled entry, late exit, duplicate-use prevention and occupancy release are simulated against the original reservation record.
- Separate compact driver and host sign-in forms with collapsible sample credentials, field validation, password visibility, login/logout, browser history navigation and identifier-only sessions. Registration demonstrates the interface without creating accounts.

Personal favorites and reservation histories retain separate guest/driver/operator keys. Effective inventory and conflict checks now consider all three workspaces in this browser, so a host can verify a driver's pass without copying that reservation into its own history. Pass updates are written back to the original workspace. Assigned real venues remain fictional training assignments, never claimed business ownership.

Existing guest data, researched IDs and historical reservation snapshots are retained. Earlier guest slot edits are read as a fallback; newer host edits take priority. Missing data produces empty states; malformed storage is reported and preserved. Saving reservations, cancellations, pass transitions, inventory and listings requires localStorage and Web Locks. Different devices, profiles and site addresses do not share data. Clearing browser site data removes the preview records.

### Public Demo Accounts

| Demo role        | Email                 | Public sample password |
| ---------------- | --------------------- | ---------------------- |
| Driver           | driver@parkiva.demo   | DriverDemo123!         |
| Parking Operator | operator@parkiva.demo | OperatorDemo123!       |

The driver workspace starts with saved real Davao locations and upcoming, past, and cancelled mock reservations. The host workspace starts with mock occupancy and training assignments for Aldevinco Pay Parking, SM City Davao Parking, and SM Lanang Premier Parking, plus fictional private/independent listings. The operator account does **not** own or manage those facilities in the real world. Public discovery remains available without login. Seed data is added only when an account's storage is absent, so subsequent logins do not reset edits or cancellations.

Only the demo account identifier is stored as session data. These public credentials and frontend role checks are visible and editable in the browser; they provide no security or real staff authorization. Use no real credentials.

Public navigation starts at Explore, with Saved and My Reservations always within reach. List your space opens a dedicated host introduction and host sign-in. Listing and pass links support browser Back/Forward and refresh; a selected guest reservation draft follows driver sign-in. Drafts remain in the current tab via sessionStorage with an in-memory fallback. Confirmed reservations remain local to this browser and are not securely account-linked. [Navigation and QA notes](docs/marketplace-navigation-qa.md) describe the tested journeys.

## How Parkiva Works

The working preview journey is:

1. Explore Davao parking as a guest, compare illustrative prices and spaces, save a shortlist and view location sources.
2. Pick a bay, choose a future same-day visit within the listing's preview hours, and enter example vehicle details.
3. Review or edit any step, then confirm a simulated reservation. No payment or real parking booking occurs.
4. Open the reference and QR pass from confirmation or My Reservations.
5. Switch to the public host account in the same browser, choose Verify a pass, and enter the reference or use a supported camera.
6. Practice check-in during the visit window, then check-out to complete the visit and release the simulated bay.
7. Return as a driver to see the updated pass/history, or cancel another upcoming visit with confirmation.

## Future Backend Functionality

Real reservations would require server-side booking validation, shared availability, durable database records, secure authentication, authorization for staff actions, and independently verified QR entry/exit. None of those services are implemented by this frontend demo. The operator dashboard and simulated session must not be treated as evidence of staff authorization or secure account ownership.

## Development Team

Parkiva is developed by:

- Cyrus Gabriel Macrohon
- Christian Angelo Refalbor
- Christene Pearl Baes
- Christian Reynz Agosto
- Real Ryan Abarquez

## Academic Project

Parkiva is developed as an academic web development project under the College of Computer Studies of the University of the Immaculate Conception.

## Branding

Parkiva uses its own visual identity and `parkiva.png` as the official project logo. The favicon uses the logo symbol without the wordmark.

## Location Research and Photo Policy

Names, location evidence, research date, and public sources are recorded with each listing. See [research notes](docs/davao-parking-research.md). Google Maps links open a location search, not a guaranteed parking entrance. No real capacity, fee, operating hours, or reservation partnership is supplied.

No authorized location-specific photo integration is configured. Licensed, locally served Pexels photos are explicitly representative; see [photo sources and license](public/images/ATTRIBUTION.md). No Google Maps images are copied, no private keys are exposed, and runtime browsing makes no remote image requests. Hosts may choose a JPG/PNG/WebP up to 2 MB for the current tab only; uploads are never stored in localStorage and disappear on refresh or logout.

Retired fictional favorite IDs are removed instead of being assigned to real facilities. Earlier reservation snapshots retain their original location identity. [Design research](docs/marketplace-design-research.md) documents the references and frontend limitations. The footer disclosure and contextual confirmation/login/verification disclosures keep the simulation clear without repeating banners on every card.
