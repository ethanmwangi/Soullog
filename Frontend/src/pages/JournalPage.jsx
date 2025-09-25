
import { useState } from 'react';
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

// --- Mock Insight Functions ---
const getMockPsychologicalInsight = (text) => {
  if (!text.trim()) return null;
  return {
    type: 'psychological',
    title: "Psychological Insight",
    content: "It sounds like you're facing a significant challenge. Acknowledging your feelings is a great first step. Remember to be kind to yourself. Breaking down the problem into smaller, manageable steps can often make it feel less overwhelming.",
  };
};

const getMockBiblicalInsight = () => ({
  type: 'biblical',
  title: "Biblical Insight",
  content: "Come to me, all you who are weary and burdened, and I will give you rest.",
  cite: "Matthew 11:28"
});

const getMockIslamicInsight = () => ({
  type: 'islamic',
  title: "Islamic Insight",
  content: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
  cite: "Quran 65:2-3"
});

// --- Icon Mapping ---
const InsightIcons = {
  psychological: <BrainIcon />,
  biblical: <CrossIcon />,
  islamic: <CrescentIcon />,
};

function JournalPage() {
  const [entry, setEntry] = useState("");
  const [insights, setInsights] = useState([]);

  const handleGetInsights = () => {
    const psychoInsight = getMockPsychologicalInsight(entry);
    if (psychoInsight) {
      setInsights([psychoInsight]);
    }
  };

  const handleShowSpiritual = (type) => {
    const newInsight = type === 'biblical' ? getMockBiblicalInsight() : getMockIslamicInsight();
    setInsights(prev => [...prev, newInsight]);
  };

  const hasShownSpiritualOptions = insights.length > 1;

  return (
    <div className="app-container">
      <main className="journal-entry-card">
        <h1>SoulLog</h1>
        <p>Your safe space to reflect, understand, and grow.</p>
        <textarea
          placeholder="What's on your mind?"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
        <button className="insight-button" onClick={handleGetInsights} disabled={!entry.trim()}>
          Get Insights
        </button>
      </main>

      <div className="insights-container">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type}`}>
            <h2>{InsightIcons[insight.type]} {insight.title}</h2>
            {insight.content && (insight.cite ? <blockquote>{insight.content}</blockquote> : <p>{insight.content}</p>)}
            {insight.cite && <cite>— {insight.cite}</cite>}

            {insight.type === 'psychological' && !hasShownSpiritualOptions && (
               <div className="spiritual-options">
                  <button className="spiritual-button biblical" onClick={() => handleShowSpiritual('biblical')}>
                     <CrossIcon /> View Biblical Insight
                  </button>
                  <button className="spiritual-button islamic" onClick={() => handleShowSpiritual('islamic')}>
                    <CrescentIcon /> View Islamic Insight
                  </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default JournalPage;
