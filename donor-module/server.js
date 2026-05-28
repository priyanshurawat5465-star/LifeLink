const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.DONOR_PORT || 5001; // Different port for donor module (testing)

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
.then(() => console.log('Donor Module: MongoDB connected to bloodDB'))
.catch(err => console.error('Donor Module: MongoDB connection error:', err));

// Mongoose Schemas
const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

// Create 2dsphere index for location field
donorSchema.index({ location: '2dsphere' });

const Donor = mongoose.model('Donor', donorSchema);

// API Routes

// Register new donor
app.post('/api/donors/register', async (req, res) => {
    try {
        console.log('Donor Registration Data:', {
            ...req.body,
            password: req.body.password ? '***' : 'MISSING',
            passwordLength: req.body.password ? req.body.password.length : 0
        });
        
        const donor = new Donor(req.body);
        await donor.save();
        
        console.log('Donor Saved Successfully:', {
            id: donor._id,
            email: donor.email,
            hasPassword: !!donor.password,
            passwordLength: donor.password ? donor.password.length : 0,
            fullDonorObject: JSON.stringify(donor.toObject())
        });
        
        res.status(201).json({ success: true, donor });
    } catch (error) {
        console.error('Donor Registration Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get donor by ID
app.get('/api/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.json({ success: true, donor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get alerts for donor
app.get('/api/alerts', async (req, res) => {
    try {
        // For demo purposes, return mock alerts
        // In production, this would fetch actual blood requests matching donor's blood type and location
        const mockAlerts = [
            {
                _id: '1',
                hospitalName: 'City General Hospital',
                bloodType: 'A+',
                priority: 'High',
                distance: '2.5 km',
                timeAgo: '10 minutes ago',
                status: 'Pending'
            },
            {
                _id: '2', 
                hospitalName: 'St. Mary Medical Center',
                bloodType: 'A+',
                priority: 'Medium',
                distance: '5.1 km',
                timeAgo: '25 minutes ago',
                status: 'Pending'
            }
        ];
        
        res.json({ success: true, requests: mockAlerts });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update donor profile
app.put('/api/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.json({ success: true, donor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update donor status
app.put('/api/donors/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const donor = await Donor.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.json({ success: true, donor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get donor statistics
app.get('/api/donors/stats', async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const onlineDonors = await Donor.countDocuments({ status: 'Online' });
        
        // Blood type distribution
        const bloodTypeStats = await Donor.aggregate([
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalDonors,
                onlineDonors,
                bloodTypeStats
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Find nearby donors (for alert system)
app.post('/api/donors/nearby', async (req, res) => {
    try {
        const { bloodType, location, maxDistance = 10000 } = req.body;
        
        const nearbyDonors = await Donor.find({
            bloodGroup: bloodType,
            status: 'Online',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: location.coordinates
                    },
                    $maxDistance: maxDistance
                }
            }
        });

        res.json({
            success: true,
            nearbyDonors: nearbyDonors.length,
            donors: nearbyDonors
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all donors (for admin use)
app.get('/api/donors', async (req, res) => {
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });
        res.json({ success: true, donors });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete donor (for admin use)
app.delete('/api/donors/:id', async (req, res) => {
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

// Serve registration page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Donor server is working!', timestamp: new Date() });
});

// Database test endpoint
app.get('/api/test/db', async (req, res) => {
    try {
        // Test database connection
        const donorCount = await Donor.countDocuments();
        const allDonors = await Donor.find({});
        
        res.json({ 
            success: true, 
            message: 'Database test successful',
            donorCount,
            donors: allDonors.map(d => ({
                id: d._id,
                email: d.email,
                hasPassword: !!d.password,
                passwordLength: d.password ? d.password.length : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Registration test endpoint
app.post('/api/test/register', async (req, res) => {
    try {
        const testData = {
            name: 'Test Donor',
            email: 'test@example.com',
            password: 'test123',
            phone: '1234567890',
            bloodGroup: 'A+',
            medicalHistory: 'None',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            },
            status: 'Offline'
        };
        
        const donor = new Donor(testData);
        await donor.save();
        
        res.json({ 
            success: true, 
            message: 'Test registration successful',
            donor: {
                id: donor._id,
                email: donor.email,
                hasPassword: !!donor.password,
                passwordLength: donor.password ? donor.password.length : 0
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Donor Login Attempt:', { email, password: '***' });
        
        // Check all donors in database first
        const allDonors = await Donor.find({});
        console.log('All donors in DB:', allDonors.length);
        
        // Find donor by email
        const donor = await Donor.findOne({ email });
        
        console.log('Found Donor:', donor ? 'YES' : 'NO');
        
        if (!donor) {
            console.log('Donor not found for email:', email);
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        
        console.log('Donor data:', { 
            id: donor._id, 
            email: donor.email, 
            hasPassword: !!donor.password,
            passwordLength: donor.password ? donor.password.length : 0,
            passwordValue: donor.password || 'NULL'
        });
        
        // Check if password matches the stored password
        // In production, use proper password hashing (bcrypt)
        if (password !== donor.password) {
            console.log('Password mismatch:', {
                input: password,
                stored: donor.password,
                match: false
            });
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        
        console.log('Login successful for:', email);
        
        const token = btoa(email + ':' + new Date().toISOString());
        res.json({ success: true, token, donor, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Donor Module Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
