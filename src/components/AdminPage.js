import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the default icon not appearing
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminPage = () => {
  const [overspeedingUsers, setOverspeedingUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchOverspeedingUsers = async () => {
      try {
        const response = await axios.get('http://3.110.50.255:7000/api/admin/speedingusers');
        setOverspeedingUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching overspeeding users:', error);
      }
    };

    fetchOverspeedingUsers();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, '0')}:${(date.getMonth() + 1).toString().padStart(2, '0')}:${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const handleUserClick = (user) => {
    setExpandedUser(user._id === expandedUser ? null : user._id);
  };

  const handleDeleteOlderRecords = async () => {
    try {
      /* eslint-disable-next-line no-restricted-globals */
      let cn = confirm("Are You Sure You want to delete older records?");
      if(cn){
        const response = await axios.get('http://3.110.50.255:7000/api/admin/deleteoldrecords/');
        if (response.status === 200) {
          alert('Successfully deleted!');
        }
      }
      
    } catch (error) {
      console.error('Error deleting older records:', error);
      alert('Failed to delete older records.');
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container">
          <span className="navbar-brand">Admin Page</span>
          <button className="btn btn-danger ml-auto" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">Set Speed Limit</h2>
                {/* Set Speed Limit Form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const vehicleType = document.getElementById('vehicleType').value;
                  const speedLimit = document.getElementById('speedLimit').value;
                  if (!vehicleType || !speedLimit) {
                    alert('Both fields are required.');
                    return;
                  }
                  try {
                    await axios.post('http://3.110.50.255:7000/api/admin/setlimit/', {
                      vehicleType,
                      speedLimit,
                    });
                    alert('Speed limit updated successfully!');
                    document.getElementById('vehicleType').value = 'Heavy vehicle';
                    document.getElementById('speedLimit').value = '';
                  } catch (err) {
                    alert('Failed to update speed limit.');
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="vehicleType" className="form-label">Vehicle Type</label>
                    <select id="vehicleType" className="form-select" defaultValue="Heavy vehicle">
                      <option value="Heavy vehicle">Heavy vehicle</option>
                      <option value="Light vehicle">Light vehicle</option>
                      <option value="Very small vehicle">Very small vehicle</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="speedLimit" className="form-label">Speed Limit (km/hr)</label>
                    <input type="number" className="form-control" id="speedLimit" required />
                  </div>
                  <button type="submit" className="btn btn-sm btn-success">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-4">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">Over Speeding Users</h2>
                {overspeedingUsers.length === 0 && <p>No overspeeding users found.</p>}
                {overspeedingUsers.map(user => (
                  <div key={user._id} className="mb-4">
                    <div className="card">
                      <div className="card-header" onClick={() => handleUserClick(user)}>
                        <h5 className="card-title mb-0">{user.records[0]?.name || 'Unknown'}</h5>
                      </div>
                      {expandedUser === user._id && (
                        <div className="card-body">
                          {/* Map for the most recent location */}
                          <div className="mb-4" style={{ height: '300px', width: '100%' }}>
                            <MapContainer center={[user.records[0]?.location?.lat || 0, user.records[0]?.location?.lng || 0]} zoom={13} style={{ height: '100%', width: '100%' }}>
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <Marker position={[user.records[0]?.location?.lat || 0, user.records[0]?.location?.lng || 0]}>
                                <Popup>
                                  {user.records[0]?.name || 'Unknown'}<br />
                                  {user.records[0]?.vehicleNo || 'Unknown'}
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                          {/* Most Recent Location Info */}
                          <h5>Most Recent Location</h5>
                          <p><strong>Latitude:</strong> {user.records[0]?.location?.lat || 'N/A'}</p>
                          <p><strong>Longitude:</strong> {user.records[0]?.location?.lng || 'N/A'}</p>
                          {/* Records List */}
                          <div className="list-group">
                            {user.records.map((record) => (
                              <div key={record._id} className="list-group-item">
                                <h6>{record.name}</h6>
                                <p><strong>Vehicle No:</strong> {record.vehicleNo}</p>
                                <p><strong>Vehicle Type:</strong> {record.vehicleType}</p>
                                <p><strong>Timestamp:</strong> {formatTimestamp(record.timestamp)}</p>
                                <p><strong>Speed:</strong> {record.speed} km/hr</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-4 mb-4">
          <div className="col-md-8 text-center">
            <button className="btn btn-danger" onClick={handleDeleteOlderRecords}>Delete older records</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
