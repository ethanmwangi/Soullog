
// Frontend/src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { journalAPI } from '../services/api';
import '../App.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler for the gradient
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Main Component ---
function DashboardPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [emotionSummary, setEmotionSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedEntries = await journalAPI.getEntries();
        
        // Sort entries by date, oldest first for the chart
        fetchedEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setEntries(fetchedEntries);

        // Process data for the chart
        processChartData(fetchedEntries);
        processEmotionSummary(fetchedEntries);

      } catch (err) {
        console.error('Failed to load entries:', err);
        setError('Could not retrieve your data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processChartData = (entries) => {
    if (entries.length === 0) {
      setChartData(null);
      return;
    }

    const labels = entries.map(entry => new Date(entry.created_at).toLocaleDateString());
    const dataPoints = entries.map(entry => entry.mood_rating);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Mood Rating',
          data: dataPoints,
          fill: true, // This is important for the gradient
          borderColor: 'rgba(201, 168, 124, 0.8)', // --accent-gold
          tension: 0.3, // Makes the line smoother
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(201, 168, 124, 1)',
          pointRadius: 5,
          pointHoverRadius: 7,
          // The gradient background
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(201, 168, 124, 0.5)');
            gradient.addColorStop(1, 'rgba(201, 168, 124, 0)');
            return gradient;
          },
        },
      ],
    });
  };
  
  const processEmotionSummary = (entries) => {
      const emotionCounts = entries
          .flatMap(entry => entry.detected_emotions || [])
          .reduce((acc, emotion) => {
              acc[emotion] = (acc[emotion] || 0) + 1;
              return acc;
          }, {});

      const sortedEmotions = Object.entries(emotionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5); // Get top 5

      setEmotionSummary(sortedEmotions);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows custom height
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)', // Lighter grid lines
        }
      },
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        }
      }
    },
    plugins: {
      legend: {
        display: false, // We can hide the legend if it's obvious
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        displayColors: false, // Hides the little color box in the tooltip
      },
    },
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Visualizing your emotional journey and patterns over time.
      </p>

      {entries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Mood Trend Chart */}
          <div className="journal-entry-card" style={{ padding: '2rem' }}>
            <h2 style={{marginTop: 0}}>Mood Over Time</h2>
            <div style={{ height: '300px' }}>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Emotion Summary */}
          {emotionSummary && emotionSummary.length > 0 && (
              <div className="journal-entry-card" style={{ padding: '2rem' }}>
                  <h2 style={{marginTop: 0}}>Common Emotions</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                      {emotionSummary.map(([emotion, count]) => (
                          <div key={emotion} style={{
                              background: 'var(--background-start)',
                              padding: '0.75rem 1.25rem',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              boxShadow: '0 2px 4px var(--shadow)',
                              textTransform: 'capitalize'
                          }}>
                              {emotion} <span style={{color: 'var(--text-secondary)', marginLeft: '0.5rem'}}>({count})</span>
                          </div>
                      ))ท
                  </div>
              </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--white)', borderRadius: '12px' }}>
          <h2>No Data Yet</h2>
          <p>You need to write at least one journal entry to see your dashboard.</p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
