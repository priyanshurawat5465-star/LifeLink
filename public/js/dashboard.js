const API_BASE_URL = '/api';

function showAlert(message, type, containerId = 'alertMessage') {
    const alertDiv = document.getElementById(containerId);
    if (alertDiv) {
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.classList.remove('d-none');
        
        setTimeout(() => {
            alertDiv.classList.add('d-none');
        }, 5000);
    }
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        headers,
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.sidebar .nav-link[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

async function loadDonorProfile() {
    try {
        document.querySelector('.loading-spinner').style.display = 'block';
        
        const response = await apiRequest('/donor/profile');
        
        if (response.success) {
            const donor = response.data.donor;
            updateProfileDisplay(donor);
            document.querySelector('.profile-section').style.display = 'block';
        } else {
            showAlert(response.message || 'Failed to load profile', 'danger');
        }
    } catch (error) {
        showAlert(error.message || 'Failed to load profile', 'danger');
        if (error.message.includes('401') || error.message.includes('403')) {
            logout();
        }
    } finally {
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

function updateProfileDisplay(donor) {
    document.getElementById('navUserName').textContent = donor.name;
    document.getElementById('profileName').textContent = donor.name;
    document.getElementById('profileEmail').textContent = donor.email;
    document.getElementById('profilePhone').textContent = donor.phone;
    document.getElementById('profileBloodGroup').textContent = donor.bloodGroup;
    document.getElementById('profileAddress').textContent = donor.address;
    
    if (donor.location && donor.location.coordinates) {
        const [lng, lat] = donor.location.coordinates;
        document.getElementById('profileLocation').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    const availabilityToggle = document.getElementById('availabilityToggle');
    const availabilityStatus = document.getElementById('availabilityStatus');
    const availabilityText = document.getElementById('availabilityText');
    
    availabilityToggle.checked = donor.isAvailable;
    
    if (donor.isAvailable) {
        availabilityStatus.className = 'badge bg-success status-badge';
        availabilityText.textContent = 'Available';
    } else {
        availabilityStatus.className = 'badge bg-secondary status-badge';
        availabilityText.textContent = 'Not Available';
    }

    document.getElementById('editName').value = donor.name;
    document.getElementById('editPhone').value = donor.phone;
    document.getElementById('editAddress').value = donor.address;
}

async function toggleAvailability() {
    try {
        const response = await apiRequest('/donor/availability', {
            method: 'PUT'
        });

        if (response.success) {
            const isAvailable = response.data.isAvailable;
            const availabilityStatus = document.getElementById('availabilityStatus');
            const availabilityText = document.getElementById('availabilityText');
            
            if (isAvailable) {
                availabilityStatus.className = 'badge bg-success status-badge';
                availabilityText.textContent = 'Available';
                showAlert('You are now available for donation!', 'success');
            } else {
                availabilityStatus.className = 'badge bg-secondary status-badge';
                availabilityText.textContent = 'Not Available';
                showAlert('You are now unavailable for donation', 'info');
            }
        } else {
            showAlert(response.message || 'Failed to update availability', 'danger');
        }
    } catch (error) {
        showAlert(error.message || 'Failed to update availability', 'danger');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updateData = {
        name: formData.get('editName'),
        phone: formData.get('editPhone'),
        address: formData.get('editAddress')
    };

    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';

        const response = await apiRequest('/donor/profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.success) {
            showAlert('Profile updated successfully!', 'success');
            updateProfileDisplay(response.data.donor);
            showSection('dashboard');
            
            const currentUser = getCurrentUser();
            currentUser.name = response.data.donor.name;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            showAlert(response.message || 'Failed to update profile', 'danger');
        }
    } catch (error) {
        showAlert(error.message || 'Failed to update profile', 'danger');
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function editProfile() {
    showSection('profile');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== 'Donor') {
        window.location.href = 'login.html';
        return;
    }

    loadDonorProfile();

    const availabilityToggle = document.getElementById('availabilityToggle');
    if (availabilityToggle) {
        availabilityToggle.addEventListener('change', toggleAvailability);
    }

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', updateProfile);
    }

    showSection('dashboard');
});
