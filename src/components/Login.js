import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://speedtr.online/api/user/login/', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      if (decoded.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error) {
      alert('Login failed!');
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
        <div className="container">
          <span className="navbar-brand">...Speed Tracker__</span>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container card shadow-sm p-4 col-md-6" style={{ marginTop: '75px' }}>
        <h3 className="text-center">Login</h3>
        <form onSubmit={handleLogin}>
          <input
            className="col-12 mb-2 form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="col-12 mb-2 form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="text-center mb-4">
            <button className="btn btn-sm btn-primary" type="submit">Login</button>
          </div>
        </form>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/register')}>New User? Register!</button>
      </div>
    </>
  );
};

export default Login;
