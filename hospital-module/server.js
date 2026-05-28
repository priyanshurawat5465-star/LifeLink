const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const app = express();
const PORT = process.env.HOSPITAL_PORT || 5002; // Different port for hospital module

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
.then(() => console.log('Hospital Module: MongoDB connected to bloodDB'))
.catch(err => console.error('Hospital Module: MongoDB connection error:', err));

// Mongoose Schemas
const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    license: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
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

// Create 2dsphere indexes
hospitalSchema.index({ location: '2dsphere' });
requestSchema.index({ location: '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);
const Request = mongoose.model('Request', requestSchema);

// API Routes

// Register new hospital
app.post('/api/hospitals/register', async (req, res) => {
    try {
        console.log('Hospital Registration Data:', {
            ...req.body,
            password: req.body.password ? '***' : 'MISSING',
            passwordLength: req.body.password ? req.body.password.length : 0
        });
        
        const hospital = new Hospital(req.body);
        await hospital.save();
        
        console.log('Hospital Saved Successfully:', {
            id: hospital._id,
            email: hospital.email,
            hasPassword: !!hospital.password,
            passwordLength: hospital.password ? hospital.password.length : 0,
            fullHospitalObject: JSON.stringify(hospital.toObject())
        });
        
        res.status(201).json({ success: true, hospital });
    } catch (error) {
        console.error('Hospital Registration Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Send blood request alert and email donors
app.post('/api/alerts/send', async (req, res) => {
    try {
        const { hospitalId, bloodTypeNeeded, priorityLevel, location, maxDistance = 10000 } = req.body;
        
        // 1. Fetch hospital details
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }

        // 2. Create the database request
        const request = new Request({
            hospitalId,
            bloodTypeNeeded,
            priorityLevel,
            location,
            status: 'Pending'
        });
        await request.save();

        // 3. Find nearby donors (call donor module API)
        try {
            const donorResponse = await fetch('http://localhost:5001/api/donors/nearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bloodType: bloodTypeNeeded,
                    location: location,
                    maxDistance: maxDistance
                })
            });
            
            const donorResult = await donorResponse.json();
            const nearbyDonors = donorResult.donors || [];

            // 4. Send Emails via Nodemailer
            if (nearbyDonors.length > 0) {
                const donorEmails = nearbyDonors.map(donor => donor.email).filter(email => email);

                if (donorEmails.length > 0) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        bcc: donorEmails, 
                        subject: `URGENT: ${bloodTypeNeeded} Blood Required at ${hospital.name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                                <h2 style="color: #B91C1C;">Urgent Blood Request: ${bloodTypeNeeded}</h2>
                                <p><strong>Hospital:</strong> ${hospital.name}</p>
                                <p><strong>Address:</strong> ${hospital.address}</p>
                                <p><strong>Priority Level:</strong> <span style="color: #B91C1C; font-weight: bold;">${priorityLevel}</span></p>
                                <hr style="border: 1px solid #eee; margin: 15px 0;">
                                <p>You are receiving this alert because you are a registered donor nearby.</p>
                                <p>If you are available to donate, please visit the hospital immediately.</p>
                            </div>
                        `
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) console.error('Email Dispatch Error:', error);
                        else console.log(`Alert emails successfully sent to ${donorEmails.length} donors.`);
                    });
                }
            }
            
            res.json({
                success: true,
                request,
                nearbyDonors: donorResult.nearbyDonors || 0,
                donors: nearbyDonors
            });
            
        } catch (donorError) {
            console.error('Error calling donor module:', donorError);
            res.json({
                success: true,
                request,
                nearbyDonors: 0,
                donors: [],
                warning: 'Donor module not available. Request saved but no emails sent.'
            });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get hospital by ID
app.get('/api/hospitals/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }
        res.json({ success: true, hospital });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update hospital inventory
app.put('/api/hospitals/:id/inventory', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            { unitsAvailable: req.body.unitsAvailable },
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

// Get alerts for hospital
app.get('/api/alerts', async (req, res) => {
    try {
        // Return blood requests for this hospital
        const requests = await Request.find({ hospitalId: req.query.hospitalId || null })
            .populate('hospitalId', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, requests });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});



// Get all hospitals
app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json({ success: true, hospitals });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get hospital by ID
app.get('/api/hospitals/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }
        res.json({ success: true, hospital });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update hospital inventory
app.put('/api/hospitals/:id/inventory', async (req, res) => {
    try {
        const { unitsAvailable } = req.body;
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id, 
            { unitsAvailable }, 
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


// Get all hospitals
app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json({ success: true, hospitals });
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

// Get hospital statistics
app.get('/api/hospitals/stats', async (req, res) => {
    try {
        const totalHospitals = await Hospital.countDocuments();
        const verifiedHospitals = await Hospital.countDocuments({ verified: true });
        const pendingRequests = await Request.countDocuments({ status: 'Pending' });
        const fulfilledRequests = await Request.countDocuments({ status: 'Fulfilled' });

        // Calculate total inventory
        const hospitals = await Hospital.find();
        const totalInventoryUnits = hospitals.reduce((total, hospital) => {
            return total + Object.values(hospital.unitsAvailable).reduce((sum, units) => sum + units, 0);
        }, 0);

        res.json({
            success: true,
            stats: {
                totalHospitals,
                verifiedHospitals,
                pendingRequests,
                fulfilledRequests,
                totalInventoryUnits
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get all hospitals (for admin use)
app.get('/api/admin/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ createdAt: -1 });
        res.json({ success: true, hospitals });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Verify hospital (for admin use)
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

// Delete hospital (for admin use)
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

// Serve registration page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'hospital-dashboard.html'));
});

// Serve dashboard page with .html extension
app.get('/hospital-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'hospital-dashboard.html'));
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Hospital server is working!', timestamp: new Date() });
});

// Registration test endpoint
app.post('/api/test/register', async (req, res) => {
    try {
        const testData = {
            name: 'City General Hospital',
            address: '123 Medical Center Drive, City, State 12345',
            license: 'HOSP-2023-001',
            email: 'citygeneral@hospital.com',
            password: 'hospital123',
            phone: '555-0123',
            unitsAvailable: {
                'A+': 15, 'A-': 5, 'B+': 12, 'B-': 3,
                'AB+': 8, 'AB-': 2, 'O+': 20, 'O-': 7
            },
            location: {
                type: 'Point',
                coordinates: [77.2090, 28.6139] // Delhi coordinates
            },
            verified: true
        };
        
        const hospital = new Hospital(testData);
        await hospital.save();
        
        console.log('Test hospital created:', hospital._id);
        
        res.json({ 
            success: true, 
            message: 'Test hospital registration successful',
            hospital: {
                id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                hasPassword: !!hospital.password,
                passwordLength: hospital.password ? hospital.password.length : 0
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Database test endpoint
app.get('/api/test/db', async (req, res) => {
    try {
        // Test database connection
        const hospitalCount = await Hospital.countDocuments();
        const allHospitals = await Hospital.find({});
        
        res.json({ 
            success: true, 
            message: 'Database test successful',
            hospitalCount,
            hospitals: allHospitals.map(h => ({
                id: h._id,
                name: h.name,
                email: h.email,
                hasPassword: !!h.password,
                passwordLength: h.password ? h.password.length : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Hospital Login Attempt:', { email, password: '***' });
        
        // Check all hospitals in database first
        const allHospitals = await Hospital.find({});
        console.log('All hospitals in DB:', allHospitals.length);
        
        // Find hospital by email
        const hospital = await Hospital.findOne({ email });
        
        console.log('Found Hospital:', hospital ? 'YES' : 'NO');
        
        if (!hospital) {
            console.log('Hospital not found for email:', email);
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        
        console.log('Hospital data:', { 
            id: hospital._id, 
            email: hospital.email, 
            hasPassword: !!hospital.password,
            passwordLength: hospital.password ? hospital.password.length : 0,
            passwordValue: hospital.password || 'NULL'
        });
        
        // Check if password matches the stored password
        // In production, use proper password hashing (bcrypt)
        if (password !== hospital.password) {
            console.log('Password mismatch:', {
                input: password,
                stored: hospital.password,
                match: false
            });
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        
        console.log('Login successful for:', email);
        
        const token = btoa(email + ':' + new Date().toISOString());
        res.json({ success: true, token, hospital, message: 'Login successful' });
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
    console.log(`Hospital Module Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
