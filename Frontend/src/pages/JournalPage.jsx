
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

const InsightIcons = {
  psychological: <BrainIcon />,
  biblical: <CrossIcon />,
  islamic: <CrescentIcon />,
};

function JournalPage() {
  const [entry, setEntry] = useState("");
  const [title, setTitle] = useState("");
  const [moodRating, setMoodRating] = useState(3);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null); // State to track the entry being edited

  // Load all entries on component mount
  useEffect(() => {
    loadAllEntries();
  }, []);

  const loadAllEntries = async () => {
    try {
      const entries = await journalAPI.getEntries();
      // Sort entries by date, newest first
      entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllEntries(entries);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError('Could not load your journal entries.');
    }
  };
  
  // Resets the form to its initial state
  const resetForm = () => {
    setTitle("");
    setEntry("");
    setMoodRating(3);
    setEditingEntry(null);
    setInsights([]);
    setError(null);
  };

  // Handles submission for both creating a new entry and updating an existing one
  const handleSubmit = async () => {
    if (!entry.trim()) return;
    
    setIsLoading(true);
    setError(null);

    const journalData = {
      title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: entry,
      mood_rating: moodRating
    };

    try {
      if (editingEntry) {
        // --- UPDATE --- //
        await journalAPI.updateEntry(editingEntry.id, journalData);
      } else {
        // --- CREATE --- //
        const response = await journalAPI.createEntry(journalData);
        if (response.insights && response.insights.length > 0) {
          setInsights(response.insights);
        } else {
          setInsights([]); // Clear any previous insights
        }
      }
      resetForm();
      await loadAllEntries(); // Refresh the list of entries
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError(err.error || 'Failed to save the journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepares the form for editing an existing entry
  const handleStartEdit = (entryToEdit) => {
    setEditingEntry(entryToEdit);
    setTitle(entryToEdit.title);
    setEntry(entryToEdit.content);
    setMoodRating(entryToEdit.mood_rating);
    setInsights([]); // Clear any generated insights from the form
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
  };

  // Deletes an entry after user confirmation
  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to permanently delete this entry?')) {
      try {
        await journalAPI.deleteEntry(entryId);
        await loadAllEntries(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete entry:', err);
        setError('Could not delete the entry. Please try again.');
      }
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
    <>
      <main className="journal-entry-card">
        <h1>{editingEntry ? 'Edit Journal Entry' : 'SoulLog'}</h1>
        <p>{editingEntry ? 'Update your thoughts and feelings below.' : 'Your safe space to reflect, understand, and grow.'}</p>
        
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
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="insight-button" 
            onClick={handleSubmit} 
            disabled={!entry.trim() || isLoading}
          >
            {isLoading ? (editingEntry ? 'Updating...' : 'Generating...') : (editingEntry ? 'Update Entry' : 'Get AI Insights')}
          </button>
          {editingEntry && (
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
        
        {error && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}
      </main>

      <div className="insights-container">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`${getInsightCardClass(insight.insight_type)} unfold`} 
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <h2>
              {InsightIcons[insight.insight_type]} 
              {insight.title}
            </h2>
            {formatInsightContent(insight)}
          </div>
        ))}
      </div>

      {allEntries.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
            My Journal Entries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {allEntries.map(entryItem => (
              <div 
                key={entryItem.id}
                style={{
                  background: 'var(--white)',
                  padding: '1rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px var(--shadow)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                    {entryItem.title || 'Untitled Entry'}
                  </h4>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    {new Date(entryItem.created_at).toLocaleDateString()}
                  </span>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {entryItem.content.length > 150 
                      ? entryItem.content.substring(0, 150) + '...' 
                      : entryItem.content
                    }
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                   <button className="edit-button" onClick={() => handleStartEdit(entryItem)}>Edit</button>
                   <button className="delete-button" onClick={() => handleDelete(entryItem.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default JournalPage;
