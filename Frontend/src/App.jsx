
import { useState } from 'react';
import './App.css';

// --- Mock Data and Functions ---
// In a real app, this would come from your backend AI service
const getMockPsychologicalInsight = (text) => {
  if (!text.trim()) return null;
  return {
    title: "Psychological Insight",
    icon: "🧠",
    content: "It sounds like you're facing a significant challenge. Acknowledging your feelings is a great first step. Remember to be kind to yourself. Breaking down the problem into smaller, manageable steps can often make it feel less overwhelming.",
  };
};

const getMockBiblicalInsight = () => ({
  title: "Biblical Insight",
  icon: "📖",
  content: "Come to me, all you who are weary and burdened, and I will give you rest.",
  cite: "Matthew 11:28"
});

const getMockIslamicInsight = () => ({
  title: "Islamic Insight",
  icon: "🕌",
  content: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
  cite: "Quran 65:2-3"
});


function App() {
  const [entry, setEntry] = useState("");
  const [psychologicalInsight, setPsychologicalInsight] = useState(null);
  const [biblicalInsight, setBiblicalInsight] = useState(null);
  const [islamicInsight, setIslamicInsight] = useState(null);

  const handleGetInsights = () => {
    // Reset previous insights
    setBiblicalInsight(null);
    setIslamicInsight(null);

    // Get new psychological insight
    const insight = getMockPsychologicalInsight(entry);
    setPsychologicalInsight(insight);
  };

  const handleShowBiblical = () => {
    setBiblicalInsight(getMockBiblicalInsight());
  };

  const handleShowIslamic = () => {
    setIslamicInsight(getMockIslamicInsight());
  };

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

      {psychologicalInsight && (
        <section className="insights-container">
          <div className="insight-card psychological">
            <h2><span className="icon">{psychologicalInsight.icon}</span> {psychologicalInsight.title}</h2>
            <p>{psychologicalInsight.content}</p>
            
            {!biblicalInsight && !islamicInsight && (
               <div className="spiritual-options">
                  <button className="spiritual-button biblical" onClick={handleShowBiblical}>
                    <span className="icon">📖</span> View Biblical Insight
                  </button>
                  <button className="spiritual-button islamic" onClick={handleShowIslamic}>
                    <span className="icon">🕌</span> View Islamic Insight
                  </button>
              </div>
            )}
          </div>

          {biblicalInsight && (
            <div className="insight-card biblical">
              <h2><span className="icon">{biblicalInsight.icon}</span> {biblicalInsight.title}</h2>
              <blockquote>{biblicalInsight.content}</blockquote>
              <cite>— {biblicalInsight.cite}</cite>
            </div>
          )}

          {islamicInsight && (
            <div className="insight-card islamic">
              <h2><span className="icon">{islamicInsight.icon}</span> {islamicInsight.title}</h2>
              <blockquote>{islamicInsight.content}</blockquote>
              <cite>— {islamicInsight.cite}</cite>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
