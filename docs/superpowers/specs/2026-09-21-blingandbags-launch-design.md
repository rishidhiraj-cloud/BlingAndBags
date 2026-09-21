# Bling & Bags — Shop Management App (Launch Scope)

## Overview

Bling & Bags is a new retail shop (bags + artificial jewellery). This
project clones the "core daily operations" slice of the existing
**TestVibe** app (`/Users/dhiraj/Documents/TestVibe`, live as
Pen & Play Club's shop management tool) into a new, independent
codebase and Supabase backend, rebranded for Bling & Bags.

Same stack as TestVibe: vanilla JS + HTML/CSS, Supabase (Postgres)
backend accessed directly via the Supabase JS SDK, Chart.js for the
dashboard, deployed on Vercel. No build step, no framework.

## Scope

**In scope** (ported from TestVibe, adapted):

| File(s) | Purpose |
|---|---|
| `index.html`, `dashboard.js`, `dashboard-style.css` | Dashboard: month selector, income charts, trends |
| `entry.html`, `app.js`, `style.css` | Daily cash register entry (Cash / UPI / Card / Saving Cash) |
| `history.html`, `history.js`, `history-style.css` | View/edit/delete past daily entries |
| `expense.html`, `expense.js`, `expense-style.css` | Expense tracking, incl. reimbursement sub-feature |
| `statement.html`, `statement.js`, `statement-style.css` | Financial statement view |
| `auth.js` | Login gate (name + shared passkey) loaded by all five pages above |
| `README.md`, `.gitignore`, `run.command`, `package.json`, icons/logo | Supporting project files |

**Out of scope** (present in TestVibe, not carried over): storage/
inventory, out-of-stock tracking, sales log, bill generation, rent
income, ledger adjustments, passport photo generator, collage maker,
AI sales insights / OCR APIs. These can be added later as their own
scoped additions if Bling & Bags needs them.

## Rebranding rules

Applied consistently across all ported files:

- Shop name: **"Bling & Bags"** in titles, headers, PWA manifest, icons
- Logo: user-supplied logo image (pink/gold boutique branding), saved
  to `logo.png` in the project root, used to generate `Logo.png`
  (body/header logo) plus resized icon files matching TestVibe's exact
  set: `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`
  (generated with macOS's built-in `sips` tool — no ImageMagick
  available in this environment). No PWA manifest file exists in
  TestVibe to update; icons are referenced only via `<link>` tags in
  each page's `<head>`.
- Expense "spent by" list: **Dhiraj, Pallavi** (was Abhishek, Neha,
  Priyanka, Dhiraj)
- **"AP Cash" → "Saving Cash"** everywhere: the daily-entry field
  label, the internal variable/column naming, the expense "paid from"
  option, and all dashboard/statement labels. The underlying formulas
  are unchanged, only renamed:
  - `Petty Cash = Cash − Saving Cash`
  - `Total Income = Cash + UPI + Card − Yesterday's Petty Cash`
- Bank account label "BoB" (Bank of Baroda) stays as-is — confirmed
  same bank account used
- Visual theme (colors, fonts, layout): **unchanged** from TestVibe —
  only branding text/logo swapped in, per explicit decision to reuse
  the existing look
- Supabase credentials: hardcoded per-file (URL + anon key repeated in
  `app.js`, `history.js`, `expense.js`, `statement.js`, `dashboard.js`),
  mirroring TestVibe's existing pattern exactly — no shared config file
- `auth.js` login gate: same shared-passkey mechanism, **passkey stays
  `7486`** (reused as-is). `USERS` list becomes `['Dhiraj', 'Pallavi']`.
  The Rohit-specific role-restriction logic (`enforceRoleAccess`,
  `ROHIT_ALLOWED`, redirect-to-passport-photo-page) is dead code with
  no target pages in this scope — stripped during the port, not carried
  over. Login overlay brand text "Pen & Play Club" → "Bling & Bags".
- Expense reimbursement sub-feature (mark an expense "Reimbursed",
  which auto-creates a new `paid_from: 'Bank'` expense entry recording
  the payback) is **included**, adapted from TestVibe's
  `expense_reimbursement_migration.sql` + the `markAsReimbursed()`
  logic in `expense.js`. One behavior change from TestVibe: the
  auto-created reimbursement entry's `expense_by` is set **dynamically
  to whoever filed the original expense** (`originalExpense.expense_by`)
  instead of TestVibe's hardcoded `'Neha'` — this is a deliberate fix,
  not a straight port, since a fixed name made little sense with a
  2-person team.

## Database (new Supabase project, same Supabase account)

Project URL: `https://khcwfivaxwgetwcrbefd.supabase.co` (already
created by user; anon key provided separately, not stored in this doc).

Two tables, matching TestVibe's actual column names exactly (verified
against its live `app.js`/`expense.js`, not just its README) except
for the `ap_cash` → `saving_cash` rename:

```sql
CREATE TABLE daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    cash_amount DECIMAL(10, 2) NOT NULL,
    upi_amount DECIMAL(10, 2) NOT NULL,
    card_amount DECIMAL(10, 2) NOT NULL,
    saving_cash DECIMAL(10, 2) NOT NULL,   -- renamed from ap_cash
    cash_total DECIMAL(10, 2) NOT NULL,
    petty_cash DECIMAL(10, 2) NOT NULL,
    total_income DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_daily_entries_date ON daily_entries(date DESC);
ALTER TABLE daily_entries DISABLE ROW LEVEL SECURITY;

CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_date DATE NOT NULL,
    expense_by VARCHAR(50) NOT NULL,      -- 'Dhiraj' | 'Pallavi'
    amount DECIMAL(10, 2) NOT NULL,
    paid_from VARCHAR(20) NOT NULL,       -- 'Bank' | 'Saving Cash' | 'Self'
    description TEXT,
    reimbursed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_by ON expenses(expense_by);
CREATE INDEX idx_expenses_reimbursed ON expenses(reimbursed);
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

Row Level Security: TestVibe actually runs both tables with **RLS
disabled entirely** (verified in `FIX_RLS.sql`/`CREATE_EXPENSES_TABLE.sql`
— there are no enforced policies, despite the README mentioning RLS as
a "production" recommendation it never adopted). Bling & Bags matches
that same baseline: RLS off, anon key can read/write freely. No change
in security posture from TestVibe.

Opening balances: TestVibe's `statement.js` seeds real historical
figures for Pen & Play (`SEED_OPENING = {'BoB': 122965.09, 'AP Cash':
-65662.00}`). Bling & Bags has no transaction history, so its
equivalent seed is `{'BoB': 0, 'Saving Cash': 0}`.

## Repository & deployment

- New private GitHub repo `BlingAndBags` under the `rishidhiraj-cloud`
  account (same account as TestVibe's `PenAndPlay` repo), created
  manually by the user (no `gh` CLI/token available in this
  environment); this project's local git repo is then pushed to it.
- New Vercel project (separate from TestVibe's `pen-and-play`), linked
  to the new GitHub repo, created after the initial push.

Note: TestVibe's `run.command` (local dev launcher) hardcodes a path
to `passport_photo_generator.html`, which is out of scope here. Bling &
Bags gets a simplified version that just serves the project root over
`python3 -m http.server` and opens `index.html`.

## Explicitly deferred

- Any module listed as "out of scope" above
- Centralizing Supabase config into a shared file (considered,
  user chose to mirror TestVibe's per-file pattern instead)
- Authentication / RLS hardening beyond TestVibe's existing baseline
