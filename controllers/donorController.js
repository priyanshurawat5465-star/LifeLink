const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for donors only.'
      });
    }

    const donor = await User.findById(req.user.id).select('-password');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor profile retrieved successfully',
      data: {
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          role: donor.role,
          bloodGroup: donor.bloodGroup,
          phone: donor.phone,
          location: donor.location,
          address: donor.address,
          isAvailable: donor.isAvailable,
          createdAt: donor.createdAt,
          updatedAt: donor.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving donor profile'
    });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for donors only.'
      });
    }

    const donor = await User.findById(req.user.id);
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    donor.isAvailable = !donor.isAvailable;
    await donor.save();

    res.status(200).json({
      success: true,
      message: `Availability ${donor.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: {
        isAvailable: donor.isAvailable
      }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating availability'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for donors only.'
      });
    }

    const { name, phone, address, location } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (location) {
      if (!Array.isArray(location) || location.length !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Location must be an array of [longitude, latitude]'
        });
      }

      const [longitude, latitude] = location;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
        });
      }

      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          role: donor.role,
          bloodGroup: donor.bloodGroup,
          phone: donor.phone,
          location: donor.location,
          address: donor.address,
          isAvailable: donor.isAvailable,
          createdAt: donor.createdAt,
          updatedAt: donor.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile'
    });
  }
};

module.exports = {
  getProfile,
  toggleAvailability,
  updateProfile
};
