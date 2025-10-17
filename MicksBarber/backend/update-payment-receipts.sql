-- Update database for receipt upload functionality
-- Run this script to add receipt upload support to existing database

USE micks_barber;

-- Add receipt-related columns to payments table
ALTER TABLE payments 
ADD COLUMN receipt_image VARCHAR(500) NULL,
ADD COLUMN receipt_upload_date TIMESTAMP NULL,
ADD COLUMN admin_verified_by INT NULL,
ADD COLUMN admin_verification_date TIMESTAMP NULL,
ADD COLUMN admin_notes TEXT NULL;

-- Update payment_status enum to include new statuses
ALTER TABLE payments 
MODIFY COLUMN payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'approved', 'rejected') DEFAULT 'pending';

-- Add foreign key constraint for admin_verified_by
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_admin_verified_by 
FOREIGN KEY (admin_verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create uploads directory structure (this will be handled by the application)
-- The uploads/receipts directory will be created automatically by the upload route

-- Update existing payments to have default values
UPDATE payments 
SET receipt_upload_date = created_at 
WHERE receipt_image IS NOT NULL;

-- Add index for better performance on payment verification queries
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_admin_verified ON payments(admin_verified_by);
CREATE INDEX idx_payments_upload_date ON payments(receipt_upload_date);
