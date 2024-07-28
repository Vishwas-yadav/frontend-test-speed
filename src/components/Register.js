import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://3.110.50.255:7000/api/user/register/', { name, email, password, phone });
      alert(response.data.msg);
      navigate('/login');
    } catch (error) {
      alert('Registration failed!');
    }
  };

  return (
    <div class="container card shadow-sm mt-5 py-4">
      <h3 class="text-center">Register</h3>
      <form onSubmit={handleRegister}>
        <input class="col-12 mb-2" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input class="col-12 mb-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input class="col-12 mb-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input class="col-12 mb-2" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
        <input class="col-12 mb-2" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required />
        <div className='text-center'>
        <button class="btn btn-sm btn-primary" type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
