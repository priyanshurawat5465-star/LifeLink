# Blood Donation & Alert System

A comprehensive modular blood donation management system built with Node.js, Express, MongoDB, and Bootstrap 5. This system connects blood donors with hospitals through real-time geolocation-based alerts.

## **Modular Architecture!**

Each module now has its own independent backend and can run standalone! You can deploy individual modules without dependencies on others.

## Project Structure

```
LifeLink/
|
+-- donor-module/                 # Standalone Donor Module
|   +-- server.js                 # Independent backend (Port 5001)
|   +-- package.json              # Module dependencies
|   +-- registration.html         # Donor registration
|   +-- dashboard.html            # Donor dashboard
|   +-- README.md                 # Module-specific setup guide
|
+-- hospital-module/              # Standalone Hospital Module
|   +-- server.js                 # Independent backend (Port 5002)
|   +-- package.json              # Module dependencies
|   +-- hospital-dashboard.html   # Hospital portal
|   +-- README.md                 # Module-specific setup guide
|
+-- admin-module/                 # Standalone Admin Module
|   +-- server.js                 # Independent backend (Port 5003)
|   +-- package.json              # Module dependencies
|   +-- admin-dashboard.html      # Admin panel
|   +-- README.md                 # Module-specific setup guide
|
+-- public-stats/                 # Standalone Statistics Module
|   +-- server.js                 # Independent backend (Port 5004)
|   +-- package.json              # Module dependencies
|   +-- index.html               # Landing page
|   +-- stats.html               # Statistics dashboard
|   +-- README.md                # Module-specific setup guide
|
+-- server/                       # Legacy monolithic server (optional)
|   +-- server.js                 # Original combined server
|
+-- package.json                  # Root dependencies
+-- README.md                     # This file
```

## Features

### Server (Backend Foundation)
- **MongoDB Integration**: Connected to `mongodb://localhost:27017/bloodDB`
- **Mongoose Models**: Donor, Hospital, and Request schemas with GeoJSON support
- **2dsphere Index**: Optimized geospatial queries for donor searches
- **RESTful APIs**: Complete CRUD operations for all entities
- **Geolocation Search**: Find donors within specified radius using `$maxDistance`

### Donor Module
- **Registration Form**: Complete donor profile with medical history and automatic geolocation
- **Dashboard**: Profile management, location view, and online/offline status toggle
- **Real-time Alerts**: Receive emergency blood donation notifications
- **Map Integration**: Leaflet.js for location visualization

### Hospital Module
- **Hospital Registration**: Complete registration form with geolocation and inventory setup
- **Blood Inventory Management**: Track and manage blood units by type
- **Emergency Requests**: Generate blood requests with priority levels
- **Geographic Search**: Find nearby donors using interactive maps
- **Analytics Dashboard**: Monitor inventory trends and donor responses
- **Alert System**: Real-time donor search with radius controls
- **Verification System**: Admin verification for hospital registrations
- **Real-time Statistics**: Donor turnout and recipient history tracking

### Admin Module
- **Admin Login**: Secure authentication system with login page
- **User Management**: Complete control over donors and hospitals
- **Verification System**: Approve hospital registrations
- **System Logs**: Monitor alerts sent and successful matches
- **Analytics Dashboard**: Comprehensive system statistics with charts
- **Default Credentials**: admin / admin123 (for demo)

### Public Statistics
- **Landing Page**: Professional gateway with 4 module entry cards
- **Real-time Statistics**: Live global metrics using Chart.js
- **Blood Type Distribution**: Pie charts for donor blood types
- **Regional Demand**: Bar charts for geographic analysis
- **Performance Metrics**: System uptime and response times

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Geospatial Queries**: 2dsphere indexing for location-based searches

### Frontend
- **Bootstrap 5**: UI framework with custom red theme (#B91C1C)
- **Chart.js**: Data visualization and analytics
- **Leaflet.js**: Interactive maps and geolocation
- **Font Awesome**: Icon library

### Key Features
- **Geolocation-based Alerts**: Find nearest donors automatically
- **Real-time Statistics**: Live system monitoring
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: Role-based access control
- **Analytics Dashboard**: Comprehensive reporting

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)

### **Option 1: Run Individual Modules (Recommended)**

Each module can run independently with its own backend:

#### Donor Module Only
```bash
cd donor-module
node server.js
# Access at: http://localhost:5001
```

#### Hospital Module Only
```bash
cd hospital-module
node server.js
# Access at: http://localhost:5002
```

