let map;
let currentMarker;
let selectedCoordinates = [0, 0];

function initMap() {
    console.log('Initializing map...');
    
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = '<div class="alert alert-warning">Map library failed to load. Please check your internet connection and refresh the page.</div>';
        }
        return;
    }

    try {
        map = L.map('map').setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', function(e) {
            setMapLocation(e.latlng.lat, e.latlng.lng);
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 13);
                setMapLocation(lat, lng);
            }, function(error) {
                console.warn('Geolocation error:', error.message);
            });
        }
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = '<div class="alert alert-danger">Failed to initialize map. Please refresh the page.</div>';
        }
    }
}

function setMapLocation(lat, lng) {
    selectedCoordinates = [lng, lat];
    
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    currentMarker = L.marker([lat, lng]).addTo(map);
    currentMarker.bindPopup(`<b>Selected Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`).openPopup();
    
    updateCoordinatesDisplay(lat, lng);
}

function updateCoordinatesDisplay(lat, lng) {
    document.getElementById('coordinates').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    document.getElementById('location').value = JSON.stringify([lng, lat]);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Map script loaded, checking for map element...');
    
    const mapElement = document.getElementById('map');
    if (mapElement) {
        console.log('Map element found, initializing map...');
        setTimeout(() => {
            initMap();
        }, 100);
    } else {
        console.log('Map element not found on this page');
    }

    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                getCurrentLocationBtn.disabled = true;
                getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Getting location...';
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    map.setView([lat, lng], 15);
                    setMapLocation(lat, lng);
                    
                    getCurrentLocationBtn.disabled = false;
                    getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs me-2"></i>Use Current Location';
                    
                    showAlert('Location retrieved successfully!', 'success');
                }, function(error) {
                    let errorMessage = 'Unable to retrieve your location.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location services.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    
                    getCurrentLocationBtn.disabled = false;
                    getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs me-2"></i>Use Current Location';
                    showAlert(errorMessage, 'danger');
                });
            } else {
                showAlert('Geolocation is not supported by your browser.', 'danger');
            }
        });
    }

    const roleRadios = document.querySelectorAll('input[name="role"]');
    const donorFields = document.getElementById('donorFields');
    const bloodGroupSelect = document.getElementById('bloodGroup');
    
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
});

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.classList.remove('d-none');
        
        setTimeout(() => {
            alertDiv.classList.add('d-none');
        }, 5000);
    }
}
