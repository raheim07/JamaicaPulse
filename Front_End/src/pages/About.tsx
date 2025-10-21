import { Database, Brain, BarChart3, Globe, Shield, AlertCircle} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">About Jamaica Pulse</h1>
          <p className="text-gray-600">Understanding how we measure Jamaica's sentiment</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Jamaica Pulse is a real-time sentiment intelligence dashboard that provides decision-makers,
            journalists, and citizens with insights into how Jamaicans are feeling about current issues.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Using advanced natural language processing trained to understand Caribbean English and Patois,
            we analyze public online discussions to provide real-time accurate emotional insights that global tools miss.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Data Collection</h3>
                <p className="text-gray-600">
                  We collect public data from social media platforms (Twitter/X, YouTube, TikTok) and news
                  comments, filtered by location and relevant keywords like crime, economy, healthcare, and education.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. AI Processing</h3>
                <p className="text-gray-600">
                  Our Jamaican-aware NLP model, fine-tuned on Caribbean dialect, analyzes the emotional content
                  and classifies sentiment into positive, negative, and neutral categories with high accuracy.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Aggregation</h3>
                <p className="text-gray-600">
                  Data is aggregated by topic, region, and time period. We store only summarized insights,
                  never personal information or identifiable data.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Visualization</h3>
                <p className="text-gray-600">
                  The processed insights are displayed through this interactive dashboard, updated regularly
                  to provide real-time understanding of national sentiment.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Important Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This dashboard analyzes public data for research and awareness purposes. It does not represent
                official statistics or government data.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The sentiment scores reflect aggregated emotional trends from online discussions and should be
                interpreted as indicators of public discourse, not as definitive measures of public opinion.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-start">
            <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy & Ethics</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Anonymized Data:</strong> We only analyze publicly available
                    content. No usernames, handles, or personal identifiers are stored or displayed.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Aggregated Results:</strong> All data is aggregated and
                    summarized. Individual posts or comments are never shown or attributed.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Content Filtering:</strong> Our system filters out spam,
                    hate speech, and bot-generated content to ensure data quality.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Transparency:</strong> We are committed to operating with
                    full transparency about our data sources, methods, and limitations.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Research Focus:</strong> This tool is designed for
                    understanding emotional trends, not for tracking individuals or groups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Pulse of the Nation &copy; 2025 - Built for understanding Jamaica's collective voice</p>
        </div>
      </div>
    </div>
  );
}
