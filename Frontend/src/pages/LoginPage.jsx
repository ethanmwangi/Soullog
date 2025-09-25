// Frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../App.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For now, let's create a simple mock login since your Django doesn't have login endpoint yet
      // We'll implement a quick token-based login
      
      // Store a mock token for now - we can make this real later
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userEmail', email);
      
      console.log("Login attempt with:", { email, password });
      
      // Call the onLogin function to update App state
      onLogin();
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <main className="auth-card">
        <h1>Welcome Back</h1>
        <p>Log in to access your journal.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;