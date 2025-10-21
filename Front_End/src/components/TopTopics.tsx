import { Smile, Frown, Meh } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Topic {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface TopTopicsProps {
  topics: Topic[];
}

export default function TopTopics({ topics }: TopTopicsProps) {
  const navigate = useNavigate();

  const getDominantEmotion = (topic: Topic) => {
    if (topic.positive > topic.negative && topic.positive > topic.neutral) {
      return { icon: Smile, color: 'text-green-500', bg: 'bg-green-50', label: 'Positive' };
    } else if (topic.negative > topic.positive && topic.negative > topic.neutral) {
      return { icon: Frown, color: 'text-red-500', bg: 'bg-red-50', label: 'Negative' };
    }
    return { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Neutral' };
  };

  const handleTopicClick = (topicName: string) => {
    navigate('/topics', { state: { selectedTopic: topicName } });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Top 5 Topics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {topics.map((topic) => {
          const emotion = getDominantEmotion(topic);
          const Icon = emotion.icon;

          return (
            <div
              key={topic.name}
              className={`${emotion.bg} rounded-xl p-4 border-2 border-transparent hover:border-gray-200 transition-all cursor-pointer`}
              onClick={() => handleTopicClick(topic.name)}
              role="button"
              aria-label={`View details for ${topic.name}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${emotion.color}`} />
                <span className={`text-xs font-medium ${emotion.color}`}>
                  {emotion.label}
                </span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{topic.name}</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Positive</span>
                  <span className="font-medium">{(topic.positive * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Negative</span>
                  <span className="font-medium">{(topic.negative * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Neutral</span>
                  <span className="font-medium">{(topic.neutral * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
