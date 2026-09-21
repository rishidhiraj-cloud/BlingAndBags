# Bling & Bags Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a working Bling & Bags shop-management web app at `/Users/dhiraj/Documents/BlingAndBags`, cloned and rebranded from TestVibe's core daily-operations modules, backed by its own new Supabase database, pushed to its own new GitHub repo, and deployed to its own new Vercel project.

**Architecture:** Same as the source project — vanilla JS + HTML/CSS, no build step, no framework. Each page is a standalone HTML file that loads its own `<script>` tags (`auth.js` for login, a page-specific JS file, and the Supabase JS SDK from a CDN) and calls Supabase directly via `supabaseClient`. Every JS file independently declares its own `SUPABASE_URL`/`SUPABASE_ANON_KEY` constants — there is no shared config module, matching the source project exactly.

**Tech Stack:** Vanilla JavaScript (ES6), HTML5, CSS3, Supabase JS SDK v2 (loaded via CDN, same as TestVibe), Chart.js (dashboard only), Supabase Postgres backend, Vercel static hosting + `@vercel/speed-insights`.

**Spec:** `/Users/dhiraj/Documents/BlingAndBags/docs/superpowers/specs/2026-09-21-blingandbags-launch-design.md`

## Global Constraints

- Source of truth for all ported code: `/Users/dhiraj/Documents/TestVibe` (read-only reference — never modify TestVibe files).
- Shop name everywhere: **Bling & Bags** (replaces "Pen & Play Club").
- Team/user list everywhere: **Dhiraj, Pallavi** (replaces Abhishek, Neha, Priyanka, Dhiraj — Rohit-specific logic is dropped entirely, not renamed).
- Rename **"AP Cash" → "Saving Cash"** in every user-facing label, and its underlying identifiers: `apCash`→`savingCash` (JS variable/element-id casing), `ap_cash`→`saving_cash` (DB column / JS payload key).
- Bank label **"BoB" stays unchanged**.
- Visual theme/CSS: **unchanged** from TestVibe — only text and logo/icon assets change.
- Supabase project URL: `https://khcwfivaxwgetwcrbefd.supabase.co`
- Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3dmaXZheHdnZXR3Y3JiZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzIwNTcsImV4cCI6MjEwNTU0ODA1N30.TOY6mgJjiu21NlMCJ6f5fVbrwqj_d4P0B5cGjEJqOak` (safe to expose client-side, same as TestVibe's own anon key usage)
- Auth passkey: **`7486`** (reused from TestVibe as decided).
- No automated test framework exists in TestVibe and none is being introduced here (confirmed: `package.json` has no `scripts`, no test runner, no CI config). "Testing" a step means: (a) a syntax check via `node -c <file>.js` or `node --check`, (b) a `grep`-based verification that old strings are gone / new strings present, and (c) for full-page tasks, manually serving the app locally and exercising the page in a browser per the project's own convention (see spec, "no build step").
- All work happens directly on `main` in the already-initialized git repo at `/Users/dhiraj/Documents/BlingAndBags` (2 existing commits: the spec doc). Commit after every task.
- Use `perl -pi -e 's/\QOLD\E/NEW/g' file` for all literal text substitutions (not `sed`) to avoid BSD/GNU `sed -i` and `&`-escaping inconsistencies across platforms.

---

### Task 1: Project skeleton and supporting files

**Files:**
- Create: `README.md`, `.gitignore`, `run.command`, `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/.gitignore`, `/Users/dhiraj/Documents/TestVibe/package.json`, `/Users/dhiraj/Documents/TestVibe/package-lock.json` (copied verbatim — these have no shop-specific content)
- Produces: root-level project scaffolding later tasks assume exists (e.g., `.gitignore` must already exclude `node_modules` before Task 12's `npm install`)

- [ ] **Step 1: Copy the dependency files verbatim**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/package.json .
cp /Users/dhiraj/Documents/TestVibe/package-lock.json .
```

- [ ] **Step 2: Write `.gitignore`**

TestVibe's `.gitignore` only excludes `.vercel` — but TestVibe also
commits its `node_modules/` directory (55 tracked files), which is not
a pattern worth repeating. Add `node_modules` here so Bling & Bags
relies on `npm install` instead of a committed dependency tree:

```
.vercel
node_modules
```

- [ ] **Step 3: Write `run.command`**

TestVibe's version hardcodes a path to `passport_photo_generator.html`
(out of scope). Write a generic local-dev launcher instead:

