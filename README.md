# Parkiva [Visit Us!](https://prkiva.vercel.app)

**Smart Parking. Simple Reservations.**

Parkiva is a student-built frontend demonstration of a Public Parking Reservation and Management System.

**Demo Only — No Actual Parking Reservation Created.** Facility names and locations are researched in Davao City; slot layouts, vehicle options, availability, reservations, and entry/exit checks are simulated. No facility partnership is implied. The demo has no backend, database, real authentication, or connection to parking facilities.


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

## Implemented Demo Features

The frontend currently includes:

- Eight researched Davao City parking locations with source citations and Google Maps search links, plus search, demo vehicle/status filters, sorting, and browser-saved favorites.
- Responsive facility details with clearly labeled photo placeholders. No copyrighted Google Maps photos are copied or scraped.
- Available-only slot selection, date/time validation, and vehicle information checked against the facility and selected slot.
- Editable review steps that retain selections, followed by simulated confirmation with a unique demo reference.
- Browser-local reservation storage and overlap checks for the same slot or vehicle, with safe handling of unavailable or corrupted storage.
- My Reservations with details, time-based statuses, and confirmed cancellation of upcoming demo reservations.
- QR passes containing only a demo reference, with simulated entry during the scheduled time window and exit after recorded entry. These are not secure access credentials; no camera scanning or real gate integration is implemented.
- An operator simulation with facility summaries, Available/Reserved/Occupied counts, demo records, and persisted mock slot edits shared with public browsing in that demo workspace. Editing requires the operator demo role and is limited to its fictional assignment list; guests and drivers see a read-only preview.
- Two preconfigured demo role accounts with quick-fill, credential validation, password visibility, login/logout, and an identifier-only session that survives refresh. Registration remains an interface demonstration and creates no additional account. Password fields use only the public sample credentials and are never persisted or sent to a server.

Reservations and favorites belong to this browser's site storage, not to a securely authenticated account. Guest, driver, and operator workspaces use separate storage keys; switching roles does not transfer reservations, favorites, or status edits between them. Existing guest data is retained. Different profiles, devices, or site addresses do not share data. Clearing site data removes it. Multiple tabs share the current demo session and changes where supported; saving reservations, cancellations, verification, and slot edits requires browser storage and Web Locks. No server verifies or protects this data.

### Public Demo Accounts

| Demo role | Email | Public sample password |
| --- | --- | --- |
| Driver | driver@parkiva.demo | DriverDemo123! |
| Parking Operator | operator@parkiva.demo | OperatorDemo123! |

The driver workspace starts with saved real Davao locations and upcoming, past, and cancelled mock reservations. The operator workspace starts with mock occupancy and reservations assigned to Aldevinco Pay Parking, SM City Davao Parking, and SM Lanang Premier Parking for this exercise only. The operator account does **not** own or manage those facilities in the real world. Public discovery remains available without login. Seed data is added only when an account's storage is absent, so subsequent logins do not reset edits or cancellations.

Only the demo account identifier is stored as session data. These public credentials and frontend role checks are visible and editable in the browser; they provide no security or real staff authorization. Use no real credentials.

## How Parkiva Works

The working demo journey is:

1. Browse the researched Davao City location listings without logging in, then open View Details. Real-world admission, opening hours, and fees must be confirmed directly; none are promised by Parkiva.
2. Select an available mock slot, choose a future arrival and later same-day departure, and enter demo vehicle information.
3. Review the details or go back to edit them without losing the other valid selections.
4. Confirm the simulation. A demo reference and snapshot are saved in this browser after validation and local conflict checks.
5. View the demo pass from confirmation or My Reservations. Its entry/exit buttons use the browser's local clock and stored records; they never grant real access.
6. Use My Reservations to inspect records or confirm cancellation of an upcoming demo reservation.
7. Open Operator Demo to explore local slot statuses. Current reservation windows appear Reserved; recorded entry without exit appears Occupied. Future bookings stay in the records, and manual edits do not cancel reservations.

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

No authorized Google Places photo integration or exact-location reusable photo license is configured, so all listings use explicit placeholders. No private API keys or remote photo requests are added. Retired fictional favorite IDs are removed instead of being assigned to real facilities. Earlier demo reservation snapshots remain unchanged in My Reservations; old mock status overrides are ignored rather than transferred to new locations.
