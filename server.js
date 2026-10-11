const db = require('./db');
const app = require('./app')({ db: db.db || db });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
