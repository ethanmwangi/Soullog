
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css'; // We will add Navbar specific styles here later

// A simple avatar component for placeholder
const Avatar = ({ username }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return <div className="avatar">{initial}</div>;
};

function Navbar({ user, onLogout }) {
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
      <div className="navbar-right">
        <div className="user-info">
          <Avatar username={user.username} />
          <span>{user.username}</span>
        </div>
        <NavLink to="/profile" className="nav-link-profile">Profile</NavLink>
        <button onClick={onLogout} className="logout-button-nav">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
