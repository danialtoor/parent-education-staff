# Parent Education Program — County Court Staff Prototype

A fictional-data, interactive staff application for case management, class scheduling and rosters, bilingual true/false questions, and Odyssey certificate delivery.

The interface uses a formal program masthead, conventional navigation, tables, and clearly labeled forms appropriate for county court staff. No particular county identity or official seal is asserted.

## Run and check

- `npm run dev` starts the local application.
- `npx tsc --noEmit` checks TypeScript.
- `node scripts/test-domain.mjs` runs the staff and parent workflow tests.
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

## Parent portal

`/parent` opens the parent-facing prototype in the same county-office theme. The parent portal includes sign-in and registration, simulated email activation/password help, preparation completion details, a resumable 20-question knowledge check, class selection/change/cancellation, status and certificate access, and sample requests visible on the staff case page. Preview options switches among fictional parents at different stages. Existing sample accounts use `sample-pass`. New registrations use the chosen password, stored only as a salted PBKDF2 digest; raw passwords are never stored. This is not production authentication. The private Sites access policy remains unchanged.

The portal and staff workspace read the same browser-local records. Parent test submissions become staff-visible attempts; enrollment changes update rosters; support requests appear in case details. Old local data is preserved and receives one new sample parent, Alex Morgan. Resetting the sample workspace restores both experiences.

`lib/parent.ts` isolates illustrative parent rules: a 20-question test, an 80% passing score, three submitted attempts, preparation before online testing, and a passing test before self-service enrollment. Payment is shown independently and required for certification. These must be confirmed against the county's actual policies before integration. Staff enrollment overrides and existing certifications remain authoritative. Questions are snapshotted at test start so staff edits cannot alter a test in progress. No language-specific question analytics were added.

The new public pages use registration instructions, FAQ facts, and office contact details checked against the official KiDs1st Kane County website on October 13, 2026. Sample class locations and meeting links remain fictional; replace them during integration. Support requests and activation are simulated. All parent data and checks must move behind authenticated server operations before production use.


## Public entrance

`/public` opens the KiDs1st landing page. Bookmarkable routes include `#/register`, `#/sign-in`, `#/faq`, and `#/contact`. Public pages use the same restrained county-office design as the staff and parent workspaces. The registration and sign-in components are also used by the signed-out parent portal.

Registration requires both a matching active case number and an exact last name before showing account fields. Compact `26D1328` and formatted `2026-D-001328` match the same demonstration record. Explicit `lastName` supports compound surnames; legacy sample names fall back to the final name part. Production matching, limits, account enumeration protection, and identity verification belong on the county server. Email confirmation, password requirements, repeat-email checks, and simulated activation are provided. New accounts can sign in with their chosen email and password after activation. No real accounts or email messages are created, and browser storage is not a secure authentication backend.

The public FAQ supports topic filters, search, individual disclosure, and expand/collapse. Contact details link to the user's mail/phone apps; no messages are sent automatically. Sources: [home](https://www.kids1stkanecounty.com/public/Default.aspx), [registration](https://www.kids1stkanecounty.com/public/Register.aspx), [FAQ](https://www.kids1stkanecounty.com/public/FAQ.aspx), and [contact](https://www.kids1stkanecounty.com/public/Contact.aspx). External program facts should be reviewed before launch.
