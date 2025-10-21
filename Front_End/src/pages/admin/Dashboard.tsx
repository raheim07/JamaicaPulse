import { useState, useEffect } from 'react';
import { Settings, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

interface TopicParameter {
  id: string;
  name: string;
  keywords: string[];
  weight: number;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  parameters: TopicParameter[];
  active: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAdmin = await authService.isAdmin();
        if (!isAdmin) {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // Load topics from your backend here
    setTopics([
      {
        id: '1',
        name: 'Crime',
        description: 'Crime-related discussions and sentiment',
        parameters: [
          { id: '1', name: 'Violence', keywords: ['violence', 'crime', 'murder'], weight: 0.8 },
          { id: '2', name: 'Safety', keywords: ['safety', 'security', 'protection'], weight: 0.7 }
        ],
        active: true
      }
    ]);
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      name: '',
      description: '',
      parameters: [],
      active: true
    };
    setSelectedTopic(newTopic);
    setShowNewTopicForm(true);
  };

  const handleSaveTopic = async (topic: Topic) => {
    // Implement save logic here
    if (showNewTopicForm) {
      setTopics([...topics, topic]);
    } else {
      setTopics(topics.map(t => t.id === topic.id ? topic : t));
    }
    setShowNewTopicForm(false);
    setSelectedTopic(null);
  };

  const handleDeleteTopic = async (topicId: string) => {
    // Implement delete logic here
    setTopics(topics.filter(t => t.id !== topicId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage sentiment analysis topics and parameters</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics List */}
          <div className="bg-white rounded-2xl p-6 shadow-lg lg:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Topics</h2>
              <button
                onClick={handleAddTopic}
                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTopic?.id === topic.id
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'border-2 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    <div className="flex items-center space-x-2">
                      {!topic.active && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <Settings className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Editor */}
          <div className="lg:col-span-2">
            {(selectedTopic || showNewTopicForm) ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {showNewTopicForm ? 'New Topic' : 'Edit Topic'}
                </h3>

                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      value={selectedTopic?.name || ''}
                      onChange={e => setSelectedTopic(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedTopic?.description || ''}
                      onChange={e => setSelectedTopic(prev => prev ? {...prev, description: e.target.value} : null)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Analysis Parameters
                    </label>
                    <div className="space-y-4">
                      {selectedTopic?.parameters.map((param, index) => (
                        <div key={param.id} className="p-4 border-2 border-gray-100 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Parameter Name</label>
                              <input
                                type="text"
                                value={param.name}
                                onChange={e => {
                                  const newParams = [...(selectedTopic?.parameters || [])];
                                  newParams[index] = { ...param, name: e.target.value };
                                  setSelectedTopic(prev => prev ? {...prev, parameters: newParams} : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Weight</label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={param.weight}
                                onChange={e => {
                                  const newParams = [...(selectedTopic?.parameters || [])];
                                  newParams[index] = { ...param, weight: parseFloat(e.target.value) };
                                  setSelectedTopic(prev => prev ? {...prev, parameters: newParams} : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Keywords (comma-separated)</label>
                            <input
                              type="text"
                              value={param.keywords.join(', ')}
                              onChange={e => {
                                const newParams = [...(selectedTopic?.parameters || [])];
                                newParams[index] = { 
                                  ...param, 
                                  keywords: e.target.value.split(',').map(k => k.trim()) 
                                };
                                setSelectedTopic(prev => prev ? {...prev, parameters: newParams} : null);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newParam: TopicParameter = {
                            id: Date.now().toString(),
                            name: '',
                            keywords: [],
                            weight: 1
                          };
                          setSelectedTopic(prev => prev ? {
                            ...prev,
                            parameters: [...prev.parameters, newParam]
                          } : null);
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTopic) {
                          handleDeleteTopic(selectedTopic.id);
                        }
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Topic
                    </button>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTopic(null);
                          setShowNewTopicForm(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedTopic) {
                            handleSaveTopic(selectedTopic);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Settings className="w-12 h-12 mb-4" />
                <p className="text-lg">Select a topic to edit its parameters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}