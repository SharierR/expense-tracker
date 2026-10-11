const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function createDb(dbPath) {
  const fullPath = dbPath || path.join(__dirname, '..', 'data', 'expenses.db');
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(fullPath);
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  return db;
}

module.exports = { createDb, db: createDb() };