#### Admin Module Only
```bash
cd admin-module
node server.js
# Access at: http://localhost:5003
```

#### Public Statistics Only
```bash
cd public-stats
node server.js
# Access at: http://localhost:5004
```

## Module Access URLs

|      Module       | Port |      Access URL       |
|-------------------|------|-----------------------|
| Donor Module      | 5001 | http://localhost:5001 |
| Hospital Module   | 5002 | http://localhost:5002 |
| Admin Module      | 5003 | http://localhost:5003 |
| Public Statistics | 5004 | http://localhost:5004 |
| Legacy System     | 5000 | http://localhost:5000 |

## API Endpoints

### Donor APIs
- `POST /api/donors/register` - Register new donor
- `GET /api/donors/:id` - Get donor details
- `PUT /api/donors/:id` - Update donor profile
- `PUT /api/donors/:id/status` - Update donor availability status

### Hospital APIs
- `POST /api/hospitals/register` - Register new hospital
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital details
- `PUT /api/hospitals/:id/inventory` - Update blood inventory

### Alert System APIs
- `POST /api/alerts/send` - Send emergency blood request
- `GET /api/alerts` - Get all blood requests

### Statistics APIs
- `GET /api/stats/global` - Get global system statistics

### Admin APIs
- `GET /api/admin/donors` - Get all donors (admin)
- `DELETE /api/admin/donors/:id` - Delete donor (admin)
- `GET /api/admin/hospitals` - Get all hospitals (admin)
- `PUT /api/admin/hospitals/:id/verify` - Verify hospital (admin)
- `DELETE /api/admin/hospitals/:id` - Delete hospital (admin)

## Database Schema

### Donor Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  bloodGroup: String (A+, A-, B+, B-, AB+, AB-, O+, O-),
  medicalHistory: String,
  location: { type: 'Point', coordinates: [Number, Number] },
  status: String (Online/Offline),
  createdAt: Date
}
```

### Hospital Model
```javascript
{
  name: String,
  address: String,
  license: String (unique),
  unitsAvailable: {
    'A+': Number, 'A-': Number, 'B+': Number, 'B-': Number,
    'AB+': Number, 'AB-': Number, 'O+': Number, 'O-': Number
  },
  location: { type: 'Point', coordinates: [Number, Number] },
  verified: Boolean,
  createdAt: Date
}
```

### Request Model
```javascript
{
  hospitalId: ObjectId (ref: 'Hospital'),
  bloodTypeNeeded: String,
  priorityLevel: String (Low/Medium/High/Critical),
  status: String (Pending/Fulfilled),
  location: { type: 'Point', coordinates: [Number, Number] },
  createdAt: Date,
  fulfilledAt: Date
}
```

## Usage Guide

### For Donors
1. Register with complete profile and medical history
2. Enable location services for emergency alerts
3. Toggle online status to receive notifications
4. Update profile information as needed

### For Hospitals
1. Register hospital and get verified by admin
2. Manage blood inventory by type
3. Generate emergency requests with priority levels
4. Use map interface to search nearby donors
5. Monitor success rates and analytics

### For Administrators
1. Verify hospital registrations
2. Manage donor and hospital accounts
3. Monitor system performance and logs
4. View comprehensive statistics and reports

## Security Features

- **Input Validation**: All form inputs are validated server-side
- **MongoDB Sanitization**: Protection against injection attacks
- **CORS Configuration**: Secure cross-origin requests
- **Role-based Access**: Different access levels for different user types

## Performance Optimizations

- **Geospatial Indexing**: 2dsphere indexes for fast location queries
- **Responsive Design**: Optimized for all device sizes
- **Efficient Charts**: Chart.js for smooth data visualization
- **Caching**: Browser caching for static assets

## Future Enhancements

- **SMS/Email Notifications**: Real-time alerts via multiple channels
- **Mobile App**: Native mobile applications
- **Blood Bank Integration**: Connect with existing blood banks
- **AI Matching**: Intelligent donor-patient compatibility matching
- **Blockchain**: Secure and transparent donation tracking

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check if bloodDB database exists

2. **Geolocation Not Working**
   - Enable location services in browser
   - Use HTTPS for production deployment

3. **Charts Not Displaying**
   - Check Chart.js CDN is accessible
   - Ensure data is properly formatted

4. **Map Not Loading**
   - Verify Leaflet.js CDN is accessible
   - Check internet connection for map tiles