```bash
#!/bin/bash
# Double-click this file to serve Bling & Bags locally and open the dashboard.
cd "$(dirname "$0")"
PORT=8765

( sleep 1; open "http://localhost:${PORT}/index.html" ) &

echo "Serving $(pwd) on http://localhost:${PORT}"
echo "Press Ctrl-C to stop."
exec python3 -m http.server "${PORT}"
```

Then make it executable:

```bash
chmod +x run.command
```

- [ ] **Step 4: Write `README.md`**

```markdown
# Bling & Bags — Shop Management App

A mobile-first web app for **Bling & Bags** (bags & artificial
jewellery) to track daily cash register entries, expenses, and
generate financial statements. Cloned and adapted from the Pen & Play
Club TestVibe app.

## Stack

Vanilla JS + HTML/CSS, [Supabase](https://supabase.com) (Postgres)
backend, Chart.js for the dashboard, deployed on Vercel. No build
step, no framework.

## Pages

| File | Purpose |
|------|---------|
| `index.html` + `dashboard.js` | Dashboard: analytics, charts, trends |
| `entry.html` + `app.js` | Daily cash register entry |
| `history.html` + `history.js` | View/edit/delete past daily entries |
| `expense.html` + `expense.js` | Expense tracking, incl. reimbursement |
| `statement.html` + `statement.js` | Financial statement view |
| `auth.js` | Shared login gate (loaded by every page above) |

## Business Logic

- `Total Income = Cash + UPI + Card − Yesterday's Petty Cash`
- `Petty Cash = Cash − Saving Cash`
- Login: pick your name, enter the shared passkey.

## Local development

Double-click `run.command`, or run:

```
python3 -m http.server 8765
```

then open `http://localhost:8765/index.html`.

## Deployment

Deployed on Vercel, linked to this GitHub repo — pushes to `main`
auto-deploy.
```

- [ ] **Step 5: Verify**

Run: `ls -la /Users/dhiraj/Documents/BlingAndBags`
Expected: `README.md`, `.gitignore`, `run.command` (executable),
`package.json`, `package-lock.json` all present.

- [ ] **Step 6: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add README.md .gitignore run.command package.json package-lock.json
git commit -m "Add project skeleton: README, gitignore, dev launcher, dependencies"
```

---

### Task 2: Supabase schema setup

**Files:**
- None in this repo — this task runs SQL against the already-created Supabase project at `https://khcwfivaxwgetwcrbefd.supabase.co`.
- Create (reference only, not required by the app at runtime): `SCHEMA_SETUP.sql` — save the SQL below into this file in the repo root, so the commands are reproducible/auditable, mirroring TestVibe keeping its `CREATE_*.sql` files in-repo.

**Interfaces:**
- Produces: `daily_entries` and `expenses` tables that Tasks 4–8's JS code read/write via `supabaseClient`.

- [ ] **Step 1: Write `SCHEMA_SETUP.sql`**

```sql
CREATE TABLE daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    cash_amount DECIMAL(10, 2) NOT NULL,
    upi_amount DECIMAL(10, 2) NOT NULL,
    card_amount DECIMAL(10, 2) NOT NULL,
    saving_cash DECIMAL(10, 2) NOT NULL,
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
    expense_by VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_from VARCHAR(20) NOT NULL,
    description TEXT,
    reimbursed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_by ON expenses(expense_by);
CREATE INDEX idx_expenses_reimbursed ON expenses(reimbursed);
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Run it against the Bling & Bags Supabase project**

Ask Dhiraj to open `https://supabase.com/dashboard/project/khcwfivaxwgetwcrbefd/sql/new`
(SQL Editor for this project), paste the contents of `SCHEMA_SETUP.sql`,
and click Run. (No `supabase` CLI is available in this environment, so
this step cannot be automated — it must be done via the dashboard.)

- [ ] **Step 3: Verify**

In the same SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('daily_entries', 'expenses');
```

Expected: both `daily_entries` and `expenses` rows returned.

- [ ] **Step 4: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add SCHEMA_SETUP.sql
git commit -m "Add Supabase schema SQL for daily_entries and expenses tables"
```

---

### Task 3: Logo and icon assets

**Files:**
- Create: `Logo.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`
- Prerequisite: `logo.png` must already exist at `/Users/dhiraj/Documents/BlingAndBags/logo.png` (the source image Dhiraj is placing there). **If it's not there yet, stop this task and ask Dhiraj to add it before continuing** — do not fabricate a placeholder image.

