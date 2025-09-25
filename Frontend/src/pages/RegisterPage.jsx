
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // TODO: Add actual registration logic here
    console.log("Registering with:", { username, email, password });
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Replace with actual navigation upon success
    }, 1000);
  };

  return (
    <div className="auth-container">
      <main className="auth-card">
        <h1>Create Account</h1>
        <p>Join SoulLog to start your journey.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
