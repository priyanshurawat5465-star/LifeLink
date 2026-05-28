const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5003; // Different port for admin module

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/bloodDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Admin Module: MongoDB connected to bloodDB'))
.catch(err => console.error('Admin Module: MongoDB connection error:', err));

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

// Get all donors
app.get('/api/admin/donors', async (req, res) => {
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });
        res.json({ success: true, donors });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete donor
app.delete('/api/admin/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findByIdAndDelete(req.params.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.json({ success: true, message: 'Donor deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all hospitals
app.get('/api/admin/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ createdAt: -1 });
        res.json({ success: true, hospitals });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Verify hospital
app.put('/api/admin/hospitals/:id/verify', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id, 
            { verified: true }, 
            { new: true }
        );
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }
        res.json({ success: true, hospital });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete hospital
app.delete('/api/admin/hospitals/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }
        res.json({ success: true, message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

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

        // Hospital inventory stats
        const hospitals = await Hospital.find();
        const totalInventoryUnits = hospitals.reduce((total, hospital) => {
            return total + Object.values(hospital.unitsAvailable).reduce((sum, units) => sum + units, 0);
        }, 0);

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
                totalInventoryUnits
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all blood requests
app.get('/api/alerts', async (req, res) => {
    try {
        const requests = await Request.find().populate('hospitalId').sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get system logs
app.get('/api/admin/logs', async (req, res) => {
    try {
        const totalAlertsSent = await Request.countDocuments();
        const successfulMatches = await Request.countDocuments({ status: 'Fulfilled' });
        
        res.json({
            success: true,
            logs: {
                totalAlertsSent,
                successfulMatches,
                successRate: totalAlertsSent > 0 ? Math.round((successfulMatches / totalAlertsSent) * 100) : 0
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Authentication middleware
function checkAuth(req, res, next) {
    const token = req.headers.authorization || req.query.token;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    // In production, validate token properly
    next();
}

// Serve login page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve admin dashboard (protected)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Serve admin dashboard with .html extension
app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        const token = btoa(username + ':' + new Date().toISOString());
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Admin Module Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
