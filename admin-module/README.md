# Admin Module - Blood Donation System

A standalone administrative module for the Blood Donation System. This module provides comprehensive user management, system monitoring, and administrative controls.

## Features

- **User Management**: Complete control over donors and hospitals
- **Verification System**: Approve and verify hospital registrations
- **System Monitoring**: Real-time statistics and performance metrics
- **Analytics Dashboard**: Comprehensive charts and reports
- **System Logs**: Monitor alerts sent and successful matches
- **Data Management**: View, edit, and delete user accounts

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: HTML5, Bootstrap 5, JavaScript, Chart.js
- **Database**: MongoDB (bloodDB)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running on localhost:27017)

### Steps

1. **Install Dependencies**
   ```bash
   cd admin-module
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
   - Admin Dashboard: http://localhost:5003

## API Endpoints

### Donor Management
- `GET /api/admin/donors` - Get all donors
- `DELETE /api/admin/donors/:id` - Delete donor

### Hospital Management
- `GET /api/admin/hospitals` - Get all hospitals
- `PUT /api/admin/hospitals/:id/verify` - Verify hospital
- `DELETE /api/admin/hospitals/:id` - Delete hospital

### Statistics
- `GET /api/stats/global` - Get global system statistics
- `GET /api/alerts` - Get all blood requests
- `GET /api/admin/logs` - Get system logs

## Database Schema

This module uses the same database schemas as other modules:

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
    coordinates: [Number, Number]
  },
  status: String (enum: ['Online', 'Offline'], default: 'Offline'),
  createdAt: Date (default: Date.now)
}
```

### Hospital Model
```javascript
{
  name: String (required),
  address: String (required),
  license: String (required, unique),
  unitsAvailable: {
    'A+': Number, 'A-': Number, 'B+': Number, 'B-': Number,
    'AB+': Number, 'AB-': Number, 'O+': Number, 'O-': Number
  },
  location: {
    type: 'Point',
    coordinates: [Number, Number]
  },
  verified: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

## Port Configuration

- **Server Port**: 5003
- **Database**: mongodb://localhost:27017/bloodDB

## Integration with Other Modules

This module can work independently but also integrates with:

- **Donor Module**: Provides donor management data
- **Hospital Module**: Provides hospital management data
- **Public Stats**: Contributes to global statistics

## Security Features

- Input validation on all endpoints
- MongoDB sanitization against injection attacks
- CORS configuration for cross-origin requests
- Role-based access control (admin functions only)

## Usage Examples

### Get All Donors
```javascript
fetch('http://localhost:5003/api/admin/donors')
.then(response => response.json())
.then(data => {
  console.log(data.donors); // Array of all donors
});
```

### Verify a Hospital
```javascript
fetch('http://localhost:5003/api/admin/hospitals/hospital_id/verify', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Get Global Statistics
```javascript
fetch('http://localhost:5003/api/stats/global')
.then(response => response.json())
.then(data => {
  console.log(data.stats); // Global system statistics
});
```

### Delete a Donor
```javascript
fetch('http://localhost:5003/api/admin/donors/donor_id', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log(data));
```

## Development

### Project Structure
```
admin-module/
|
+-- server.js              # Main Express server
+-- package.json           # Dependencies and scripts
+-- admin-dashboard.html   # Admin dashboard
+-- README.md              # This file
```

### Environment Variables
Create a `.env` file for configuration:
```
PORT=5003
MONGODB_URI=mongodb://localhost:27017/bloodDB
```

## Administrative Features

### User Management
- View all registered donors and hospitals
- Search and filter users by various criteria
- View detailed user profiles and histories
- Delete inactive or problematic accounts

### Hospital Verification
- Review hospital registration applications
- Verify hospital licenses and credentials
- Approve or reject hospital registrations
- Monitor hospital compliance

### System Monitoring
- Real-time statistics on donors, hospitals, and requests
- Track system performance and success rates
- Monitor blood type distributions
- View geographic demand patterns

### Analytics and Reporting
- Blood type distribution charts
- Monthly donation trends
- Regional demand analysis
- Response time metrics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check if bloodDB database exists

2. **Data Not Loading**
   - Verify other modules have populated data
   - Check database connectivity
   - Ensure proper data relationships exist

3. **Charts Not Displaying**
   - Check Chart.js CDN is accessible
   - Ensure data is properly formatted
   - Verify browser console for JavaScript errors

4. **Port Already in Use**
   - Change PORT in .env file or use different port
   - Check for other processes using port 5003

## Security Considerations

- This module provides administrative access to sensitive data
- Ensure proper authentication and authorization in production
- Regular security audits of admin functions
- Log all administrative actions for audit trails

## License

This module is part of the Blood Donation System and is licensed under the MIT License.

## Support

For support and queries, please contact the development team or create an issue in the main repository.
