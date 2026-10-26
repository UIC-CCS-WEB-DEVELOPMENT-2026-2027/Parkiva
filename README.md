# Parkiva [Visit Us!](https://prkiva.vercel.app)

**Smart Parking. Simple Reservations.**

Parkiva is a student-built frontend demonstration of a Public Parking Reservation and Management System.

**Demo Only — No Actual Parking Reservation Created.** Facilities, visuals, slot availability, reservations, and entry/exit checks are fictional. The demo has no backend, database, real authentication, or connection to parking facilities.


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

- Public parking discovery with search, vehicle/status filters, sorting, and browser-saved favorites.
- Responsive facility details with clearly labeled CSS demonstration illustrations.
- Available-only slot selection, date/time validation, and vehicle information checked against the facility and selected slot.
- Editable review steps that retain selections, followed by simulated confirmation with a unique demo reference.
- Browser-local reservation storage and overlap checks for the same slot or vehicle, with safe handling of unavailable or corrupted storage.
- My Reservations with details, time-based statuses, and confirmed cancellation of upcoming demo reservations.
- QR passes containing only a demo reference, with simulated entry during the scheduled time window and exit after recorded entry. These are not secure access credentials; no camera scanning or real gate integration is implemented.
- A public operator simulation with facility summaries, Available/Reserved/Occupied counts, demo records, and persisted mock slot edits shared with public browsing.
- Demo login and registration forms with basic validation and a visibility toggle for a fixed, read-only sample password. They collect no password and create no real account. The simulated session exists only until refresh or until it is ended.

Reservations and favorites belong to this browser's site storage, not to an authenticated account. Different profiles, devices, or site addresses do not share them. Clearing site data removes them. Multiple tabs share changes where supported; saving reservations, cancellations, verification, and slot edits requires browser storage and Web Locks. No server verifies or protects this data.

## How Parkiva Works

The working demo journey is:

1. Browse fictional parking facilities without logging in, then open View Details.
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