**Interfaces:**
- Produces: the four icon/logo files every ported HTML page's `<head>`/`<body>` references (Task 4 onward).

- [ ] **Step 1: Confirm the source logo exists**

Run: `test -f /Users/dhiraj/Documents/BlingAndBags/logo.png && echo FOUND || echo MISSING`
Expected: `FOUND`. If `MISSING`, stop and ask the user to save the logo
file there before proceeding with this task.

- [ ] **Step 2: Check the source image dimensions**

```bash
sips -g pixelWidth -g pixelHeight /Users/dhiraj/Documents/BlingAndBags/logo.png
```

Confirm both dimensions are ≥ 512px (TestVibe's largest icon is
512×512). If smaller, tell the user the logo may look soft at full
size but proceed anyway — don't block on this.

- [ ] **Step 3: Generate `Logo.png` (full-res copy, used inline in the page body)**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp logo.png Logo.png
```

- [ ] **Step 4: Generate the three sized icons with `sips`**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
sips -z 192 192 logo.png --out icon-192.png
sips -z 512 512 logo.png --out icon-512.png
sips -z 180 180 logo.png --out apple-touch-icon-180.png
```

- [ ] **Step 5: Verify**

```bash
for f in Logo.png icon-192.png icon-512.png apple-touch-icon-180.png; do
  sips -g pixelWidth -g pixelHeight "$f"
done
```

Expected: `icon-192.png` is 192×192, `icon-512.png` is 512×512,
`apple-touch-icon-180.png` is 180×180, `Logo.png` matches the source
logo's original dimensions.

- [ ] **Step 6: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add Logo.png icon-192.png icon-512.png apple-touch-icon-180.png logo.png
git commit -m "Add Bling & Bags logo and generated icon assets"
```

---

### Task 4: auth.js (login gate)

**Files:**
- Create: `auth.js`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/auth.js`
- Produces: `window.washiAuth.getUsername()` (used by `expense.js` in Task 7 for the delete-button permission check), and the login overlay every page in Tasks 5–8 depends on to gate access.

- [ ] **Step 1: Copy the source file**

```bash
cp /Users/dhiraj/Documents/TestVibe/auth.js /Users/dhiraj/Documents/BlingAndBags/auth.js
```

- [ ] **Step 2: Rebrand the login overlay text**

In `auth.js`, find:
```js
'<p class="auth-brand">Pen &amp; Play Club</p>' +
```
Replace with:
```js
'<p class="auth-brand">Bling &amp; Bags</p>' +
```

- [ ] **Step 3: Replace the USERS list**

Find:
```js
var USERS         = ['Neha', 'Priyanka', 'Abhishek', 'Dhiraj', 'Rohit'];
```
Replace with:
```js
var USERS         = ['Dhiraj', 'Pallavi'];
```

- [ ] **Step 4: Remove the Rohit-specific role-restriction dead code**

Delete the `ROHIT_ALLOWED` constant:
```js
var ROHIT_ALLOWED = ['passport_photo_generator.html', 'collage.html'];
```

Delete the entire `enforceRoleAccess` function (from `/* ── Role-based
access control for Rohit ───── */` through its closing `}`, i.e. the
whole block currently spanning roughly lines 59–92 in TestVibe's
version):
```js
/* ── Role-based access control for Rohit ───── */
function enforceRoleAccess(username) {
    if (username !== 'Rohit') return;
    ... (full function body) ...
}
```

Then remove its two call sites — in the "already authenticated" branch:
```js
if (stored && stored.authenticated) {
    injectGreeting(stored.username);
    enforceRoleAccess(stored.username);
    return;
}
```
becomes:
```js
if (stored && stored.authenticated) {
    injectGreeting(stored.username);
    return;
}
```

and in the submit handler:
```js
saveAuth(username);
window.washiAuth = { getUsername: function () { return username; } };
injectGreeting(username);
enforceRoleAccess(username);
```
becomes:
```js
saveAuth(username);
window.washiAuth = { getUsername: function () { return username; } };
injectGreeting(username);
```

- [ ] **Step 5: Syntax check**

Run: `node --check /Users/dhiraj/Documents/BlingAndBags/auth.js`
Expected: no output (exit code 0).

- [ ] **Step 6: Verify no leftover references**

Run: `grep -n "Rohit\|Pen & Play\|Neha\|Priyanka\|Abhishek" /Users/dhiraj/Documents/BlingAndBags/auth.js`
Expected: no matches (empty output).

