
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JournalPage from './pages/JournalPage';

// --- Background Particle Component (no changes needed) ---
const ParticleContainer = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const size = Math.random() * 5 + 2;
    const style = {
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 15 + 15}s`,
      animationDelay: `${Math.random() * -30}s`,
      '--x-start': `${Math.random() * 100 - 50}vw`,
      '--x-end': `${Math.random() * 100 - 50}vw`,
      '--scale': Math.random() + 0.5,
    };
    return <div key={i} className="particle" style={style} />;
  });
  return <div id="particle-container">{particles}</div>;
};

// --- Theme Toggle Component (no changes needed) ---
const ThemeToggle = ({ theme, toggleTheme }) => (
  <div className="theme-toggle" onClick={toggleTheme}>
    <button className={`toggle-button ${theme === 'light' ? 'active' : ''}`}>☀️</button>
    <button className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}>🌙</button>
  </div>
);

// --- Main App Component ---
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check auth

  useEffect(() => {
    // Theme management
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // --- This is the new, real authentication check ---
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser); // Token is valid, user is logged in
        } catch (error) {
          localStorage.removeItem('authToken'); // Token is invalid, remove it
          setUser(null);
        }
      } else {
        setUser(null); // No token, user is not logged in
      }
      setIsLoading(false); // Finished auth check
    };
    checkAuth();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Real login handler
  const handleLogin = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Login failed: Could not fetch user after token was set.");
      setUser(null);
    }
  };

  // Real logout handler
  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // While checking auth, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
      <ParticleContainer />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route 
          path="/register" 
          element={!user ? <RegisterPage onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route 
          path="/"
          element={user ? <JournalPage onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
