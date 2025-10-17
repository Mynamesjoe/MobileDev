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

// Get all services
router.get('/', (req, res) => {
  const getServicesQuery = 'SELECT * FROM services ORDER BY price ASC';
  
  db.query(getServicesQuery, (err, results) => {
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

// Get service by ID
router.get('/:id', (req, res) => {
  const serviceId = req.params.id;
  const getServiceQuery = 'SELECT * FROM services WHERE id = ?';
  
  db.query(getServiceQuery, [serviceId], (err, results) => {
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
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

module.exports = router;