- [ ] **Step 7: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add auth.js
git commit -m "Add rebranded auth.js login gate (Dhiraj/Pallavi, passkey 7486)"
```

---

### Task 5: Daily cash entry (`entry.html` + `app.js` + `style.css`)

**Files:**
- Create: `entry.html`, `app.js`, `style.css`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/entry.html`, `app.js`, `style.css`; `auth.js` from Task 4; Supabase `daily_entries` table from Task 2.
- Produces: the `daily_entries` row shape `{ date, cash_amount, upi_amount, card_amount, saving_cash, cash_total, petty_cash, total_income }` that Tasks 6 (history) and 9 (dashboard) read.

- [ ] **Step 1: Copy the source files**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/entry.html .
cp /Users/dhiraj/Documents/TestVibe/app.js .
cp /Users/dhiraj/Documents/TestVibe/style.css .
```

- [ ] **Step 2: Rebrand `entry.html` heading**

Find:
```html
<h1>Pen & Play Club</h1>
```
Replace with:
```html
<h1>Bling & Bags</h1>
```

- [ ] **Step 3: Rename the "AP Cash" field in `entry.html`**

Find:
```html
  <!-- AP Cash -->
```
Replace with:
```html
  <!-- Saving Cash -->
```

Find:
```html
  <label for="apCash">AP Cash</label>
```
Replace with:
```html
  <label for="savingCash">Saving Cash</label>
```

Find (the input's `id`/`name` attributes):
```html
         id="apCash"
         name="apCash"
```
Replace with:
```html
         id="savingCash"
         name="savingCash"
```

- [ ] **Step 4: Rename "AP Cash" identifiers throughout `app.js`**

Run these substitutions in order (case-sensitive, each is a distinct
non-overlapping identifier):

```bash
cd /Users/dhiraj/Documents/BlingAndBags
perl -pi -e 's/\QapCashInput\E/savingCashInput/g' app.js
perl -pi -e 's/\QapCash\E/savingCash/g' app.js
perl -pi -e 's/\Qap_cash\E/saving_cash/g' app.js
```

This renames: the `getElementById('apCash')` lookup and its listener,
the `apCash` local variable in `calculateAllFields()`, the "Petty Cash
Amount = Cash Amount - AP Cash" comment, the `data.ap_cash || 0`
restore-on-load line, the `apCash` validation check, the debug
`console.log` object key, and — critically — the `ap_cash: apCash`
key in the `entryData` object sent to Supabase (becomes
`saving_cash: savingCash`).

- [ ] **Step 5: Substitute Supabase credentials in `app.js`**

Find the two constant declarations near the top of the file (whatever
their current values are):
```js
const SUPABASE_URL = '...';
const SUPABASE_ANON_KEY = '...';
```
Replace with:
```js
const SUPABASE_URL = 'https://khcwfivaxwgetwcrbefd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3dmaXZheHdnZXR3Y3JiZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzIwNTcsImV4cCI6MjEwNTU0ODA1N30.TOY6mgJjiu21NlMCJ6f5fVbrwqj_d4P0B5cGjEJqOak';
```

- [ ] **Step 6: Syntax check**

Run: `node --check app.js`
Expected: no output (exit code 0).

- [ ] **Step 7: Verify no leftover old strings**

Run: `grep -n "apCash\|ap_cash\|Pen & Play\|sckgsgakyyosgjxoctlb" entry.html app.js`
Expected: no matches.

- [ ] **Step 8: Manual verification**

Start a local server and open the page:
```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/entry.html
```
In the browser: log in as Dhiraj with passkey `7486`. Fill in Cash =
1000, UPI = 200, Card = 300, Saving Cash = 400, Yesterday's Petty Cash
= 0. Confirm Petty Cash Amount auto-calculates to `600.00` (1000−400)
and Total Income to `1500.00` (1000+200+300−0). Click Save, confirm a
success message and no console errors (open DevTools). Then stop the
server: `kill %1`.

- [ ] **Step 9: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add entry.html app.js style.css
git commit -m "Add daily cash entry page, rebranded (Saving Cash, Bling & Bags)"
```

---

### Task 6: History (`history.html` + `history.js` + `history-style.css`)

**Files:**
- Create: `history.html`, `history.js`, `history-style.css`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/history.html`, `history.js`, `history-style.css`; reads the `daily_entries` rows Task 5 writes.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Copy the source files**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/history.html .
cp /Users/dhiraj/Documents/TestVibe/history.js .
cp /Users/dhiraj/Documents/TestVibe/history-style.css .
```

