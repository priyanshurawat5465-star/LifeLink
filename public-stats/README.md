# Public Statistics Module - Blood Donation System

A standalone public statistics module for the Blood Donation System. This module provides real-time global statistics, analytics, and public-facing information about the blood donation system.

## Features

- **Real-Time Statistics**: Live global metrics and system performance
- **Interactive Charts**: Blood type distribution, regional demand, and trends
- **Public Gateway**: Professional landing page with module entry points
- **Performance Monitoring**: System uptime and response time metrics
- **Activity Tracking**: Today's activity and recent requests
- **Data Visualization**: Comprehensive charts using Chart.js

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
   cd public-stats
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
   - Landing Page: http://localhost:5004
   - Statistics: http://localhost:5004/stats.html

## API Endpoints

### Statistics
- `GET /api/stats/global` - Get global system statistics
- `GET /api/alerts` - Get recent blood requests
- `GET /api/system/performance` - Get system performance metrics
- `GET /api/activity/today` - Get today's activity data

## Port Configuration

- **Server Port**: 5004
- **Database**: mongodb://localhost:27017/bloodDB

## Integration with Other Modules

This module can work independently but also integrates with:

- **Donor Module**: Provides donor statistics and data
- **Hospital Module**: Provides hospital and request data
- **Admin Module**: Provides administrative statistics

## Data Provided

### Global Statistics
- Total donors and online donors
- Total hospitals and verified hospitals
- Pending and fulfilled requests
- Blood type distribution
- Total inventory units
- Success rates

### Regional Data
- Regional demand analysis
- Geographic distribution
- Blood type needs by region

### Performance Metrics
- System uptime
- API response times
- Database performance
- Server load and memory usage

### Activity Tracking
- Today's new registrations
- Requests sent and fulfilled
- Real-time system activity

## Usage Examples

### Get Global Statistics
```javascript
fetch('http://localhost:5004/api/stats/global')
.then(response => response.json())
.then(data => {
  console.log(data.stats); // Comprehensive global statistics
});
```

### Get Recent Requests
```javascript
fetch('http://localhost:5004/api/alerts')
.then(response => response.json())
.then(data => {
  console.log(data.requests); // Recent blood requests
});
```

### Get System Performance
```javascript
fetch('http://localhost:5004/api/system/performance')
.then(response => response.json())
.then(data => {
  console.log(data.performance); // System performance metrics
});
```

### Get Today's Activity
```javascript
fetch('http://localhost:5004/api/activity/today')
.then(response => response.json())
.then(data => {
  console.log(data.activity); // Today's activity data
});
```

## Development

### Project Structure
```
public-stats/
|
+-- server.js              # Main Express server
+-- package.json           # Dependencies and scripts
+-- index.html             # Landing page
+-- stats.html             # Statistics page
+-- README.md              # This file
```

### Environment Variables
Create a `.env` file for configuration:
```
PORT=5004
MONGODB_URI=mongodb://localhost:27017/bloodDB
```

## Charts and Visualizations

### Available Charts
- **Blood Type Distribution**: Pie chart showing donor blood types
- **Regional Demand**: Bar chart for geographic demand
- **Monthly Trends**: Line chart for donation and request trends
- **Response Times**: Bar chart for average response by blood type
- **System Activity**: Real-time activity monitoring

### Chart Configuration
All charts use Chart.js with responsive design and include:
- Interactive tooltips
- Legend and labels
- Color-coded data
- Mobile-friendly sizing

## Features Breakdown

### Landing Page (index.html)
- Professional gateway design
- Module entry cards with descriptions
- Quick statistics overview
- Call-to-action sections
- Responsive design

### Statistics Page (stats.html)
- Real-time data updates
- Multiple chart types
- Regional demand analysis
- System performance metrics
- Recent activity tables

## Mock Data

For demonstration purposes, this module includes mock data for:
- Regional demand patterns
- Monthly trends
- Response time analysis
- System performance metrics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check if bloodDB database exists

2. **Charts Not Displaying**
   - Check Chart.js CDN is accessible
   - Verify data is properly formatted
   - Check browser console for JavaScript errors

3. **Data Not Loading**
   - Verify other modules have populated data
   - Check database connectivity
   - Ensure proper data relationships exist

4. **Port Already in Use**
   - Change PORT in .env file or use different port
   - Check for other processes using port 5004

## Performance Considerations

- Auto-refresh every 30 seconds for real-time data
- Efficient database queries with proper indexing
- Optimized chart rendering for smooth performance
- Responsive design for all device sizes

## Security Features

- Public access only (no sensitive data exposed)
- Input validation on all endpoints
- CORS configuration for cross-origin requests
- Error handling with proper HTTP status codes

## License

This module is part of the Blood Donation System and is licensed under the MIT License.

## Support

For support and queries, please contact the development team or create an issue in the main repository.
