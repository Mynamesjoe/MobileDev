const mysql = require('mysql2');

// Test database connection and data
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP MySQL password (empty)
  database: 'micks_barber'
});

console.log('Testing database connection...');

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Test barbers table
  db.query('SELECT * FROM barbers', (err, results) => {
    if (err) {
      console.error('Error querying barbers:', err);
    } else {
      console.log('Barbers found:', results.length);
      console.log('Barbers data:', results);
    }
  });

  // Test services table
  db.query('SELECT * FROM services', (err, results) => {
    if (err) {
      console.error('Error querying services:', err);
    } else {
      console.log('Services found:', results.length);
      console.log('Services data:', results);
    }
  });

  db.end();
});