- [ ] **Step 2: Rebrand `history.html`**

Find:
```html
<h1>Pen & Play Club</h1>
```
Replace with:
```html
<h1>Bling & Bags</h1>
```

Find:
```html
<span class="mi-total-item">AP Cash: <strong id="totalCashSum">₹0.00</strong></span>
```
Replace with:
```html
<span class="mi-total-item">Saving Cash: <strong id="totalCashSum">₹0.00</strong></span>
```

- [ ] **Step 3: Rename "ap_cash"/"AP Cash" in `history.js`**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
perl -pi -e 's/\Qap_cash\E/saving_cash/g' history.js
perl -pi -e 's/\QAP Cash\E/Saving Cash/g' history.js
```

This covers: the `acc.cash += parseFloat(e.ap_cash || 0)` accumulator,
the "AP Cash:" detail label and its `entry.ap_cash` value, and the
WhatsApp share message's "AP Cash: ₹..." line.

- [ ] **Step 4: Rebrand the WhatsApp share message and link in `history.js`**

Find:
```js
let message = `*Pen & Play Cash Register - ${formattedDate}*
```
Replace with:
```js
let message = `*Bling & Bags Cash Register - ${formattedDate}*
```

Find:
```js
message += '\n\nFor Detailed data, Visit https://pen-and-play.vercel.app/index.html';
```
Replace with:
```js
message += '\n\nFor Detailed data, Visit https://bling-and-bags.vercel.app/index.html';
```
(This assumes the Vercel project in Task 13 is named `bling-and-bags`.
If Vercel assigns a different final domain because that name is taken,
come back and update this line to match before considering the app
fully done.)

- [ ] **Step 5: Substitute Supabase credentials in `history.js`**

Same as Task 5 Step 5 — find the `SUPABASE_URL`/`SUPABASE_ANON_KEY`
constant declarations and replace with the Global Constraints values.

- [ ] **Step 6: Syntax check**

Run: `node --check history.js`
Expected: no output.

- [ ] **Step 7: Verify no leftover old strings**

Run: `grep -n "ap_cash\|AP Cash\|Pen & Play\|pen-and-play" history.html history.js`
Expected: no matches.

- [ ] **Step 8: Manual verification**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/history.html
```
Confirm the entry saved in Task 5 (Step 8) appears in the list, its
"Saving Cash: ₹400.00" detail shows correctly, and no console errors.
`kill %1` when done.

- [ ] **Step 9: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add history.html history.js history-style.css
git commit -m "Add history page, rebranded (Saving Cash, Bling & Bags)"
```

---

### Task 7: Expenses (`expense.html` + `expense.js` + `expense-style.css`)

**Files:**
- Create: `expense.html`, `expense.js`, `expense-style.css`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/expense.html`, `expense.js`, `expense-style.css`; `window.washiAuth.getUsername()` from Task 4; writes to the `expenses` table from Task 2.
- Produces: `expenses` rows with shape `{ expense_date, expense_by, amount, paid_from, description, reimbursed }`.

- [ ] **Step 1: Copy the source files**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/expense.html .
cp /Users/dhiraj/Documents/TestVibe/expense.js .
cp /Users/dhiraj/Documents/TestVibe/expense-style.css .
```

- [ ] **Step 2: Rebrand `expense.html` title and heading**

Find:
```html
<title>Expenses - Pen & Play Club</title>
```
Replace with:
```html
<title>Expenses - Bling & Bags</title>
```

Find:
```html
<h1>Pen & Play Club</h1>
```
Replace with:
```html
<h1>Bling & Bags</h1>
```

- [ ] **Step 3: Replace the team `<option>` list (both occurrences)**

`expense.html` has this same four-option block twice (once in the
"add expense" form's dropdown, once in the history filter dropdown).
Find each occurrence of:
```html
                            <option value="Abhishek">Abhishek</option>
                            <option value="Neha">Neha</option>
                            <option value="Priyanka">Priyanka</option>
                            <option value="Dhiraj">Dhiraj</option>
```
Replace each with:
```html
                            <option value="Dhiraj">Dhiraj</option>
                            <option value="Pallavi">Pallavi</option>
