const validateRegistration = (req, res, next) => {
  const { name, email, password, role, bloodGroup, phone, location, address } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!role || !['Donor', 'Hospital'].includes(role)) {
    errors.push('Role must be either Donor or Hospital');
  }

  if (role === 'Donor' && !bloodGroup) {
    errors.push('Blood group is required for donors');
  }

  if (bloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
    errors.push('Invalid blood group');
  }

  if (!phone || !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
    errors.push('Please provide a valid phone number');
  }

  if (!location || !Array.isArray(location) || location.length !== 2) {
    errors.push('Location must be an array of [longitude, latitude]');
  }

  if (location && Array.isArray(location) && location.length === 2) {
    const [longitude, latitude] = location;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      errors.push('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90');
    }
  }

  if (!address || address.trim().length < 5) {
    errors.push('Address must be at least 5 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin
};
