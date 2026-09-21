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

Deployed on Vercel. Note: GitHub auto-deploy is not yet connected —
deploy manually with `vercel --prod` until the Vercel dashboard's
GitHub connection is set up.
