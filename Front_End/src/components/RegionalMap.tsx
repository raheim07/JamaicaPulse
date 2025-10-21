import { MapPin } from 'lucide-react';

interface Region {
  parish: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface RegionalMapProps {
  regions: Region[];
}

export default function RegionalMap({ regions }: RegionalMapProps) {
  const getSentimentScore = (region: Region) => {
    return (region.positive * 100 - region.negative * 100 + 50).toFixed(0);
  };

  const getSentimentColor = (score: number) => {
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const topRegions = [...regions]
    .sort((a, b) => parseFloat(getSentimentScore(b)) - parseFloat(getSentimentScore(a)))
    .slice(0, 3);

  const bottomRegions = [...regions]
    .sort((a, b) => parseFloat(getSentimentScore(a)) - parseFloat(getSentimentScore(b)))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Regional Sentiment</h3>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-green-700 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Most Positive Parishes
          </h4>
          <div className="space-y-3">
            {topRegions.map((region) => {
              const score = parseFloat(getSentimentScore(region));
              return (
                <div key={region.parish} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-800">{region.parish}</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getSentimentColor(score)} mr-2`} />
                    <span className="font-bold text-green-700">{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-red-700 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Most Concerned Parishes
          </h4>
          <div className="space-y-3">
            {bottomRegions.map((region) => {
              const score = parseFloat(getSentimentScore(region));
              return (
                <div key={region.parish} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-800">{region.parish}</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getSentimentColor(score)} mr-2`} />
                    <span className="font-bold text-red-700">{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">All Parishes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regions.map((region) => {
            const score = parseFloat(getSentimentScore(region));
            return (
              <div key={region.parish} className="flex flex-col p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">{region.parish}</span>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full ${getSentimentColor(score)} mr-2`} />
                  <span className="text-xs font-semibold">{score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