```
(Indentation may differ slightly between the two blocks — match each
block's existing indentation; the important part is the option values
and text.)

- [ ] **Step 4: Rename the "AP Cash" paid-from option**

Find:
```html
<input type="checkbox" id="paidFromApCash" name="paidFrom" value="AP Cash">
AP Cash
```
Replace with:
```html
<input type="checkbox" id="paidFromSavingCash" name="paidFrom" value="Saving Cash">
Saving Cash
```

- [ ] **Step 5: Fix the hardcoded reimbursement-entry attribution in `expense.js`**

Find:
```js
        const reimbursementData = {
            expense_date: today,
            expense_by: 'Neha',
            amount: originalExpense.amount,
            paid_from: 'Bank',
            description: originalExpense.description || `Reimbursement for expense by ${originalExpense.expense_by}`,
            reimbursed: false
        };
```
Replace with:
```js
        const reimbursementData = {
            expense_date: today,
            expense_by: originalExpense.expense_by,
            amount: originalExpense.amount,
            paid_from: 'Bank',
            description: originalExpense.description || `Reimbursement for expense by ${originalExpense.expense_by}`,
            reimbursed: false
        };
```
(This is the deliberate behavior change documented in the spec: the
reimbursement Bank entry is now attributed to whoever filed the
original expense, not a hardcoded name.)

- [ ] **Step 6: Substitute Supabase credentials in `expense.js`**

Same as Task 5 Step 5.

- [ ] **Step 7: Syntax check**

Run: `node --check expense.js`
Expected: no output.

- [ ] **Step 8: Verify no leftover old strings**

Run: `grep -n "Abhishek\|Neha\|Priyanka\|AP Cash\|Pen & Play" expense.html expense.js`
Expected: no matches.

- [ ] **Step 9: Manual verification**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/expense.html
```
Add an expense: Spent By = Pallavi, Amount = 150, Paid From = Self,
Description = "test". Save, confirm it appears in the list with a
"Mark as Reimbursed" button (only shown for Self-paid expenses). Click
it, confirm the dialog, confirm the original entry now shows a
"Reimbursed" badge and a new Bank-paid entry appears attributed to
**Pallavi** (not a hardcoded name). Confirm the running total excludes
reimbursed expenses' double-count correctly. `kill %1` when done.

- [ ] **Step 10: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add expense.html expense.js expense-style.css
git commit -m "Add expense tracking page with reimbursement, rebranded for Dhiraj/Pallavi"
```

---

### Task 8: Statement (`statement.html` + `statement.js` + `statement-style.css`)

**Files:**
- Create: `statement.html`, `statement.js`, `statement-style.css`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/statement.html`, `statement.js`, `statement-style.css`; reads `daily_entries.saving_cash` (Task 5) and `expenses.paid_from`/`expenses.amount` (Task 7).

- [ ] **Step 1: Copy the source files**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/statement.html .
cp /Users/dhiraj/Documents/TestVibe/statement.js .
cp /Users/dhiraj/Documents/TestVibe/statement-style.css .
```

- [ ] **Step 2: Rebrand `statement.html`**

Find:
```html
<title>Statement - Pen & Play Club</title>
```
Replace with:
```html
<title>Statement - Bling & Bags</title>
```

Find:
```html
<h1>Pen & Play Club</h1>
```
Replace with:
```html
<h1>Bling & Bags</h1>
```

Find:
```html
<option value="AP Cash">AP Cash</option>
```
Replace with:
```html
<option value="Saving Cash">Saving Cash</option>
```

- [ ] **Step 3: Zero out the opening balances and rename the account key in `statement.js`**

Find:
```js
const SEED_OPENING = {
    'BoB':    122965.09,
    'AP Cash': -65662.00
};
```
Replace with:
```js
const SEED_OPENING = {
    'BoB':    0,
    'Saving Cash': 0
};
```

- [ ] **Step 4: Rename remaining "AP Cash"/"ap_cash" references in `statement.js`**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
perl -pi -e "s/\Q'AP Cash'\E/'Saving Cash'/g" statement.js
perl -pi -e 's/\Qap_cash\E/saving_cash/g' statement.js
```

This covers the `.select('date, upi_amount, card_amount, ap_cash')`
query column list, the `account === 'AP Cash'` branch check, the
`e.ap_cash` amount read in `fetchCredits()`, and the
`account === 'BoB' ? 'Bank' : 'AP Cash'` ternary in `fetchDebits()`.

- [ ] **Step 5: Substitute Supabase credentials in `statement.js`**

Same pattern as Task 5 Step 5 (note: this file's credential block may
be one line shorter than the others per the research — same constant
names either way, find and replace the two `const SUPABASE_*` lines).

