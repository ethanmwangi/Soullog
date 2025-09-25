
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

// Accept onLogin as a prop
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // TODO: Replace this with an actual API call
    console.log("Logging in with:", { email, password });

    // Simulate API call
    setTimeout(() => {
      // On success, call the onLogin function passed from App.jsx
      onLogin();
      // No need to set isLoading to false, as the view will change.
    }, 1000);
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
