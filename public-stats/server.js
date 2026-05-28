const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PUBLIC_STATS_PORT || 5004; // Different port for public stats module

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Public Stats Module: MongoDB connected to bloodDB'))
.catch(err => console.error('Public Stats Module: MongoDB connection error:', err));

// Mongoose Schemas
const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    medicalHistory: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
    createdAt: { type: Date, default: Date.now }
});

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    license: { type: String, required: true, unique: true },
    unitsAvailable: {
        'A+': { type: Number, default: 0 },
        'A-': { type: Number, default: 0 },
        'B+': { type: Number, default: 0 },
        'B-': { type: Number, default: 0 },
        'AB+': { type: Number, default: 0 },
        'AB-': { type: Number, default: 0 },
        'O+': { type: Number, default: 0 },
        'O-': { type: Number, default: 0 }
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bloodTypeNeeded: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    priorityLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    status: { type: String, enum: ['Pending', 'Fulfilled'], default: 'Pending' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    createdAt: { type: Date, default: Date.now },
    fulfilledAt: { type: Date }
});

// Create indexes
donorSchema.index({ location: '2dsphere' });
hospitalSchema.index({ location: '2dsphere' });
requestSchema.index({ location: '2dsphere' });

const Donor = mongoose.model('Donor', donorSchema);
const Hospital = mongoose.model('Hospital', hospitalSchema);
const Request = mongoose.model('Request', requestSchema);

// API Routes

// Get global statistics
app.get('/api/stats/global', async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const onlineDonors = await Donor.countDocuments({ status: 'Online' });
        const totalHospitals = await Hospital.countDocuments();
        const verifiedHospitals = await Hospital.countDocuments({ verified: true });
        const pendingRequests = await Request.countDocuments({ status: 'Pending' });
        const fulfilledRequests = await Request.countDocuments({ status: 'Fulfilled' });

        // Blood type distribution
        const bloodTypeStats = await Donor.aggregate([
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Regional demand data (real data from database)
        const hospitals = await Hospital.find();
        const totalInventoryUnits = hospitals.reduce((total, hospital) => {
            return total + Object.values(hospital.unitsAvailable).reduce((sum, units) => sum + units, 0);
        }, 0);
        const regionalDemand = hospitals.reduce((acc, hospital) => {
            // Simple region classification based on coordinates
            const [lng, lat] = hospital.location.coordinates;
            let region = 'Central';
            if (lat > 30) region = 'North';
            else if (lat < 20) region = 'South';
            else if (lng > 80) region = 'East';
            else if (lng < 75) region = 'West';
            
            const existingRegion = acc.find(r => r.region === region);
            const totalUnits = Object.values(hospital.unitsAvailable).reduce((sum, units) => sum + units, 0);
            
            if (existingRegion) {
                existingRegion.demand += totalUnits;
            } else {
                acc.push({
                    region,
                    demand: totalUnits,
                    bloodTypes: hospital.unitsAvailable
                });
            }
            return acc;
        }, []);

        // Monthly trends (real data from database)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyDonors = await Donor.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { $month: '$createdAt' }, 
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        const monthlyRequests = await Request.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { $month: '$createdAt' }, 
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyTrends = monthNames.map((month, index) => ({
            month,
            donations: monthlyDonors.find(d => d._id === index + 1)?.count || 0,
            requests: monthlyRequests.find(r => r._id === index + 1)?.count || 0
        }));

        // Response times by blood type (real data from database)
        const completedRequests = await Request.find({ 
            status: 'Fulfilled',
            fulfilledAt: { $exists: true }
        });
        
        const responseTimes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => {
            const typeRequests = completedRequests.filter(req => req.bloodTypeNeeded === bloodType);
            if (typeRequests.length === 0) return { bloodType, avgTime: 0 };
            
            const totalTime = typeRequests.reduce((sum, req) => {
                const timeDiff = new Date(req.fulfilledAt) - new Date(req.createdAt);
                return sum + timeDiff;
            }, 0);
            
            return {
                bloodType,
                avgTime: Math.round(totalTime / typeRequests.length / (1000 * 60)) // Convert to minutes
            };
        });

        res.json({
            success: true,
            stats: {
                totalDonors,
                onlineDonors,
                totalHospitals,
                verifiedHospitals,
                pendingRequests,
                fulfilledRequests,
                bloodTypeStats,
                totalInventoryUnits,
                regionalDemand,
                monthlyTrends,
                responseTimes,
                successRate: (pendingRequests + fulfilledRequests) > 0 
                    ? Math.round((fulfilledRequests / (pendingRequests + fulfilledRequests)) * 100)
                    : 0
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get recent blood requests
app.get('/api/alerts', async (req, res) => {
    try {
        const requests = await Request.find().populate('hospitalId').sort({ createdAt: -1 }).limit(10);
        res.json({ success: true, requests });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});


// Get today's activity
app.get('/api/activity/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newDonors = await Donor.countDocuments({ createdAt: { $gte: today } });
        const requestsSent = await Request.countDocuments({ createdAt: { $gte: today } });
        const fulfilledToday = await Request.countDocuments({ 
            fulfilledAt: { $gte: today }, 
            status: 'Fulfilled' 
        });

        res.json({
            success: true,
            activity: {
                newDonors,
                requestsSent,
                fulfilledToday,
                pending: await Request.countDocuments({ status: 'Pending' })
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Serve index page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve stats page
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'stats.html'));
});

// Serve stats page with .html extension
app.get('/stats.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'stats.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Public Stats Module Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
