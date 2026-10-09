# Parent Education Program — County Court Staff Prototype

A fictional-data, interactive staff application for case management, class scheduling and rosters, bilingual true/false questions, and Odyssey certificate delivery.

The interface uses a formal program masthead, conventional navigation, tables, and clearly labeled forms appropriate for county court staff. No particular county identity or official seal is asserted.

## Run and check

- `npm run dev` starts the local application.
- `npx tsc --noEmit` checks TypeScript.
- `node scripts/test-domain.mjs` runs 16 workflow and business-rule tests.
- `npm run build` builds the Sites application.

## Prototype boundaries

All names and records are fictional. Demo dates are anchored to October 8, 2026, with class times labeled Central Time. Changes are stored in this browser only, under `county-parent-education-demo-v1`. The Staff account / Demo settings dialog restores original sample records and simulates email failure, Odyssey retry failure, or denied staff access.

Windows authentication, allow-list checks, password reset emails, attendee emails, broker sending, and court integration are simulated. Certificates are real downloadable PDFs clearly marked SAMPLE and are not official court documents. The privately hosted Site separately requires its owner's access.

Case-number formatting and Soundex name matching are demonstration adapters. They must be replaced with the county application's conventions during integration. The prototype does not implement payment processing, staff access administration, deletion, additional test attempts, un-certification, or reporting/export beyond the listed certificate downloads.

## Application structure

- `lib/domain.ts`: shared typed records, fixture data, derived queues, search/format helpers, and guarded state transitions.
- `components/staff/context.tsx`: browser-local mock service and simulated errors.
- `components/staff/`: Home, Cases, Classes/rosters/email, Test Questions, Odyssey, and accessible shared form/dialog components.
- `lib/certificates.ts`: sample multi-page PDF generation and read-only downloads.
- `tests/domain.test.cjs`: meaningful cross-screen and restriction tests.

The page uses bookmarkable hash routes so a static entry point can expose every prototype screen without a production routing dependency. List query parameters preserve search and filters when returning from detail pages.

## Backend integration handoff

Replace the mock service with authenticated API operations and server-authoritative eligibility/access checks. Keep certification and delivery status separate. Wire Windows identity and the staff allow-list using the existing hosting environment. Replace sample PDF content with approved templates and preserve atomic certification behavior; receipt by the broker must never be presented as court acceptance. Eco acceptance/rejection remains disabled until the upstream integration supplies real results.

The browser exposes a feature-detected, read-only `search_cases` WebMCP tool against the same fictional records, enforcing the simulated denied-access state.
