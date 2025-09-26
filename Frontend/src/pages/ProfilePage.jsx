
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../App.css'; // For styling

function ProfilePage() {
  const { user } = useOutletContext(); // Get user from context

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
        <h1 style={{ marginBottom: '1rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your account details.
        </p>

        <div className="journal-entry-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Username</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>{user.username}</p>
                </div>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Email</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>{user.email}</p>
                </div>
                 <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Joined On</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>{new Date(user.date_joined).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default ProfilePage;
