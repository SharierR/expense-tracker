# Expense Tracker — Design Spec

Date: 2026-10-11
Status: Approved in chat (pending written-spec review)
Author: Sharier Kamal (with AI assistance)

## 1. Purpose

A portfolio project that demonstrates full-stack fundamentals for internship
and junior-developer applications:

- REST API design (resource naming, status codes, validation, error handling)
- Database persistence (SQLite)
- Frontend/backend integration over `fetch`
- Clean project structure a reviewer can read in one sitting

The whole app must be small enough that Sharier can explain every line in an
interview. No auth, no budgets, no multi-user — those are future ideas only.

## 2. Scope

**In scope (v1):**

- Create, list, filter, and delete expenses
- Summary of total spending and per-category spending
- Server-side validation with clear JSON errors
- SQLite persistence
- Simple category bar chart (pure CSS, no chart library)
- 3–4 API tests using Node's built-in test runner
- README with screenshot, API docs, and free-tier deploy guide (Render/Railway)

**Out of scope (v1):** authentication, budgets, category editor, CSV export,
currency conversion, Docker.

## 3. Architecture

- **Backend:** Node.js + Express, `better-sqlite3` for storage
- **Frontend:** plain HTML/CSS/JS in `public/`, served statically by Express
- **Runtime deps:** `express`, `better-sqlite3` (only two)
- **Dev deps:** `supertest` (for API tests against an in-memory DB)
- Language: CommonJS (no build step, simplest to follow)

### Why these choices

| Choice | Why |
|---|---|
| better-sqlite3 | Single-file DB, zero external setup, synchronous API = easy to reason about; real SQL |
| Vanilla frontend | No build tooling; every line of the UI is readable; matches Sharier's current skill level |
| CommonJS | Avoids ESM/bundler confusion for a junior-portfolio app |

## 4. Data model

Expense:

| Field | Type | Rules |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| amount | REAL | required, > 0, max 2 decimals via validation |
| category | TEXT | required, one of fixed set |
| note | TEXT | optional, trimmed, max 100 chars |
| date | TEXT | required, `YYYY-MM-DD` |

Fixed categories: `food`, `transport`, `shopping`, `bills`, `other`.

Schema (created on first run in `data/expenses.db`):

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  amount   REAL    NOT NULL CHECK (amount > 0),
  category TEXT    NOT NULL,
  note     TEXT    NOT NULL DEFAULT '',
  date     TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
```

`schema.sql` is loaded as a template so a fresh install always matches the
schema the app expects.

## 5. REST API

Base URL: `/api`

| Method | Path | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | `/api/expenses` | List all, optional `?category=` | 200 array | 400 unknown category value |
| POST | `/api/expenses` | Create expense | 201 created object | 400 invalid body |
| DELETE | `/api/expenses/:id` | Delete expense | 204 no content | 404 not found, 400 bad id |
| GET | `/api/summary` | Totals | 200 `{ total, monthTotal, byCategory }` | — |

Validation rules (POST):
- `amount`: number, finite, > 0, rounded to ≤ 2 decimals
- `category`: string, must be in fixed set
- `note`: optional string, trimmed, ≤ 100 chars
- `date`: string matching `^\d{4}-\d{2}-\d{2}$` and a real calendar date

Error shape: `{ "error": "human-readable message" }`.

`GET /api/expenses` orders by `date DESC, id DESC`. `?category=` filters
exactly; an unknown category value returns 400 (not an empty list).

`GET /api/summary` returns:
```json
{
  "total": 1234.5,
  "monthTotal": 345.0,
  "byCategory": { "food": 500, "transport": 200 }
}
```
`monthTotal` compares against the current local month.

## 6. Frontend

Single page, three sections:

1. **Add form** — amount, category select, note, date (defaults to today),
   submit via `fetch` POST; inline success/error message.
2. **Summary** — two cards (Total spent, This month) and a category bar chart
   rendered as plain `<div>` bars (width % of max category total), plus a
   category filter dropdown re-rendering the list.
3. **Expense list** — table grouped by date; each row has a Delete button that
   sends DELETE then re-renders.

Error handling on the client: non-2xx responses show the server's `error`
text under the relevant UI section. Empty states ("No expenses yet") are
explicit.

Accessibility basics: labeled inputs, buttons are real `<button>` elements,
the filter is a real `<select>`. No framework.

## 7. Project structure

```
expense-tracker/
  server.js              # entry: create app, serve /api + public/, start listen
  src/
    app.js               # express app factory (importable for tests)
    db.js                # opens SQLite, runs schema.sql
    routes/expenses.js   # the 4 endpoints
  public/
    index.html
    style.css
    app.js
  data/                  # sqlite db lives here (gitignored)
  test/
    expenses.test.js     # node:test + supertest, in-memory :memory: DB
  schema.sql
  .gitignore
  README.md
  docs/superpowers/specs/2026-10-11-expense-tracker-design.md
```

`app.js` is a factory (`createApp(db)`) so tests inject a fresh in-memory DB
and the server file just wires real details. This keeps logic and wiring
separate (testable without refactoring).

## 8. Error handling

- Route-level helpers produce `{ error }` JSON with correct status codes.
- `express.json()` body parse failures → 400 with `{ error: "Invalid JSON body" }`.
- Unknown `/api/*` route → 404 `{ error: "Not found" }`.
- SQLite errors are caught by a small wrapper; 500 response never leaks
  internal details.
- Frontend always branches on `response.ok`.

## 9. Testing

`node --test test/`, uses `node:test` + `supertest` against `createApp` with a
`:memory:` DB. Cases:

1. POST valid expense → 201, body echoes created row with id
2. POST invalid (negative amount / bad category / bad date) → 400 + error
3. GET list + `?category=` filter
4. DELETE existing → 204; DELETE missing → 404
5. GET summary totals correct after seeding

Coverage goal: the API routes — the small surface that matters. No UI test
framework in v1.

## 10. README & deliverables

README.md sections: title + one-liner, screenshot, features, tech stack,
project structure, running locally, running tests, API reference, deployment
to Render (free) and Railway (free), future ideas. Honest "built with guidance
from AI pair programming" note in the credits — matches how the Game was made
and reads well to recruiters.

Deployment note (documented, not configured): free-tier hosting only. The
app listens on `process.env.PORT || 3000` so Render/Railway are one-click.

## 11. Future ideas (README only)

Auth + per-user expenses, budgets and alerts, CSV import/export, mobile
layout polish, category editor.

## 12. Non-goals

No auth, no Docker, no TypeScript, no bundler — the point is a readable,
complete, honestly-scoped full-stack app.