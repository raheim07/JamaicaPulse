import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { Doughnut, Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Optional route state
interface LocationState {
  selectedTopic?: string;
}

// Helper to generate consistent colors per topic
const COLORS = ['#10B981', '#F87171', '#FBBF24', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'];
const getColor = (index: number) => COLORS[index % COLORS.length];

export default function Topics() {
  const location = useLocation();
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [allTopicTrends, setAllTopicTrends] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>(''); // AI summary state
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  // -------------------------
  // Fetch topics summary
  // -------------------------
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await apiService.getTopics();
        setTopics(res.data);

        const state = location.state as LocationState;
        if (state?.selectedTopic) setSelectedTopic(state.selectedTopic);
        else if (res.data.length > 0) setSelectedTopic(res.data[0].name);
      } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };

    fetchTopics();
  }, [location.state]);

  // -------------------------
  // Fetch all topic trends
  // -------------------------
  useEffect(() => {
    if (!selectedTopic) return;

    const fetchTopicTrends = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:5000/topics/trends');
        const data = res.data as Record<string, { date: string; sentiment: number }[]>;

        setAllTopicTrends(prev => ({
          ...prev,
          [selectedTopic]: data[selectedTopic] ?? []
        }));
      } catch (err) {
        console.error('Error fetching topic trends:', err);
        setAllTopicTrends(prev => ({ ...prev, [selectedTopic]: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchTopicTrends();
  }, [selectedTopic]);

  // Replace the useEffect that fetches topic trends with this:

// -------------------------
// Fetch topic details including trends
// -------------------------
useEffect(() => {
  if (!selectedTopic) return;

  const fetchTopicDetails = async () => {
    setLoading(true);
    try {
      // Use apiService to get topic details including trends
      const res = await apiService.getTopicDetails(selectedTopic);
      
      // Update the trends for this topic
      setAllTopicTrends(prev => ({
        ...prev,
        [selectedTopic]: res.data.trend || []
      }));
    } catch (err) {
      console.error('Error fetching topic details:', err);
      setAllTopicTrends(prev => ({ ...prev, [selectedTopic]: [] }));
    } finally {
      setLoading(false);
    }
  };

  fetchTopicDetails();
}, [selectedTopic]);

// Fetch AI summary for selected topic from backend
// -------------------------
useEffect(() => {
  if (!selectedTopic) return;

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/summarize_topic_ai/${encodeURIComponent(selectedTopic)}`
      );
      setSummary(res.data.summary || "No summary available.");
    } catch (err) {
      console.error('Error fetching AI summary:', err);
      setSummary("Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  fetchSummary();
}, [selectedTopic]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading topics...</p>
        </div>
      </div>
    );
  }

  const currentTopic = topics.find(t => t.name === selectedTopic);

  const emotionChartData = currentTopic
    ? {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            data: [
              currentTopic.positive * 100,
              currentTopic.negative * 100,
              currentTopic.neutral * 100
            ],
            backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(239,68,68,0.8)', 'rgba(156,163,175,0.8)'],
            borderColor: ['rgb(34,197,94)', 'rgb(239,68,68)', 'rgb(156,163,175)'],
            borderWidth: 2
          }
        ]
      }
    : null;

  const trendChartData = {
    labels: allTopicTrends[selectedTopic]?.map(d =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: selectedTopic,
        data: allTopicTrends[selectedTopic]?.map(d => d.sentiment) || [],
        borderColor: getColor(topics.findIndex(t => t.name === selectedTopic)),
        backgroundColor: 'rgba(0,0,0,0)',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        borderWidth: 4,
        pointBackgroundColor: getColor(topics.findIndex(t => t.name === selectedTopic)),
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
      }
    ]
  };

  const trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Topic Insights</h1>
          <p className="text-gray-600">Explore sentiment by category</p>
        </div>

        {/* Topic Selector */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {topics.map(t => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emotion Donut */}
          {emotionChartData && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Emotion Distribution: {selectedTopic}</h3>
              <div className="flex justify-center">
                <Doughnut data={emotionChartData} height={250} width={250} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{(currentTopic.positive*100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{(currentTopic.negative*100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Negative</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{(currentTopic.neutral*100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Neutral</div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-line trend chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">7-Day Sentiment Trends</h3>
            <div className="h-80">
              <Line data={trendChartData} options={trendOptions} />
            </div>
          </div>
        </div>

        {/* ------------------------- */}
        {/* AI Summary Card */}
        {/* ------------------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">AI Summary: {selectedTopic}</h3>
          {summaryLoading ? (
            <p className="text-gray-600">Generating AI summary...</p>
          ) : (
            <p className="text-gray-700">{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}
