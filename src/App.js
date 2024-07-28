import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';

const App = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<PrivateRoute><UserPage /></PrivateRoute>} />
          <Route path="/admin" element={<RoleBasedRoute roles={['admin']}><AdminPage /></RoleBasedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
