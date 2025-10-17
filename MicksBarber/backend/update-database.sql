-- Update database with payment-related tables
-- Run this script to add payment functionality to existing database

USE micks_barber;

-- Add payment-related columns to appointments table
ALTER TABLE appointments 
ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN payment_id INT NULL;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'gcash', 'paymaya', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_reference VARCHAR(255) NULL,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payment_methods table for user's saved payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    method_type ENUM('card', 'gcash', 'paymaya', 'bank_account') NOT NULL,
    method_name VARCHAR(100) NOT NULL, -- e.g., "My Visa Card", "GCash - 09123456789"
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add foreign key constraint for payment_id in appointments table
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_payment_id 
FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Update existing appointments with default values
UPDATE appointments 
SET total_amount = (
    SELECT s.price 
    FROM services s 
    WHERE s.id = appointments.service_id
),
payment_status = 'pending'
WHERE total_amount = 0.00;
