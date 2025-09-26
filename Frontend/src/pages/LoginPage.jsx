
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../App.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });
      
      if (response && response.token) {
        console.log("Login success: Response received", response);
        // Correctly assemble the user object from the response
        const userData = {
          id: response.user_id,
          username: response.username,
          email: response.email,
        };
        onLogin(userData); // Pass the assembled user data to App
        navigate('/'); // Navigate to the main page
      } else {
        setError('Login failed: Invalid response from server.');
      }
    } catch (err) {
      const errorMessages = Object.values(err).flat().join(' ');
      setError(errorMessages || 'An unexpected error occurred.');
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
