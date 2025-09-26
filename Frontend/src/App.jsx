
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { authAPI } from './services/api';
import './App.css';

// --- Page Imports ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JournalPage from './pages/JournalPage';
import DashboardPage from './pages/DashboardPage';
import InsightsPage from './pages/InsightsPage';
import EntryDetailPage from './pages/EntryDetailPage';
// --- Component Imports ---
import Navbar from './components/Navbar';

// --- UI Components ---
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


// --- Layout for authenticated users ---
const LoggedInLayout = ({ user, onLogout, theme, toggleTheme }) => (
  <div className="main-layout">
    <Navbar user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
    <main className="content-wrap">
      <Outlet context={{ user }} />
    </main>
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

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>; 
  }

  return (
    <Router>
      <ParticleContainer />
      
      <Routes>
        {user ? (
          // --- Logged IN Routes ---
          <Route element={<LoggedInLayout user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />}>
            <Route path="/" element={<JournalPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            {/* Redirect any other authenticated path to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          // --- Logged OUT Routes ---
          <>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            {/* Redirect any other path to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
