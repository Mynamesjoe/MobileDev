const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP MySQL password (empty)
  database: 'micks_barber'
});

// Get all barbers
router.get('/', (req, res) => {
  const getBarbersQuery = 'SELECT * FROM barbers ORDER BY rating DESC';
  
  db.query(getBarbersQuery, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// Get barber by ID
router.get('/:id', (req, res) => {
  const barberId = req.params.id;
  const getBarberQuery = 'SELECT * FROM barbers WHERE id = ?';
  
  db.query(getBarberQuery, [barberId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Barber not found' 
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

module.exports = router;
