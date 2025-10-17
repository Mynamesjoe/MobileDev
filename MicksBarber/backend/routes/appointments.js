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

// Get all appointments (admin function)
router.get('/', (req, res) => {
  console.log('Admin appointments route hit!');
  
  const getAllAppointmentsQuery = `
    SELECT 
      a.*,
      u.name as user_name,
      b.name as barber_name,
      s.name as service_name,
      s.price as service_price
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN services s ON a.service_id = s.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;
  
  console.log('Executing query:', getAllAppointmentsQuery);
  
  db.query(getAllAppointmentsQuery, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    console.log('Query successful, returning', results.length, 'appointments');
    res.json({
      success: true,
      data: results
    });
  });
});

// Get appointments for a specific user
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const getAppointmentsQuery = `
    SELECT 
      a.*,
      b.name as barber_name,
      s.name as service_name,
      s.price
    FROM appointments a
    JOIN barbers b ON a.barber_id = b.id
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;
  
  db.query(getAppointmentsQuery, [userId], (err, results) => {
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

// Create new appointment
router.post('/', (req, res) => {
  const { 
    user_id, 
    barber_id, 
    service_id, 
    appointment_date, 
    appointment_time, 
    notes, 
    total_amount, 
    payment_status 
  } = req.body;

  // Validate input
  if (!user_id || !barber_id || !service_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  const createAppointmentQuery = `
    INSERT INTO appointments (
      user_id, 
      barber_id, 
      service_id, 
      appointment_date, 
      appointment_time, 
      notes, 
      total_amount, 
      payment_status, 
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(createAppointmentQuery, [
    user_id, 
    barber_id, 
    service_id, 
    appointment_date, 
    appointment_time, 
    notes || '', 
    total_amount || 0,
    payment_status || 'pending'
  ], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create appointment' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: result.insertId
    });
  });
});

// Update appointment status
router.put('/:id/status', (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid status is required' 
    });
  }

  const updateStatusQuery = 'UPDATE appointments SET status = ? WHERE id = ?';
  
  db.query(updateStatusQuery, [status, appointmentId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update appointment status' 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  });
});

// Cancel appointment
router.put('/:id/cancel', (req, res) => {
  const appointmentId = req.params.id;
  const updateStatusQuery = 'UPDATE appointments SET status = "cancelled" WHERE id = ?';
  
  db.query(updateStatusQuery, [appointmentId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel appointment' 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  });
});

// Update appointment
router.put('/:id', (req, res) => {
  const appointmentId = req.params.id;
  const { payment_status, payment_id } = req.body;
  
  console.log('Updating appointment:', appointmentId, { payment_status, payment_id });
  
  const updateQuery = `
    UPDATE appointments 
    SET payment_status = ?, payment_id = ?
    WHERE id = ?
  `;
  
  db.query(updateQuery, [payment_status, payment_id, appointmentId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update appointment' 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });
  });
});

module.exports = router;
