const express = require('express');
const router = express.Router();

const VALID_CATEGORIES = ['food', 'transport', 'shopping', 'bills', 'other'];

function isValidDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(date.getTime())) return false;
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  return true;
}

router.get('/', (req, res) => {
  const category = req.query.category;
  let expenses;

  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const stmt = req.app.locals.db.prepare('SELECT * FROM expenses WHERE category = ? ORDER BY date DESC, id DESC');
    expenses = stmt.all(category);
  } else {
    const stmt = req.app.locals.db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    expenses = stmt.all();
  }

  res.json(expenses);
});

router.post('/', (req, res) => {
  const { amount, date, category, note, description } = req.body;
  const noteValue = note || description || '';

  // Validation
  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const amountNum = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (!date || !isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (noteValue === undefined || noteValue === null) {
    return res.status(400).json({ error: 'Invalid note' });
  }

  try {
    const stmt = req.app.locals.db.prepare(
      'INSERT INTO expenses (amount, date, category, description) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(amountNum, date, category, noteValue);
    const inserted = req.app.locals.db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const stmt = req.app.locals.db.prepare('SELECT * FROM expenses WHERE id = ?');
  const expense = stmt.get(id);
  if (!expense) {
    return res.status(404).json({ error: 'Not found' });
  }

  const deleteStmt = req.app.locals.db.prepare('DELETE FROM expenses WHERE id = ?');
  deleteStmt.run(id);
  res.status(204).send();
});

router.get('/summary', (req, res) => {
  const totalStmt = req.app.locals.db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
  const total = totalStmt.get().total;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthStart = `${year}-${month}-01`;
  const monthEnd = `${year}-${month}-31`; // Simple approach, works for typical months
  // Better: calculate last day
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const monthEndProper = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  
  const monthStmt = req.app.locals.db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as monthTotal FROM expenses WHERE date >= ? AND date <= ?'
  );
  const monthTotal = monthStmt.get(monthStart, monthEndProper).monthTotal;

  res.json({ total, monthTotal });
});

module.exports = router;
