
// Frontend/src/pages/InsightsPage.jsx

import { useState, useEffect } from 'react';
import { journalAPI } from '../services/api';
import '../App.css';

// --- SVG Icon Components ---
const BrainIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 3.5c1.14 0 2.28.38 3.24 1.1a6.5 6.5 0 0 1 5.26 6.4v2a6.5 6.5 0 0 1-6.5 6.5h-1a6.5 6.5 0 0 1-6.5-6.5v-2A6.5 6.5 0 0 1 9.5 3.5z" /><path d="M14.5 3.5c1.14 0 2.28.38 3.24 1.1" /><path d="M12 13a2.5 2.5 0 0 0-2.5 2.5V18" /><path d="M12 13a2.5 2.5 0 0 1 2.5 2.5V18" /><path d="M12 3V1" /><path d="M9.5 21v-2.5" /><path d="M14.5 21v-2.5" /></svg> );
const CrossIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v5H6v2h5v11h2V10h5V8h-5z" /></svg> );
const CrescentIcon = () => ( <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.28.43A11.5 11.5 0 0 0 3.8 17.8a11.5 11.5 0 0 0 14.98 3.77 11.5 11.5 0 0 0 3.77-14.98A11.5 11.5 0 0 0 12.28.43zm5.4 17.5a9.5 9.5 0 0 1-12.8-10.45 9.5 9.5 0 0 1 10.44-2.34A9.5 9.5 0 0 1 17.68 18z"/><path d="M15.5 8.5l-1.5 3 3 1.5-1.5 3-3-1.5-3 1.5 1.5-3-3-1.5 3-1.5 1.5-3 1.5 3z"/></svg> );

const InsightIcons = { psychological: <BrainIcon />, biblical: <CrossIcon />, islamic: <CrescentIcon /> };
const INSIGHT_TYPES = ['psychological', 'biblical', 'islamic'];

// --- Main Component ---
function InsightsPage() {
  const [allInsights, setAllInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'psychological', 'biblical', etc.

  useEffect(() => {
    const fetchAllInsights = async () => {
      setIsLoading(true);
      try {
        const entries = await journalAPI.getEntries();
        const insightsWithDate = entries.flatMap(entry => 
          entry.insights.map(insight => ({ ...insight, entryDate: entry.created_at, entryTitle: entry.title }))
        );
        insightsWithDate.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
        setAllInsights(insightsWithDate);
      } catch (err) {
        console.error('Failed to load insights:', err);
        setError('Could not retrieve your insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllInsights();
  }, []);

  // Derived state for filtered insights
  const filteredInsights = allInsights.filter(insight => 
    filter === 'all' || insight.insight_type === filter
  );

  const formatInsightContent = (insight) => { /* ... as before ... */ };
  const getInsightCardClass = (insightType) => `insight-card ${insightType}`;

  if (isLoading) { return <div>Loading your insights...</div>; }
  if (error) { return <div className="error-message">{error}</div>; }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My Insight Gallery</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        A complete collection of all the AI-generated insights from your journal entries.
      </p>

      {/* --- Filter Buttons --- */}
      <div className="filter-container" style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setFilter('all')} 
          className={`filter-button ${filter === 'all' ? 'filter-button-active' : ''}`}>
          All
        </button>
        {INSIGHT_TYPES.map(type => (
          <button 
            key={type} 
            onClick={() => setFilter(type)} 
            className={`filter-button ${filter === type ? 'filter-button-active' : ''}`}>
            {InsightIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      {allInsights.length > 0 ? (
        <div className="insights-container">
          {filteredInsights.map((insight, index) => (
            <div 
              key={insight.id || index}
              className={`${getInsightCardClass(insight.insight_type)} unfold`}
              style={{ animationDelay: `${index * 0.1}s` }} // Animation is re-triggered on filter change
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ marginBottom: 0 }}>
                  {InsightIcons[insight.insight_type]} 
                  {insight.title}
                </h2>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(insight.entryDate).toLocaleDateString()}
                </span>
              </div>
              {formatInsightContent(insight)}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                From entry: <em>{insight.entryTitle || 'Untitled Entry'}</em>
              </p>
            </div>
          ))}
          {filteredInsights.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
              <h2>No insights of this type yet.</h2>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--white)', borderRadius: '12px' }}>
          <h2>No Insights Yet</h2>
          <p>Go to the 'Journal' page to write an entry and get your first one!</p>
        </div>
      )}
    </div>
  );
}

export default InsightsPage;
