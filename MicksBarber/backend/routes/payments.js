const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'micks_barber'
});

// Get all payments for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT p.*, a.appointment_date, a.appointment_time, a.status as appointment_status,
           s.name as service_name, s.price as service_price,
           b.name as barber_name
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.json(results);
  });
});

// Get payment by ID
router.get('/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  const query = `
    SELECT p.*, a.appointment_date, a.appointment_time, a.status as appointment_status,
           s.name as service_name, s.price as service_price,
           b.name as barber_name, u.name as user_name
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;
  
  db.query(query, [paymentId], (err, results) => {
    if (err) {
      console.error('Error fetching payment:', err);
      return res.status(500).json({ error: 'Failed to fetch payment' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(results[0]);
  });
});

// Get payment by appointment ID
router.get('/appointment/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  
  const query = `
    SELECT p.*, a.appointment_date, a.appointment_time, a.status as appointment_status,
           s.name as service_name, s.price as service_price,
           b.name as barber_name, u.name as user_name
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN users u ON p.user_id = u.id
    WHERE p.appointment_id = ?
  `;
  
  db.query(query, [appointmentId], (err, results) => {
    if (err) {
      console.error('Error fetching payment by appointment:', err);
      return res.status(500).json({ error: 'Failed to fetch payment' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Payment not found for this appointment' });
    }
    res.json(results[0]);
  });
});

// Create a new payment
router.post('/', (req, res) => {
  const { 
    appointment_id, 
    user_id, 
    amount, 
    payment_method, 
    transaction_id, 
    payment_reference,
    receipt_image 
  } = req.body;
  
  // Validate required fields
  if (!appointment_id || !user_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = `
    INSERT INTO payments (
      appointment_id, 
      user_id, 
      amount, 
      payment_method, 
      transaction_id, 
      payment_reference, 
      receipt_image,
      receipt_upload_date,
      payment_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  
  const receiptUploadDate = receipt_image ? new Date() : null;
  
  db.query(query, [
    appointment_id, 
    user_id, 
    amount, 
    payment_method, 
    transaction_id, 
    payment_reference,
    receipt_image,
    receiptUploadDate
  ], (err, result) => {
    if (err) {
      console.error('Error creating payment:', err);
      return res.status(500).json({ error: 'Failed to create payment' });
    }
    
    const paymentId = result.insertId;
    
    // Update appointment with payment info
    const updateAppointmentQuery = `
      UPDATE appointments 
      SET payment_id = ?, total_amount = ?, payment_status = 'pending'
      WHERE id = ?
    `;
    
    db.query(updateAppointmentQuery, [paymentId, amount, appointment_id], (err) => {
      if (err) {
        console.error('Error updating appointment:', err);
        return res.status(500).json({ error: 'Failed to update appointment' });
      }
      
      res.json({ 
        id: paymentId, 
        message: 'Payment created successfully',
        payment_status: 'pending'
      });
    });
  });
});

// Update payment status
router.put('/:paymentId/status', (req, res) => {
  const { paymentId } = req.params;
  const { payment_status, payment_date } = req.body;
  
  if (!payment_status) {
    return res.status(400).json({ error: 'Payment status is required' });
  }
  
  const query = `
    UPDATE payments 
    SET payment_status = ?, payment_date = ?
    WHERE id = ?
  `;
  
  db.query(query, [payment_status, payment_date || new Date(), paymentId], (err, result) => {
    if (err) {
      console.error('Error updating payment status:', err);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update appointment payment status
    const updateAppointmentQuery = `
      UPDATE appointments 
      SET payment_status = ?
      WHERE payment_id = ?
    `;
    
    db.query(updateAppointmentQuery, [payment_status, paymentId], (err) => {
      if (err) {
        console.error('Error updating appointment payment status:', err);
        return res.status(500).json({ error: 'Failed to update appointment payment status' });
      }
      
      res.json({ message: 'Payment status updated successfully' });
    });
  });
});

// Get user's payment methods
router.get('/methods/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT * FROM payment_methods 
    WHERE user_id = ? AND is_active = TRUE
    ORDER BY is_default DESC, created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching payment methods:', err);
      return res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
    res.json(results);
  });
});

// Add a new payment method
router.post('/methods', (req, res) => {
  const { user_id, method_type, method_name, is_default } = req.body;
  
  if (!user_id || !method_type || !method_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // If this is set as default, unset other defaults
  if (is_default) {
    const unsetDefaultQuery = 'UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?';
    db.query(unsetDefaultQuery, [user_id], (err) => {
      if (err) {
        console.error('Error unsetting default payment method:', err);
        return res.status(500).json({ error: 'Failed to update payment methods' });
      }
    });
  }
  
  const query = `
    INSERT INTO payment_methods (user_id, method_type, method_name, is_default)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [user_id, method_type, method_name, is_default || false], (err, result) => {
    if (err) {
      console.error('Error adding payment method:', err);
      return res.status(500).json({ error: 'Failed to add payment method' });
    }
    
    res.json({ 
      id: result.insertId, 
      message: 'Payment method added successfully' 
    });
  });
});

// Update payment method
router.put('/methods/:methodId', (req, res) => {
  const { methodId } = req.params;
  const { method_name, is_default, is_active } = req.body;
  
  const query = `
    UPDATE payment_methods 
    SET method_name = ?, is_default = ?, is_active = ?
    WHERE id = ?
  `;
  
  db.query(query, [method_name, is_default, is_active, methodId], (err, result) => {
    if (err) {
      console.error('Error updating payment method:', err);
      return res.status(500).json({ error: 'Failed to update payment method' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    res.json({ message: 'Payment method updated successfully' });
  });
});

// Delete payment method
router.delete('/methods/:methodId', (req, res) => {
  const { methodId } = req.params;
  
  const query = 'UPDATE payment_methods SET is_active = FALSE WHERE id = ?';
  
  db.query(query, [methodId], (err, result) => {
    if (err) {
      console.error('Error deleting payment method:', err);
      return res.status(500).json({ error: 'Failed to delete payment method' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    res.json({ message: 'Payment method deleted successfully' });
  });
});

// Admin: Get all pending payments for verification
router.get('/admin/pending', (req, res) => {
  const query = `
    SELECT p.*, a.appointment_date, a.appointment_time, a.status as appointment_status,
           s.name as service_name, s.price as service_price,
           b.name as barber_name, u.name as user_name, u.email as user_email
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN users u ON p.user_id = u.id
    WHERE p.payment_status = 'pending'
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching pending payments:', err);
      return res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
    res.json(results);
  });
});

// Admin: Verify payment (approve/reject)
router.put('/:paymentId/verify', (req, res) => {
  const { paymentId } = req.params;
  const { admin_id, status, notes } = req.body;
  
  if (!admin_id || !status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Missing required fields or invalid status' });
  }
  
  const query = `
    UPDATE payments 
    SET payment_status = ?, admin_verified_by = ?, admin_verification_date = ?, admin_notes = ?
    WHERE id = ?
  `;
  
  db.query(query, [status, admin_id, new Date(), notes || null, paymentId], (err, result) => {
    if (err) {
      console.error('Error verifying payment:', err);
      return res.status(500).json({ error: 'Failed to verify payment' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update appointment payment status
    const updateAppointmentQuery = `
      UPDATE appointments 
      SET payment_status = ?
      WHERE payment_id = ?
    `;
    
    db.query(updateAppointmentQuery, [status, paymentId], (err) => {
      if (err) {
        console.error('Error updating appointment payment status:', err);
        return res.status(500).json({ error: 'Failed to update appointment payment status' });
      }
      
      res.json({ 
        message: `Payment ${status} successfully`,
        payment_status: status
      });
    });
  });
});

module.exports = router;
