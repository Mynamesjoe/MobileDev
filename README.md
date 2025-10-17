# Mick's Barber - Mobile Barbershop Management System

A modern, full-stack mobile application for barbershop management with React Native frontend and Node.js backend.

## 🚀 Features

### Customer Features
- **Modern Dashboard** - Beautiful, animated interface with service listings
- **Easy Booking** - Intuitive appointment scheduling with date/time picker
- **Receipt Upload** - Photo-based payment verification system
- **Appointment History** - View past and upcoming appointments
- **Receipt Viewer** - View uploaded payment receipts

### Admin Features
- **Dashboard Overview** - Real-time appointment and payment statistics
- **Appointment Management** - View and manage all customer appointments
- **Payment Verification** - Approve/reject payment receipts
- **Receipt Management** - View and verify customer payment receipts

### Technical Features
- **Cross-Platform** - Works on both iOS and Android
- **Real-time Updates** - Live appointment and payment status updates
- **Secure Authentication** - User login and registration system
- **File Upload** - Receipt image upload and storage
- **Responsive Design** - Optimized for all screen sizes

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation between screens
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **React Native Animated** - Smooth animations and transitions

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📱 Screenshots

### Customer Dashboard
- Modern animated interface
- Service listings with pricing
- Easy booking system
- Appointment history

### Admin Dashboard
- Real-time statistics
- Appointment management
- Payment verification
- Receipt viewer

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Expo CLI
- React Native development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mynamesjoe/MobileDev.git
   cd MobileDev
   ```

2. **Backend Setup**
   ```bash
   cd MicksBarber/backend
   npm install
   ```

3. **Database Setup**
   - Import the `final-database.sql` file into your MySQL database
   - Update database connection settings in `server.js`

4. **Start Backend Server**
   ```bash
   npm start
   ```

5. **Frontend Setup**
   ```bash
   cd MicksBarber
   npm install
   ```

6. **Start Frontend**
   ```bash
   npx expo start
   ```

## 📊 Database Schema

### Core Tables
- **users** - User accounts (customers and admins)
- **barbers** - Barber information and specialties
- **services** - Available services and pricing
- **appointments** - Booking information and status
- **payments** - Payment records and receipt storage

### Key Features
- **Receipt Upload System** - Customers upload payment photos
- **Admin Verification** - Manual payment approval process
- **Appointment Tracking** - Complete booking lifecycle management

## 🎨 Design Features

### Modern UI/UX
- **Animated Interfaces** - Smooth entrance and transition animations
- **Gradient Backgrounds** - Professional red-to-maroon color scheme
- **Card-based Layout** - Clean, organized information display
- **Responsive Design** - Optimized for all device sizes

### Color Scheme
- **Primary**: Red (#8B0000) - Brand color
- **Secondary**: Light Red (#FF6B6B) - Accent color
- **Background**: White to Red gradient
- **Cards**: Pure white with subtle shadows

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment

### Payments
- `POST /api/payments` - Create payment record
- `GET /api/payments/admin/pending` - Get pending payments
- `PUT /api/payments/:id/verify` - Verify payment

### File Upload
- `POST /api/upload/receipt` - Upload receipt image

## 📱 Mobile Features

### React Native Components
- **Animated Views** - Smooth animations throughout the app
- **Linear Gradients** - Beautiful gradient backgrounds
- **Date/Time Pickers** - Native date and time selection
- **Image Picker** - Camera and gallery integration
- **Status Bar** - Custom status bar styling

### Navigation
- **Tab Navigation** - Customer dashboard tabs
- **Stack Navigation** - Screen transitions
- **Modal Navigation** - Booking and receipt modals

## 🚀 Deployment

### Backend Deployment
1. Set up MySQL database
2. Configure environment variables
3. Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build for production
2. Deploy to app stores (iOS App Store, Google Play)
3. Configure API endpoints

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

**Mick's Barber** - Modern barbershop management made simple! ✂️💈
