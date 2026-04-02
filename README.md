<<<<<<< HEAD
# LifeLink
Location Based Blood Donation system
=======
# Blood Donation System - Location-Based Blood Donation & Alert Management System

A modern, full-stack web application for connecting blood donors with hospitals using real-time location tracking and alert management.

## Features

- **Location-Based Services**: Find nearby donors and hospitals using OpenStreetMap integration
- **Real-Time Availability**: Track donor availability status in real-time
- **Role-Based Access**: Separate interfaces for Donors and Hospitals
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Responsive Design**: Mobile-first design using Bootstrap 5
- **Interactive Maps**: Leaflet.js integration for location selection and visualization
- **Modern UI**: Professional, clean interface with smooth animations

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with Bootstrap 5
- **JavaScript (ES6+)** - Client-side logic
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons

## Project Structure

```
blood-donation-system/
├── models/
│   └── User.js                 # MongoDB User schema
├── controllers/
│   ├── authController.js       # Authentication logic
│   └── donorController.js      # Donor dashboard logic
├── routes/
│   ├── auth.js                 # Authentication routes
│   └── donor.js                # Donor-specific routes
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   └── validation.js           # Input validation
├── public/
│   ├── css/
│   │   └── style.css           # Custom styles
│   ├── js/
│   │   ├── auth.js             # Authentication frontend logic
│   │   ├── dashboard.js        # Dashboard frontend logic
│   │   ├── map.js              # Map functionality
│   │   └── main.js             # Main page scripts
│   ├── images/                  # Static images
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   └── dashboard.html          # Donor dashboard
├── .vscode/                    # VS Code configuration
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── server.js                   # Main server file
└── README.md                   # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blood-donation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/blood-donation-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/blood-donation-system`

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Register as a Donor or Hospital
   - Login to access your dashboard

## Running in VS Code

### Using VS Code Tasks (Recommended)

1. **Open Command Palette**: `Ctrl + Shift + P`
2. **Type**: `Tasks: Run Task`
3. **Select**: `Start Development Server`

### Using Terminal

1. **Open Terminal**: `Ctrl + \` (backtick)
2. **Split Terminal**: Click the `+` icon to create two terminals

**Terminal 1 (MongoDB)**:
```bash
mongod --dbpath "C:\data\db" --port 27017
```

**Terminal 2 (Application)**:
```bash
npm run dev
```

### Using Debug Mode

1. **Go to Debug Panel**: `Ctrl + Shift + D`
2. **Select**: "Debug Node.js Server" 
3. **Press F5** to start debugging

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Donor Dashboard (Protected)
- `GET /api/donor/profile` - Get donor profile
- `PUT /api/donor/availability` - Toggle availability status
- `PUT /api/donor/profile` - Update donor profile

## Database Schema

### User Model
```javascript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (required, enum: ['Donor', 'Hospital'])
  bloodGroup: String (required for Donors, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  phone: String (required)
  isAvailable: Boolean (default: true, for Donors)
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] (required)
  }
  address: String (required)
  timestamps: true
}
```

## Usage

### For Donors
1. Register with your details and blood group
2. Set your location using the interactive map or GPS
3. Toggle your availability status
4. View your profile and donation history
5. Receive blood requests from nearby hospitals

### For Hospitals
1. Register your hospital details
2. Set your location on the map
3. Search for available donors by blood group and location
4. Send blood requests to matched donors

## Security Features

- JWT-based authentication with expiration
- bcrypt password hashing (12 salt rounds)
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- GeoJSON coordinate validation

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Future Enhancements

- Real-time notifications with Socket.io
- Blood inventory management for hospitals
- Donation scheduling system
- Emergency blood request system
- SMS/email notifications
- Blood donation campaigns
- Donor rewards and recognition system
- Advanced analytics and reporting
- Mobile app development

## Support

For support and questions, please contact:
- Email: contact@bloodconnect.com
- Emergency: 1-800-BLOOD-HELP

---

**Save Lives, Donate Blood!** ❤️
>>>>>>> d0553a6 (Initial Commit)
