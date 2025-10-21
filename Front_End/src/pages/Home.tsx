import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import PulseIndexCard from '../components/PulseIndexCard';
import TrendGraph from '../components/TrendGraph';
import TopTopics from '../components/TopTopics';

export default function Home() {
  const [pulse, setPulse] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pulseRes, trendsRes, topicsRes, platformsRes] = await Promise.all([
          apiService.getPulse(),
          apiService.getTrends(7),
          apiService.getTopics(),
          apiService.getPlatformDistribution()
        ]);

        setPulse(pulseRes.data);
        setTrends(trendsRes.data);
        setTopics(topicsRes.data);
        setPlatformData(platformsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading pulse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Jamaica Pulse</h1>
          <p className="text-gray-600">Real-time sentiment analysis of the nation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {pulse && (
            <PulseIndexCard
              index={pulse.index}
              label={pulse.label}
              trend={pulse.trend}
              lastUpdated={pulse.lastUpdated}
            />
          )}
          {trends.length > 0 && <TrendGraph data={trends} />}
        </div>

        {topics.length > 0 && (
          <div className="mb-8">
            <TopTopics topics={topics} />
          </div>
        )}

        {platformData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Platform Activity</h3>
              <div className="space-y-4">
                {Object.entries(platformData.distribution).map(([platform, count]: [string, any]) => (
                  <div key={platform} className="flex items-center">
                    <div className="w-32 font-medium text-gray-700">{platform}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(count / platformData.totalPosts) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm text-gray-500">
                      {count.toLocaleString()} posts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Top Topics</h3>
              <div className="space-y-4">
                {platformData.keywords.slice(0, 5).map((keyword: any) => (
                  <div key={keyword.word} className="flex items-center">
                    <div className="w-32 font-medium text-gray-700">{keyword.word}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full"
                          style={{ width: `${(keyword.count / platformData.maxKeywordCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-500">
                      {keyword.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
