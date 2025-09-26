
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JournalPage from './pages/JournalPage';

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

const ThemeToggle = ({ theme, toggleTheme }) => (
  <div className="theme-toggle" onClick={toggleTheme}>
    <button className={`toggle-button ${theme === 'light' ? 'active' : ''}`}>☀️</button>
    <button className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}>🌙</button>
  </div>
);

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Auth check failed, removing token", error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // This now accepts the user data directly from login/register pages
  const handleLogin = (userData) => {
    console.log("App: handleLogin called with user data:", userData);
    setUser(userData);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    // No need to navigate here, the Routes will handle it
  };

  if (isLoading) {
    return <div>Loading...</div>; 
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
          element={user ? <JournalPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
