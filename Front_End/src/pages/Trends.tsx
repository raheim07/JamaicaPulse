import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { MessageSquare, TrendingUp, Activity, Hash, Download } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Trends() {
  const [loading, setLoading] = useState(true); // Loading spinner
  const [insights, setInsights] = useState<any>(null); // Full dataset from backend
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d'); // Time filter
  const [selectedPlatform, setSelectedPlatform] = useState('all'); // Platform filter

  // ------------------------------
  // Fetch trends and platform summary from backend
  // ------------------------------
// Map selectedTimeRange to number of days
const timeRangeMap: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30
};

useEffect(() => {
  const fetchInsights = async () => {
    try {
      const days = timeRangeMap[selectedTimeRange] || 7; // default 7 days

      const [trendsResponse, platformsResponse] = await Promise.all([
        apiService.getTrends(days), // pass number, not string
        apiService.getPlatformDistribution()
      ]);
      
      setInsights({
        trends: trendsResponse.data,
        platforms: platformsResponse.data
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchInsights();
}, [selectedTimeRange]);


  // ------------------------------
  // Loading spinner
  // ------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  // ------------------------------
  // Helper: Average sentiment across trends
  // ------------------------------
  const getAverageSentiment = () => {
    if (!insights?.trends) return 0;
    const sum = insights.trends.reduce((acc: number, curr: any) => acc + curr.sentiment, 0);
    return Math.round(sum / insights.trends.length);
  };

  // Helper: color based on sentiment score
  const getSentimentColor = (score: number) => {
    if (score >= 60) return 'text-emerald-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // ------------------------------
  // Export JSON data to file
  // ------------------------------
  const handleExportData = () => {
    if (!insights) return;

    const exportData = {
      date: new Date().toISOString(),
      timeRange: selectedTimeRange,
      platform: selectedPlatform,
      summary: {
        totalPosts: insights.platforms.totalPosts,
        averageSentiment: getAverageSentiment(),
        mostActivePlatform: insights.platforms.mostActive,
        topTopic: insights.platforms.topTopic
      },
      platformDistribution: insights.platforms.distribution,
      hourlyActivity: insights.platforms.hourlyActivity,
      keywords: insights.platforms.keywords,
      sentimentByPlatform: insights.platforms.sentimentByPlatform
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jamaica-pulse-trends-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Trend Analysis</h1>
          <p className="text-gray-600">Real-time insights across platforms and topics</p>
        </div>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Posts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-gray-500">Last 24h</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {insights.platforms.totalPosts.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Total Posts</p>
          </div>

          {/* Average Sentiment */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-emerald-500" />
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <h3 className={`text-2xl font-bold ${getSentimentColor(getAverageSentiment())}`}>
              {getAverageSentiment()}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Sentiment Score</p>
          </div>

          {/* Most Active Platform */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-gray-500">Most Active</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {insights.platforms.mostActive}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Platform</p>
          </div>

          {/* Top Topic */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Hash className="w-8 h-8 text-orange-500" />
              <span className="text-sm text-gray-500">Trending</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {insights.platforms.topTopic}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Top Topic</p>
          </div>
        </div>

        {/* Time & Platform Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Time Range:</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                <label className="text-sm font-medium text-gray-700 ml-8">Platform:</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Platforms</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {/* Export JSON */}
              <button
                onClick={handleExportData}
                className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Over Time */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Activity by Time</h3>
            <div className="h-80">
              {insights.platforms.hourlyActivity && (
                <Line
                  data={{
                    labels: insights.platforms.hourlyActivity.map((h: any) => h.hour),
                    datasets: [
                      {
                        label: 'Posts',
                        data: insights.platforms.hourlyActivity.map((h: any) => h.count),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              )}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Platform Distribution</h3>
            <div className="h-80">
              {insights.platforms.distribution && (
                <Bar
                  data={{
                    labels: Object.keys(insights.platforms.distribution),
                    datasets: [
                      {
                        label: 'Posts',
                        data: Object.values(insights.platforms.distribution),
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(249, 115, 22, 0.8)'
                        ]
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Keywords & Sentiment By Platform */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Keywords */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Top Keywords</h3>
            <div className="space-y-4">
              {insights.platforms.keywords?.map((keyword: any) => (
                <div key={keyword.word} className="flex items-center">
                  <div className="w-32 font-medium text-gray-700">{keyword.word}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(keyword.count / insights.platforms.maxKeywordCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-500">{keyword.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment by Platform */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Sentiment by Platform</h3>
            <div className="space-y-6">
              {Object.entries(insights.platforms.sentimentByPlatform || {}).map(([platform, data]: [string, any]) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{platform}</span>
                    <span className="text-sm text-gray-500">{data.total.toLocaleString()} posts</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500" style={{ width: `${data.negative * 100}%` }} />
                    <div className="bg-gray-300" style={{ width: `${data.neutral * 100}%` }} />
                    <div className="bg-green-500" style={{ width: `${data.positive * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{(data.negative * 100).toFixed(0)}% Negative</span>
                    <span>{(data.neutral * 100).toFixed(0)}% Neutral</span>
                    <span>{(data.positive * 100).toFixed(0)}% Positive</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
