const { createApp } = require('./src/app');
const { createDb } = require('./src/db');
const db = createDb();
const app = createApp(db);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
