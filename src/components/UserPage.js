import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the default icon not appearing
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UserPage = () => {
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const name = decoded.name;
  const userId = decoded.user_id; // Assuming 'sub' is userId in your JWT

  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Heavy vehicle');
  const [driving, setDriving] = useState(false);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vehicleNo');
    localStorage.removeItem('vehicleType');
    navigate('/login');
  };

  const handleStartDriving = () => {
    if (!vehicleNo || !vehicleType) {
      setError('Both fields are required.');
      return;
    }

    // Clear previous error message
    setError('');

    // Store vehicle details in localStorage
    localStorage.setItem('vehicleNo', vehicleNo);
    localStorage.setItem('vehicleType', vehicleType);
    setDriving(true);
  };

  useEffect(() => {
    // Check if vehicle details exist in localStorage
    const storedVehicleNo = localStorage.getItem('vehicleNo');
    const storedVehicleType = localStorage.getItem('vehicleType');
    if (storedVehicleNo && storedVehicleType) {
      setVehicleNo(storedVehicleNo);
      setVehicleType(storedVehicleType);
      setDriving(true);
    }

    let intervalId;

    const updateLocation = (position) => {
      console.log("POS::",position.coords);
      let { latitude, longitude, speed } = position.coords;
      // speed=100;
      console.log("SPEEED:::",speed);
      setLocation({ lat: latitude, lng: longitude });
      setSpeed(speed ? (speed * 3.6).toFixed(2) : 0); // Convert m/s to km/hr
    };

    const handleError = (error) => {
      console.error('Geolocation error:', error);
      setError('Unable to retrieve location.');
    };

    if (driving) {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          updateLocation,
          handleError,
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        // Send location data to backend every 5 seconds
        intervalId = setInterval(async () => {
          if (location.lat && location.lng) {
            try {
              console.log("Hitting.");
              await axios.post('https://speedtr.online/api/loc/recurring/', {
                userId,
                name,
                vehicleNo: localStorage.getItem('vehicleNo'),
                vehicleType: localStorage.getItem('vehicleType'),
                speed,
                location: {
                  lat: location.lat,
                  lng: location.lng
                },
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error sending location details:', error);
            }
          }
        }, 5000);
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    } else {
      // Clear the interval when not driving
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [driving, location, speed, name, userId]);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container">
          <span className="navbar-brand">Hello, {name}!</span>
          <button 
            className="btn btn-danger ml-auto"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                {!driving ? (
                  <div>
                    <h3 className="card-title mb-4">Please Enter Details</h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form>
                      <div className="mb-3">
                        <label htmlFor="vehicleNo" className="form-label">Vehicle No</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="vehicleNo" 
                          value={vehicleNo}
                          onChange={(e) => setVehicleNo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="vehicleType" className="form-label">Vehicle Type</label>
                        <select 
                          id="vehicleType" 
                          className="form-select" 
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          required
                        >
                          <option value="Heavy vehicle">Heavy vehicle</option>
                          <option value="Light vehicle">Light vehicle</option>
                          <option value="Very small vehicle">Very small vehicle</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-success"
                        onClick={handleStartDriving}
                      >
                        Start Driving!
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h2 className="card-title mb-4">You are driving!</h2>
                    <p className="lead">Vehicle No: {localStorage.getItem('vehicleNo')}</p>
                    <p className="lead">Current Speed: {speed ? `${speed} km/hr` : '0 km/hr'}</p>

                    {/* Map */}
                    {location.lat && location.lng && (
                      <div style={{ height: '400px', width: '100%' }}>
                        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[location.lat, location.lng]}>
                            <Popup>
                              Current Location
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPage;
