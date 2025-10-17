const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'micks_barber'
});

// Test payment system
async function testPaymentSystem() {
  console.log('🧪 Testing Payment System...\n');

  try {
    // Test 1: Check if payment tables exist
    console.log('1. Checking payment tables...');
    
    const tables = await new Promise((resolve, reject) => {
      db.query("SHOW TABLES LIKE 'payments'", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (tables.length > 0) {
      console.log('✅ Payments table exists');
    } else {
      console.log('❌ Payments table missing');
    }

    const paymentMethods = await new Promise((resolve, reject) => {
      db.query("SHOW TABLES LIKE 'payment_methods'", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (paymentMethods.length > 0) {
      console.log('✅ Payment methods table exists');
    } else {
      console.log('❌ Payment methods table missing');
    }

    // Test 2: Check appointments table structure
    console.log('\n2. Checking appointments table structure...');
    
    const appointmentColumns = await new Promise((resolve, reject) => {
      db.query("DESCRIBE appointments", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const hasPaymentFields = appointmentColumns.some(col => 
      ['total_amount', 'payment_status', 'payment_id'].includes(col.Field)
    );

    if (hasPaymentFields) {
      console.log('✅ Appointments table has payment fields');
    } else {
      console.log('❌ Appointments table missing payment fields');
    }

    // Test 3: Test payment method creation
    console.log('\n3. Testing payment method creation...');
    
    const testUserId = 1; // Assuming user with ID 1 exists
    
    const insertPaymentMethod = `
      INSERT INTO payment_methods (user_id, method_type, method_name, is_default)
      VALUES (?, 'gcash', 'Test GCash Account', true)
    `;
    
    try {
      await new Promise((resolve, reject) => {
        db.query(insertPaymentMethod, [testUserId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Payment method created successfully');
    } catch (error) {
      console.log('❌ Failed to create payment method:', error.message);
    }

    // Test 4: Test payment creation
    console.log('\n4. Testing payment creation...');
    
    const testAppointmentId = 1; // Assuming appointment with ID 1 exists
    
    const insertPayment = `
      INSERT INTO payments (appointment_id, user_id, amount, payment_method, payment_status)
      VALUES (?, ?, 250.00, 'gcash', 'completed')
    `;
    
    try {
      const paymentResult = await new Promise((resolve, reject) => {
        db.query(insertPayment, [testAppointmentId, testUserId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      console.log('✅ Payment created successfully with ID:', paymentResult.insertId);
    } catch (error) {
      console.log('❌ Failed to create payment:', error.message);
    }

    // Test 5: Test payment retrieval
    console.log('\n5. Testing payment retrieval...');
    
    const getPayments = `
      SELECT p.*, a.appointment_date, a.appointment_time, s.name as service_name
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      JOIN services s ON a.service_id = s.id
      WHERE p.user_id = ?
    `;
    
    try {
      const payments = await new Promise((resolve, reject) => {
        db.query(getPayments, [testUserId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      console.log('✅ Retrieved', payments.length, 'payments');
    } catch (error) {
      console.log('❌ Failed to retrieve payments:', error.message);
    }

    console.log('\n🎉 Payment system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    db.end();
  }
}

// Run the test
testPaymentSystem();