- [ ] **Step 6: Syntax check**

Run: `node --check statement.js`
Expected: no output.

- [ ] **Step 7: Verify no leftover old strings**

Run: `grep -n "AP Cash\|ap_cash\|Pen & Play\|122965\|65662" statement.html statement.js`
Expected: no matches.

- [ ] **Step 8: Manual verification**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/statement.html
```
Select the "Saving Cash" account from the dropdown, confirm it loads
without a console error and the running balance starts from 0 (plus
whatever credits/debits exist from Tasks 5–7's test data). `kill %1`
when done.

- [ ] **Step 9: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add statement.html statement.js statement-style.css
git commit -m "Add statement page, rebranded (Saving Cash, zeroed opening balances)"
```

---

### Task 9: Dashboard (`index.html` + `dashboard.js` + `dashboard-style.css`)

**Files:**
- Create: `index.html`, `dashboard.js`, `dashboard-style.css`

**Interfaces:**
- Consumes: `/Users/dhiraj/Documents/TestVibe/index.html`, `dashboard.js`, `dashboard-style.css`; reads `daily_entries` rows from Task 5.

- [ ] **Step 1: Copy the source files**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
cp /Users/dhiraj/Documents/TestVibe/index.html .
cp /Users/dhiraj/Documents/TestVibe/dashboard.js .
cp /Users/dhiraj/Documents/TestVibe/dashboard-style.css .
```

- [ ] **Step 2: Rebrand `index.html`**

Find:
```html
<h1>Pen & Play Club</h1>
```
Replace with:
```html
<h1>Bling & Bags</h1>
```

- [ ] **Step 3: Rename "AP Cash"/"ap_cash" in `dashboard.js`**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
perl -pi -e "s/\QAP Cash\E/Saving Cash/g" dashboard.js
perl -pi -e 's/\Qap_cash\E/saving_cash/g' dashboard.js
```

This covers the `<span class="daily-detail-label">AP Cash</span>` and
the adjacent `entry.ap_cash` value display in the daily breakdown.

- [ ] **Step 4: Substitute Supabase credentials in `dashboard.js`**

Same pattern as Task 5 Step 5.

- [ ] **Step 5: Syntax check**

Run: `node --check dashboard.js`
Expected: no output.

- [ ] **Step 6: Verify no leftover old strings**

Run: `grep -n "AP Cash\|ap_cash\|Pen & Play" index.html dashboard.js`
Expected: no matches.

- [ ] **Step 7: Manual verification**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/index.html
```
Confirm the dashboard loads, shows the "Bling & Bags" header and logo,
renders charts without console errors, and the daily breakdown for
the test entry from Task 5 shows "Saving Cash: ₹400.00". `kill %1`
when done.

- [ ] **Step 8: Commit**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add index.html dashboard.js dashboard-style.css
git commit -m "Add dashboard page, rebranded (Saving Cash, Bling & Bags)"
```

---

### Task 10: Install npm dependencies

