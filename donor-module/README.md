# Donor Module - Blood Donation System

A standalone donor management module for the Blood Donation System. This module handles donor registration, profile management, and availability status.

## Features

- **Donor Registration**: Complete registration form with medical history and geolocation
- **Profile Management**: Update personal information and medical details
- **Location Services**: Automatic geolocation capture for emergency alerts
- **Status Toggle**: Online/Offline availability control
- **Dashboard**: Personal dashboard with profile overview and recent alerts

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: HTML5, Bootstrap 5, JavaScript, Leaflet.js
- **Database**: MongoDB (bloodDB)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running on localhost:27017)

### Steps

1. **Install Dependencies**
   ```bash
   cd donor-module
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

3. **Start the Server**
   ```bash
   npm start
   # OR for development with auto-reload
   npm run dev
   ```

4. **Access the Module**
   - Registration Page: http://localhost:5001
   - Dashboard: http://localhost:5001/dashboard.html

## API Endpoints

### Donor Management
- `POST /api/donors/register` - Register new donor
- `GET /api/donors/:id` - Get donor details
- `PUT /api/donors/:id` - Update donor profile
- `PUT /api/donors/:id/status` - Update donor availability status

### Statistics
- `GET /api/donors/stats` - Get donor statistics

### Location Services
- `POST /api/donors/nearby` - Find nearby donors (for alert system)

### Admin Functions
- `GET /api/donors` - Get all donors
- `DELETE /api/donors/:id` - Delete donor

## Database Schema

### Donor Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  bloodGroup: String (required, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  medicalHistory: String,
  location: {
    type: 'Point',
    coordinates: [Number, Number] // [longitude, latitude]
  },
  status: String (enum: ['Online', 'Offline'], default: 'Offline'),
  createdAt: Date (default: Date.now)
}
```

## Port Configuration

- **Server Port**: 5001
- **Database**: mongodb://localhost:27017/bloodDB

## Integration with Other Modules

This module can work independently but also integrates with:

- **Hospital Module**: Receives blood requests and finds nearby donors
- **Admin Module**: Provides data for user management
- **Public Stats**: Contributes to global statistics

## Security Features

- Input validation on all endpoints
- MongoDB sanitization against injection attacks
- CORS configuration for cross-origin requests
- Error handling with proper HTTP status codes

## Usage Examples

### Register a New Donor
```javascript
const donorData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  bloodGroup: "O+",
  medicalHistory: "No known allergies",
  location: {
    type: "Point",
    coordinates: [-74.0060, 40.7128] // NYC coordinates
  },
  status: "Offline"
};

fetch('http://localhost:5001/api/donors/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(donorData)
})
.then(response => response.json())
.then(data => console.log(data));
```

### Find Nearby Donors
```javascript
const searchParams = {
  bloodType: "O+",
  location: {
    type: "Point",
    coordinates: [-74.0060, 40.7128]
  },
  maxDistance: 10000 // 10km in meters
};

fetch('http://localhost:5001/api/donors/nearby', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(searchParams)
})
.then(response => response.json())
.then(data => console.log(data));
```

## Development

### Project Structure
```
donor-module/
|
+-- server.js              # Main Express server
+-- package.json           # Dependencies and scripts
+-- registration.html      # Donor registration page
+-- dashboard.html         # Donor dashboard
+-- README.md              # This file
```

### Environment Variables
Create a `.env` file for configuration:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bloodDB
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check if bloodDB database exists

2. **Geolocation Not Working**
   - Enable location services in browser
   - Use HTTPS for production deployment

3. **Port Already in Use**
   - Change PORT in .env file or use different port
   - Check for other processes using port 5001

## License

This module is part of the Blood Donation System and is licensed under the MIT License.

## Support

For support and queries, please contact the development team or create an issue in the main repository.
