-- =====================================================
-- MICK'S BARBER SHOP - COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains the complete database schema for the barber shop
-- application with receipt upload and payment verification features.
-- 
-- Run this file to set up the entire database from scratch.
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS micks_barber;
USE micks_barber;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialty VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- APPOINTMENT SYSTEM
-- =====================================================

-- Create appointments table (without payment_id foreign key initially)
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- =====================================================
-- PAYMENT SYSTEM WITH RECEIPT UPLOAD
-- =====================================================

-- Create payments table with receipt upload support
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'gcash', 'paymaya', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'approved', 'rejected') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_reference VARCHAR(255) NULL,
    receipt_image VARCHAR(500) NULL,
    receipt_upload_date TIMESTAMP NULL,
    admin_verified_by INT NULL,
    admin_verification_date TIMESTAMP NULL,
    admin_notes TEXT NULL,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_verified_by) REFERENCES users(id) ON DELETE SET NULL
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

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraint for payment_id after payments table is created
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_payment_id 
FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Add index for receipt_upload_date for faster queries
CREATE INDEX idx_receipt_upload_date ON payments (receipt_upload_date);

-- Add index for appointment status for faster filtering
CREATE INDEX idx_appointment_status ON appointments (status);

-- Add index for payment status for faster filtering
CREATE INDEX idx_payment_status ON payments (payment_status);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample barbers
INSERT INTO barbers (name, email, phone, specialty, rating) VALUES
('Mike Johnson', 'mike@micksbarber.com', '09123456789', 'Classic Cuts', 4.8),
('Sarah Wilson', 'sarah@micksbarber.com', '09123456790', 'Modern Styles', 4.9),
('David Brown', 'david@micksbarber.com', '09123456791', 'Beard Trimming', 4.7);

-- Insert sample services
INSERT INTO services (name, description, price, duration) VALUES
('Classic Haircut', 'Traditional men\'s haircut with styling', 250.00, 30),
('Modern Fade', 'Contemporary fade with detailed styling', 350.00, 45),
('Beard Trim', 'Professional beard trimming and shaping', 150.00, 20),
('Hair Wash & Cut', 'Complete hair wash with cut and styling', 300.00, 40),
('Premium Package', 'Cut, wash, beard trim, and styling', 500.00, 60);

-- Insert sample admin user
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@micksbarber.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE barbers;
DESCRIBE services;
DESCRIBE appointments;
DESCRIBE payments;
DESCRIBE payment_methods;

-- =====================================================
-- FEATURES INCLUDED
-- =====================================================
-- ✅ User management (customers and admins)
-- ✅ Barber profiles with specialties and ratings
-- ✅ Service catalog with pricing and duration
-- ✅ Appointment booking system
-- ✅ Payment processing with multiple methods
-- ✅ Receipt image upload and storage
-- ✅ Admin payment verification system
-- ✅ Payment status tracking (pending, approved, rejected)
-- ✅ Foreign key relationships for data integrity
-- ✅ Performance indexes for fast queries
-- ✅ Sample data for testing

-- =====================================================
-- UPLOAD DIRECTORY SETUP
-- =====================================================
-- Note: Make sure to create the uploads directory structure:
-- backend/uploads/receipts/
-- 
-- This directory will store uploaded receipt images.
-- The backend server will automatically create this directory if it doesn't exist.

-- =====================================================
-- COMPLETE SETUP FINISHED
-- =====================================================
-- Your database is now ready for the Mick's Barber Shop application!
-- All tables, relationships, and sample data have been created.