**Files:**
- Create (untracked, per Task 1's `.gitignore`): `node_modules/`

**Interfaces:**
- Consumes: `package.json`/`package-lock.json` from Task 1.
- Produces: the local `@vercel/speed-insights` package needed for the `/_vercel/speed-insights/script.js` tag already present in each ported HTML file's `<head>` to function once deployed (Vercel auto-detects and serves this route when the package is installed and the site is deployed via Vercel — no additional wiring needed).

- [ ] **Step 1: Install**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
npm install
```

- [ ] **Step 2: Verify**

Run: `git status --short`
Expected: no untracked `node_modules` entries shown (confirms
`.gitignore` is excluding it correctly). `ls node_modules` should show
the installed package.

No commit for this task — `node_modules` is gitignored.

---

### Task 11: Full local walkthrough

**Files:** none (verification-only task).

**Interfaces:**
- Consumes: every page from Tasks 4–9, wired together end-to-end.

- [ ] **Step 1: Serve the whole app and click through it fresh**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
python3 -m http.server 8765 &
open http://localhost:8765/index.html
```

- [ ] **Step 2: Clear stored auth and re-verify the login gate**

In the browser DevTools console, run `localStorage.clear()` and reload
`index.html`. Confirm the login overlay appears (title "Bling & Bags",
name dropdown showing only Dhiraj/Pallavi), and that entering the
wrong passkey shows an error while `7486` logs in successfully.

- [ ] **Step 3: Walk the full flow**

From the dashboard: navigate to Entry → save a new day's entry →
navigate to History → confirm it appears → navigate to Expenses → add
and reimburse one → navigate to Statement → confirm both accounts
("BoB" and "Saving Cash") load → back to Dashboard → confirm the new
entry's numbers appear in the charts. Confirm zero console errors
throughout.

- [ ] **Step 4: Stop the server**

```bash
kill %1
```

No commit for this task (verification-only; fix forward into the
relevant task's files and re-commit there if something's broken).

---

### Task 12: Push to GitHub

**Files:** none created — this task pushes the existing local repo.

**Interfaces:**
- Consumes: all commits from Tasks 1–9.

- [ ] **Step 1: Ask Dhiraj to create the empty GitHub repo**

He should go to https://github.com/new while logged into the
`rishidhiraj-cloud` account, name it `BlingAndBags`, set visibility to
**Private**, and **not** initialize it with a README/.gitignore/license
(the local repo already has commits — an auto-created README would
conflict). Confirm with him once it exists.

- [ ] **Step 2: Add the remote and push**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git remote add origin https://github.com/rishidhiraj-cloud/BlingAndBags.git
git branch -M main
git push -u origin main
```

If this prompts for credentials and fails, that means the git
credential helper that already works for TestVibe's `production`
remote isn't configured globally — ask Dhiraj how he authenticates git
pushes normally (SSH key vs. HTTPS token) and adjust the remote URL
(`git@github.com:rishidhiraj-cloud/BlingAndBags.git` for SSH) to
match.

- [ ] **Step 3: Verify**

Run: `git log origin/main --oneline -1`
Expected: shows the same commit hash as `git log main --oneline -1`.

No separate commit for this task.

---

### Task 13: Deploy to Vercel

**Files:**
- Create: `.vercel/project.json` (generated by the Vercel CLI, not hand-written — already covered by `.gitignore`'s existing `.vercel` entry from Task 1)

**Interfaces:**
- Consumes: the pushed GitHub repo from Task 12.
- Produces: a live URL — update Task 6's hardcoded share-link domain (`history.js`) afterward if the actual assigned domain differs from `bling-and-bags.vercel.app`.

- [ ] **Step 1: Link and deploy via the Vercel CLI**

```bash
cd /Users/dhiraj/Documents/BlingAndBags
vercel link --yes --project bling-and-bags
vercel --prod
```

This will prompt for confirmation the first time (which scope/team —
use the same one TestVibe's `pen-and-play` project is under,
`team_2hwU1eX56sqyX8angYd30L9X`, if offered as an option) — do not
proceed past an ambiguous prompt without checking with Dhiraj.

- [ ] **Step 2: Verify the deployment**

Run: `vercel ls bling-and-bags` (or open the URL printed by the
previous step) and confirm the dashboard loads over HTTPS, the login
gate appears, and it's reading/writing the same Supabase project
(check a value saved locally in Task 5 shows up on the deployed site).

- [ ] **Step 3: If the assigned domain differs from `bling-and-bags.vercel.app`**

Go back to `history.js` (Task 6, Step 4) and update the WhatsApp
share-link URL to match the real deployed domain, then:

```bash
cd /Users/dhiraj/Documents/BlingAndBags
git add history.js
git commit -m "Fix WhatsApp share link to match actual deployed Vercel domain"
git push
```

---

## Self-review notes

- **Spec coverage:** every "In scope" file from the spec has a task (auth.js: Task 4; entry: 5; history: 6; expense incl. reimbursement: 7; statement: 8; dashboard: 9; supporting files: 1; icons/logo: 3; DB: 2; repo/deploy: 12–13). Every "Rebranding rule" bullet is implemented in the task that owns its file(s). Opening balances and RLS-disabled decisions are both in Task 2/8.
- **Placeholder scan:** no TBD/"handle as needed" steps; the one genuinely unresolved value (final Vercel domain) is called out explicitly with a concrete fallback task (13, Step 3) rather than left vague.
- **Type/identifier consistency:** `saving_cash` (DB column, Task 2) matches `saving_cash` used in `app.js` (Task 5), `history.js` (Task 6), `statement.js` (Task 8), and `dashboard.js` (Task 9) — checked across all four. `expense_date`/`expense_by` (Task 2) matches what Task 7 reads/writes (verified against actual TestVibe `expense.js`, not just its README). `window.washiAuth.getUsername()` (Task 4) matches the exact call Task 7's delete-permission check uses.
