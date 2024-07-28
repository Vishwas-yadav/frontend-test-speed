import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RoleBasedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  let isAuthorized = false;

  if (token) {
    const decoded = jwtDecode(token);
    isAuthorized = roles.includes(decoded.role);
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default RoleBasedRoute;
