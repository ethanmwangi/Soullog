// Frontend/src/pages/JournalPage.jsx

import { useState, useEffect } from 'react';
import { journalAPI } from '../services/api';
import '../App.css';

// --- SVG Icon Components ---
const BrainIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 3.5c1.14 0 2.28.38 3.24 1.1a6.5 6.5 0 0 1 5.26 6.4v2a6.5 6.5 0 0 1-6.5 6.5h-1a6.5 6.5 0 0 1-6.5-6.5v-2A6.5 6.5 0 0 1 9.5 3.5z" />
    <path d="M14.5 3.5c1.14 0 2.28.38 3.24 1.1" />
    <path d="M12 13a2.5 2.5 0 0 0-2.5 2.5V18" />
    <path d="M12 13a2.5 2.5 0 0 1 2.5 2.5V18" />
    <path d="M12 3V1" />
    <path d="M9.5 21v-2.5" />
    <path d="M14.5 21v-2.5" />
  </svg>
);

const CrossIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3h-2v5H6v2h5v11h2V10h5V8h-5z" />
  </svg>
);

const CrescentIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.28.43A11.5 11.5 0 0 0 3.8 17.8a11.5 11.5 0 0 0 14.98 3.77 11.5 11.5 0 0 0 3.77-14.98A11.5 11.5 0 0 0 12.28.43zm5.4 17.5a9.5 9.5 0 0 1-12.8-10.45 9.5 9.5 0 0 1 10.44-2.34A9.5 9.5 0 0 1 17.68 18z"/>
    <path d="M15.5 8.5l-1.5 3 3 1.5-1.5 3-3-1.5-3 1.5 1.5-3-3-1.5 3-1.5 1.5-3 1.5 3z"/>
  </svg>
);

// --- Icon Mapping ---
const InsightIcons = {
  psychological: <BrainIcon />,
  biblical: <CrossIcon />,
  islamic: <CrescentIcon />,
};

function JournalPage({ onLogout }) {
  const [entry, setEntry] = useState("");
  const [title, setTitle] = useState("");
  const [moodRating, setMoodRating] = useState(3);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);

  // Load recent entries on component mount
  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const entries = await journalAPI.getEntries();
      setRecentEntries(entries.slice(0, 5)); // Show last 5 entries
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  };

  const handleGetInsights = async () => {
    if (!entry.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setInsights([]);

    try {
      // Create journal entry with real Django API
      const journalData = {
        title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
        content: entry,
        mood_rating: moodRating
      };

      console.log('Creating journal entry:', journalData);
      
      // This will trigger AI analysis on your Django backend
      const response = await journalAPI.createEntry(journalData);
      
      console.log('Journal entry created with insights:', response);
      
      // Display the real AI insights from your backend
      if (response.insights && response.insights.length > 0) {
        setInsights(response.insights);
      } else {
        setError('No insights were generated. Please try again.');
      }

      // Clear form and reload recent entries
      setEntry("");
      setTitle("");
      setMoodRating(3);
      loadRecentEntries();
      
    } catch (err) {
      console.error('Failed to create entry:', err);
      setError(err.error || 'Failed to create journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatInsightContent = (insight) => {
    if (insight.scripture_reference) {
      return (
        <>
          <p>{insight.content}</p>
          <blockquote>{insight.scripture_reference}</blockquote>
        </>
      );
    }
    return <p>{insight.content}</p>;
  };

  const getInsightCardClass = (insightType) => {
    return `insight-card ${insightType}`;
  };

  return (
    <div 
      className="app-container"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}
    >
      <main className="journal-entry-card">
        <button className="logout-button" onClick={onLogout}>Logout</button>
        <h1>SoulLog</h1>
        <p>Your safe space to reflect, understand, and grow.</p>
        
        <input
          type="text"
          placeholder="Entry title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '1rem'
          }}
        />
        
        <textarea
          placeholder="What's on your mind? Share your thoughts, feelings, and experiences..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows="6"
        />
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            How are you feeling? (1 = Very Sad, 5 = Very Happy)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => setMoodRating(rating)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: moodRating === rating ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  background: moodRating === rating ? 'var(--accent-gold)' : 'transparent',
                  color: moodRating === rating ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                {['😢', '😔', '😐', '😊', '😄'][rating - 1]}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="insight-button" 
          onClick={handleGetInsights} 
          disabled={!entry.trim() || isLoading}
          style={{
            opacity: (!entry.trim() || isLoading) ? 0.6 : 1,
            cursor: (!entry.trim() || isLoading) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Generating Insights...' : 'Get AI Insights'}
        </button>
        
        {error && (
          <div style={{ 
            color: '#d9534f', 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#fdf2f2', 
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
      </main>

      {/* Display Real AI Insights */}
      <div className="insights-container">
        {insights.map((insight, index) => (
          <div key={index} className={getInsightCardClass(insight.insight_type)}>
            <h2>
              {InsightIcons[insight.insight_type]} 
              {insight.title}
            </h2>
            {formatInsightContent(insight)}
          </div>
        ))}
      </div>

      {/* Show Recent Entries */}
      {recentEntries.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
            Recent Entries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentEntries.map(entryItem => (
              <div 
                key={entryItem.id}
                style={{
                  background: 'var(--white)',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px var(--shadow)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>
                    {entryItem.title || 'Untitled Entry'}
                  </h4>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(entryItem.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {entryItem.content.length > 100 
                    ? entryItem.content.substring(0, 100) + '...' 
                    : entryItem.content
                  }
                </p>
                {entryItem.insights && entryItem.insights.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                    {entryItem.insights.length} insight{entryItem.insights.length !== 1 ? 's' : ''} generated
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalPage;
