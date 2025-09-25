
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JournalPage from './pages/JournalPage';

// --- Background Particle Component ---
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

// --- Theme Toggle Component ---
const ThemeToggle = ({ theme, toggleTheme }) => (
  <div className="theme-toggle" onClick={toggleTheme}>
    <button className={`toggle-button ${theme === 'light' ? 'active' : ''}`}>☀️</button>
    <button className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}>🌙</button>
  </div>
);

// --- Main App Component ---
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // A mock function to simulate login
  const login = () => setIsAuthenticated(true);
  // A mock function to simulate logout
  const logout = () => setIsAuthenticated(false);

  return (
    <Router>
      <ParticleContainer />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage onLogin={login} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route 
          path="/"
          element={isAuthenticated ? <JournalPage onLogout={logout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
