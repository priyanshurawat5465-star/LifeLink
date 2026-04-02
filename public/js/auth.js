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

function setAuthToken(token) {
    localStorage.setItem('token', token);
}

function removeAuthToken() {
    localStorage.removeItem('token');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isAuthenticated() {
    return !!getAuthToken();
}

function logout() {
    removeAuthToken();
    removeCurrentUser();
    window.location.href = 'login.html';
}

function redirectToDashboard() {
    const user = getCurrentUser();
    if (user) {
        if (user.role === 'Donor') {
            window.location.href = 'dashboard.html';
        } else if (user.role === 'Hospital') {
            window.location.href = 'dashboard.html';
        }
    }
}

function checkAuthAndRedirect() {
    if (isAuthenticated()) {
        redirectToDashboard();
    }
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

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';

                const response = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(loginData)
                });

                if (response.success) {
                    setAuthToken(response.data.token);
                    setCurrentUser(response.data.user);
                    showAlert('Login successful! Redirecting to dashboard...', 'success');
                    
                    setTimeout(() => {
                        redirectToDashboard();
                    }, 1500);
                } else {
                    showAlert(response.message || 'Login failed', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'Login failed. Please try again.', 'danger');
            } finally {
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    if (document.getElementById('registerForm')) {
        const registerForm = document.getElementById('registerForm');
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const role = formData.get('role');
            
            let locationData;
            try {
                locationData = JSON.parse(formData.get('location'));
            } catch (error) {
                showAlert('Please set your location on the map', 'danger');
                return;
            }

            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: role,
                phone: formData.get('phone'),
                location: locationData,
                address: formData.get('address')
            };

            if (role === 'Donor') {
                registerData.bloodGroup = formData.get('bloodGroup');
            }

            try {
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating account...';

                const response = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(registerData)
                });

                if (response.success) {
                    setAuthToken(response.data.token);
                    setCurrentUser(response.data.user);
                    showAlert('Registration successful! Redirecting to dashboard...', 'success');
                    
                    setTimeout(() => {
                        redirectToDashboard();
                    }, 1500);
                } else {
                    showAlert(response.message || 'Registration failed', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'Registration failed. Please try again.', 'danger');
            } finally {
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    const roleRadios = document.querySelectorAll('input[name="role"]');
    const donorFields = document.getElementById('donorFields');
    const bloodGroupSelect = document.getElementById('bloodGroup');
    
    if (roleRadios.length > 0) {
        roleRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'Donor') {
                    donorFields.style.display = 'block';
                    bloodGroupSelect.required = true;
                } else {
                    donorFields.style.display = 'none';
                    bloodGroupSelect.required = false;
                    bloodGroupSelect.value = '';
                }
            });
        });

        const selectedRole = document.querySelector('input[name="role"]:checked');
        if (selectedRole && selectedRole.value === 'Hospital') {
            donorFields.style.display = 'none';
            bloodGroupSelect.required = false;
        }
    }
});
