
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

const Avatar = ({ username, onClick }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return <div className="avatar" onClick={onClick} style={{ cursor: 'pointer' }}>{initial}</div>;
};

const ThemeToggle = ({ theme, toggleTheme }) => (
  <div className="theme-toggle" onClick={toggleTheme}>
    <button className={`toggle-button ${theme === 'light' ? 'active' : ''}`}>☀️</button>
    <button className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}>🌙</button>
  </div>
);

function Navbar({ user, onLogout, theme, toggleTheme }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="nav-logo">
          SoulLog
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end>Journal</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/insights">Insights</NavLink>
        </div>
      </div>
      <div className="navbar-right" ref={dropdownRef}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="user-info">
          <Avatar username={user.username} onClick={() => setDropdownVisible(!dropdownVisible)} />
        </div>
        {dropdownVisible && (
          <div className="logout-dropdown">
            <button onClick={onLogout} className="logout-button-nav">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
