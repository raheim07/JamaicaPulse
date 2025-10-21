import { TrendingUp, TrendingDown } from 'lucide-react';

interface PulseIndexCardProps {
  index: number;
  label: string;
  trend: string;
  lastUpdated: string;
}

export default function PulseIndexCard({ index, label, trend, lastUpdated }: PulseIndexCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium opacity-90">National Pulse Index</h2>
          <p className="text-sm opacity-75 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
        {trend === 'up' ? (
          <TrendingUp className="w-8 h-8" />
        ) : (
          <TrendingDown className="w-8 h-8" />
        )}
      </div>

      <div className="mt-6">
        <div className="text-7xl font-bold mb-2">{index}%</div>
        <div className="text-2xl font-semibold">{label}</div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <p className="text-sm opacity-90">
          This index represents the aggregated sentiment of Jamaicans based on public online discussions.
        </p>
      </div>
    </div>
  );
}
