const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { getProfile, toggleAvailability, updateProfile } = require('../controllers/donorController');

const router = express.Router();

router.get('/profile', auth, authorize('Donor'), getProfile);
router.put('/availability', auth, authorize('Donor'), toggleAvailability);
router.put('/profile', auth, authorize('Donor'), updateProfile);

module.exports = router;
