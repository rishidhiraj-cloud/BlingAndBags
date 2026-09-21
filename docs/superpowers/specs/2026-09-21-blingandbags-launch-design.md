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
| `expense.html`, `expense.js`, `expense-style.css` | Expense tracking |
| `statement.html`, `statement.js`, `statement-style.css` | Financial statement view |
| `README.md`, `.gitignore`, `run.command`, icons/logo | Supporting project files |

**Out of scope** (present in TestVibe, not carried over): storage/
inventory, out-of-stock tracking, sales log, bill generation, rent
income, ledger adjustments, passport photo generator, collage maker,
AI sales insights / OCR APIs. These can be added later as their own
scoped additions if Bling & Bags needs them.

## Rebranding rules

Applied consistently across all ported files:

- Shop name: **"Bling & Bags"** in titles, headers, PWA manifest, icons
- Logo: user-supplied logo image (pink/gold boutique branding),
  replacing TestVibe's `Logo.png` / icon files
- Expense "spent by" list: **Dhiraj, Pallavi** (was Abhishek, Neha,
  Priyanka, Dhiraj)
- **"AP Cash" → "Saving Cash"** everywhere: the daily-entry field
  label, the internal variable/column naming, the expense "paid from"
  option, and all dashboard/statement labels. The underlying formulas
  are unchanged, only renamed:
  - `Petty Cash = Cash − Saving Cash`
  - `Total Income = Cash + UPI + Card − Yesterday's Petty Cash`
- Bank account label "BoB" (Bank of Baroda) — **assumed unchanged**
  pending confirmation; if Bling & Bags uses a different bank, this
  label needs to change too (see open question below)
- Visual theme (colors, fonts, layout): **unchanged** from TestVibe —
  only branding text/logo swapped in, per explicit decision to reuse
  the existing look
- Supabase credentials: hardcoded per-file (URL + anon key repeated in
  `app.js`, `history.js`, `expense.js`, `statement.js`, `dashboard.js`),
  mirroring TestVibe's existing pattern exactly — no shared config file

## Database (new Supabase project, same Supabase account)

Project URL: `https://khcwfivaxwgetwcrbefd.supabase.co` (already
created by user; anon key provided separately, not stored in this doc).

Two tables, adapted from TestVibe's `daily_entries` and
`CREATE_EXPENSES_TABLE.sql`:

```sql
CREATE TABLE daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    cash_amount DECIMAL(10, 2) NOT NULL,
    upi_amount DECIMAL(10, 2) NOT NULL,
    card_amount DECIMAL(10, 2) NOT NULL,
    saving_cash DECIMAL(10, 2) NOT NULL,   -- renamed from ap_cash
    petty_cash DECIMAL(10, 2) NOT NULL,
    total_income DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_daily_entries_date ON daily_entries(date DESC);

CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    spent_by TEXT NOT NULL,      -- 'Dhiraj' | 'Pallavi'
    paid_from TEXT NOT NULL,     -- 'Bank' | 'Saving Cash' | 'Self'
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
```

Row Level Security: same policy shape TestVibe uses in
`FIX_RLS.sql`/`SUPABASE_FIX.sql` (anon key allowed to read/write these
two tables).

## Repository & deployment

- New private GitHub repo `BlingAndBags` under the `rishidhiraj-cloud`
  account (same account as TestVibe's `PenAndPlay` repo), created
  manually by the user (no `gh` CLI/token available in this
  environment); this project's local git repo is then pushed to it.
- New Vercel project (separate from TestVibe's `pen-and-play`), linked
  to the new GitHub repo, created after the initial push.

## Open questions

- Does Bling & Bags use the same bank account as Pen & Play (so the
  "BoB" label is accurate), or a different bank (label needs updating)?

## Explicitly deferred

- Any module listed as "out of scope" above
- Centralizing Supabase config into a shared file (considered,
  user chose to mirror TestVibe's per-file pattern instead)
- Authentication / RLS hardening beyond TestVibe's existing baseline
