
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
  ArcElement, // <-- Import ArcElement for Doughnut chart
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2'; // <-- Import Doughnut

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement, // <-- Register ArcElement
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
  const [lineChartData, setLineChartData] = useState(null);
  const [emotionChartData, setEmotionChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedEntries = await journalAPI.getEntries();
        
        // Sort entries for consistency
        const sortedEntries = [...fetchedEntries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setEntries(sortedEntries);

        // Process data for the charts
        processLineChartData(sortedEntries);
        processEmotionChartData(sortedEntries);

      } catch (err) {
        console.error('Failed to load entries:', err);
        setError('Could not retrieve your data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processLineChartData = (entries) => {
    if (entries.length === 0) {
      setLineChartData(null);
      return;
    }
    const labels = entries.map(entry => new Date(entry.created_at).toLocaleDateString());
    const dataPoints = entries.map(entry => entry.mood_rating);
    setLineChartData({
      labels,
      datasets: [
        {
          label: 'Mood Rating',
          data: dataPoints,
          fill: true,
          borderColor: 'rgba(201, 168, 124, 0.8)',
          tension: 0.3,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(201, 168, 124, 1)',
          pointRadius: 5,
          pointHoverRadius: 7,
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
  
  const processEmotionChartData = (entries) => {
      const emotionCounts = entries
          .flatMap(entry => entry.detected_emotions || [])
          .reduce((acc, emotion) => {
              const capitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);
              acc[capitalized] = (acc[capitalized] || 0) + 1;
              return acc;
          }, {});

      const sortedEmotions = Object.entries(emotionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 7); // Get top 7

      if(sortedEmotions.length === 0) {
          setEmotionChartData(null);
          return;
      }
      
      setEmotionChartData({
          labels: sortedEmotions.map(([emotion]) => emotion),
          datasets: [{
              label: 'Emotion Count',
              data: sortedEmotions.map(([, count]) => count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)', // Red
                'rgba(54, 162, 235, 0.7)', // Blue
                'rgba(255, 206, 86, 0.7)', // Yellow
                'rgba(75, 192, 192, 0.7)', // Green
                'rgba(153, 102, 255, 0.7)', // Purple
                'rgba(255, 159, 64, 0.7)',  // Orange
                'rgba(199, 199, 199, 0.7)', // Grey
              ],
              borderColor: 'var(--background-end)', // Match background for a clean look
              borderWidth: 2,
          }]
      })
  };

  // --- Chart Options ---
  const lineChartOptions = { /* ... as before ... */ };
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
            color: 'var(--text-primary)',
            boxWidth: 20,
            padding: 20,
        }
      },
      tooltip: { /* ... as before ... */ },
    },
  };

  if (isLoading) { return <div>Loading dashboard...</div>; }
  if (error) { return <div className="error-message">{error}</div>; }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Visualizing your emotional journey and patterns over time.
      </p>

      {entries.length > 0 ? (
        <div className="dashboard-grid"> {/* NEW: Grid Layout */}
          {/* Mood Trend Chart (Takes up more space) */}
          <div className="journal-entry-card dashboard-card-large"> 
            <h2 style={{marginTop: 0}}>Mood Over Time</h2>
            <div style={{ height: '350px' }}>
              {lineChartData && <Line data={lineChartData} options={lineChartOptions} />}
            </div>
          </div>

          {/* Emotion Summary (Takes up less space) */}
          {emotionChartData && (
              <div className="journal-entry-card dashboard-card-small"> 
                  <h2 style={{marginTop: 0}}>Emotion Distribution</h2>
                  <div style={{ height: '350px', width: '100%' }}>
                      <Doughnut data={emotionChartData} options={doughnutChartOptions} />
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
