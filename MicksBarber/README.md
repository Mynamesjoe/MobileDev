# Mick's Barber - React Native App with MySQL Backend

A React Native Expo app for Mick's Barbershop with MySQL database integration.

## Features

- **Landing Page**: Welcome screen with professional design
- **User Authentication**: Login and registration with secure password hashing
- **MySQL Database**: Full database integration with Express.js backend
- **Modern UI**: Clean, minimal design with grey, white, black, and red accent colors

## Project Structure

```
MicksBarber/
├── app/                    # React Native app screens
│   ├── index.tsx          # Landing page
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   └── _layout.tsx        # App navigation layout
├── backend/               # Node.js Express backend
│   ├── server.js          # Main server file
│   ├── routes/
│   │   └── auth.js        # Authentication routes
│   ├── database.sql       # Database schema and sample data
│   └── package.json       # Backend dependencies
├── services/
│   └── api.ts             # API service for frontend
├── constants/
│   └── Theme.ts           # App theme and styling
└── package.json           # Frontend dependencies
```

## Setup Instructions

### Prerequisites

1. **XAMPP**: Make sure XAMPP is installed and running
2. **Node.js**: Install Node.js (version 14 or higher)
3. **Expo CLI**: Install Expo CLI globally
   ```bash
   npm install -g @expo/cli
   ```

### Database Setup

1. **Start XAMPP**: Start Apache and MySQL services in XAMPP Control Panel

2. **Create Database**: 
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Import the `backend/database.sql` file to create the database and tables
   - Or run the SQL commands manually in phpMyAdmin

3. **Database Configuration**:
   - Database name: `micks_barber`
   - Username: `root`
   - Password: (empty - default XAMPP setup)
   - Host: `localhost`
   - Port: `3306`

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to main project directory**:
   ```bash
   cd ..  # (if you're in the backend directory)
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `w` for web, `a` for Android, `i` for iOS

## API Endpoints

### Authentication

- **POST** `/api/auth/register`
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ "success": boolean, "message": "string", "user": object }`

- **POST** `/api/auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "success": boolean, "message": "string", "user": object }`

## Database Schema

### Tables

1. **users**: Customer information
   - id, name, email, password, created_at, updated_at

2. **barbers**: Barber information
   - id, name, email, phone, specialty, rating, created_at, updated_at

3. **services**: Available services
   - id, name, description, price, duration, created_at, updated_at

4. **appointments**: Booking information
   - id, user_id, barber_id, service_id, appointment_date, appointment_time, status, notes, created_at, updated_at

## Development

### Backend Development
- Server runs on port 3000
- Uses Express.js with MySQL2 for database connection
- CORS enabled for cross-origin requests
- Password hashing with bcrypt

### Frontend Development
- Built with React Native and Expo
- Uses Expo Router for navigation
- Axios for API communication
- TypeScript support

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure XAMPP MySQL is running
   - Check database credentials in `backend/server.js`
   - Verify database exists and tables are created

2. **API Connection Issues**:
   - Ensure backend server is running on port 3000
   - Check if CORS is properly configured
   - Verify API endpoints in `services/api.ts`

3. **Expo Issues**:
   - Clear cache: `npm start -- --clear`
   - Reset project: `npm run reset-project`
   - Check Expo Go app is updated

## Next Steps

- Add JWT authentication tokens
- Implement appointment booking functionality
- Add barber and service management
- Create admin dashboard
- Add push notifications
- Implement payment integration