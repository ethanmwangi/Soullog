
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { journalAPI } from '../services/api';
import '../App.css';

const BrainIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 3.5c1.14 0 2.28.38 3.24 1.1a6.5 6.5 0 0 1 5.26 6.4v2a6.5 6.5 0 0 1-6.5 6.5h-1a6.5 6.5 0 0 1-6.5-6.5v-2A6.5 6.5 0 0 1 9.5 3.5z" /><path d="M14.5 3.5c1.14 0 2.28.38 3.24 1.1" /><path d="M12 13a2.5 2.5 0 0 0-2.5 2.5V18" /><path d="M12 13a2.5 2.5 0 0 1 2.5 2.5V18" /><path d="M12 3V1" /><path d="M9.5 21v-2.5" /><path d="M14.5 21v-2.5" /></svg> );
const CrossIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v5H6v2h5v11h2V10h5V8h-5z" /></svg> );
const CrescentIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.28.43A11.5 11.5 0 0 0 3.8 17.8a11.5 11.5 0 0 0 14.98 3.77 11.5 11.5 0 0 0 3.77-14.98A11.5 11.5 0 0 0 12.28.43zm5.4 17.5a9.5 9.5 0 0 1-12.8-10.45 9.5 9.5 0 0 1 10.44-2.34A9.5 9.5 0 0 1 17.68 18z"/><path d="M15.5 8.5l-1.5 3 3 1.5-1.5 3-3-1.5-3 1.5 1.5-3-3-1.5 3-1.5 1.5-3 1.5 3z"/></svg> );
const InsightIcons = { psychological: <BrainIcon />, biblical: <CrossIcon />, islamic: <CrescentIcon /> };

const InsightCard = ({ title, content, insight_type, created_at }) => (
  <div className={`insight-card ${insight_type}`}>
    <h2 style={{ marginBottom: '1rem' }}>
      {InsightIcons[insight_type]} 
      {title}
    </h2>
    <p>{content}</p>
    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '1rem' }}>
      Generated: {new Date(created_at).toLocaleDateString()}
    </small>
  </div>
);

function EntryDetailPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const data = await journalAPI.getEntry(id);
        setEntry(data);
      } catch (err) {
        console.error("Failed to load entry details:", err);
        setError("Could not load the requested journal entry.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (isLoading) { return <div>Loading entry...</div>; }
  if (error) { return <div className="error-message">{error}</div>; }
  if (!entry) { return <div>Entry not found.</div>; }

  return (
    <div className="entry-detail-container">
      <Link to="/insights" className="back-link" style={{ marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to All Insights
      </Link>

      <div className="journal-entry-card" style={{ marginBottom: '3rem' }}>
        <h1>{entry.title || 'Untitled Entry'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Written on {new Date(entry.created_at).toLocaleString()}
        </p>
        <div className="entry-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.1rem' }}>
          {entry.content}
        </div>
      </div>

      {entry.insights && entry.insights.length > 0 ? (
        <div className="insights-container">
          <h2>Associated Insights</h2>
          {entry.insights.map(insight => (
            <InsightCard key={insight.id} {...insight} />
          ))}
        </div>
      ) : (
        <p>There are no insights associated with this entry.</p>
      )}
    </div>
  );
}

export default EntryDetailPage;
