const path = require('path');
const express = require('express');
const expensesRouter = require('./routes/expenses');

function createApp(db) {
  const app = express();

  app.use(express.json());
  app.locals.db = db;

  // Mount routes
  app.use('/api/expenses', expensesRouter);
  app.use('/api', expensesRouter); // Also mount at /api for routes like /api/summary if needed

  // Serve public/
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };
