# Expense Tracker

A simple, explainable full-stack expense tracker built with Node.js, Express, and SQLite.

## Features
- Add, list, filter (by category), and delete expenses
- Summary with totals and this month's spending
- Category bars for quick visualization
- Server-side validation with clear error messages

## Tech Stack
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Frontend: Vanilla HTML/CSS/JS
- Tests: Node's built-in test runner + supertest

## Project Structure
- server.js
- src/app.js
- src/db.js
- src/routes/expenses.js
- public/
- test/

## Running Locally
1. Install deps: 
pm install
2. Start server: 
pm start
3. Open http://localhost:3000

## Running Tests

pm test

## API Reference
- GET /api/expenses
- GET /api/expenses?category=<food|transport|shopping|bills|other>
- POST /api/expenses {amount, category, date, note}
- DELETE /api/expenses/:id
- GET /api/summary

## Deployment
- Render (free): use web service, build 
pm install, start 
pm start, set PORT
- Railway (free): deploy from repo, auto-detect Node

## Future Ideas
- Auth, budgets, CSV export

## Credits
Built as a portfolio project.
