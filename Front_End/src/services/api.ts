// services/api.ts
import axios from 'axios';

// Base URL of your Flask backend
const API_BASE = 'http://127.0.0.1:5000';
// Normalize polarity (-1 to 1) to 0-100 scale
const normalizeSentiment = (polarity: number) => Math.round((polarity + 1) * 50);


export const apiService = {
  /**
   * Get overall pulse metrics
   * We'll calculate index, label, trend, lastUpdated on frontend for now
   */
  getPulse: async () => {
    const response = await axios.get(`${API_BASE}/bulk`);
    const posts = Array.isArray(response.data) ? response.data : [];

    if (!posts.length) return { data: { index: 50, label: "Neutral", trend: "neutral", lastUpdated: new Date().toISOString() } };

    // Normalize polarity for index calculation
    const normalizedPolarity = posts.map(p => normalizeSentiment(p.polarity));

    const index = Math.round(normalizedPolarity.reduce((a, b) => a + b, 0) / normalizedPolarity.length);
    const label = index > 60 ? "Optimistic" : index < 40 ? "Pessimistic" : "Neutral";

    const trendValues = posts.slice(-2).map(p => normalizeSentiment(p.polarity));
    const trend = trendValues[1] > trendValues[0] ? "up" : "down";

    return {
      data: {
        index,
        label,
        trend,
        lastUpdated: new Date().toISOString()
      }
    };
  },

  /**
   * Get topics with sentiment distribution
   */
  getTopics: async () => {
    const response = await axios.get(`${API_BASE}/bulk`);
    const posts = response.data;

    // Group by categories and calculate positive/negative/neutral
    const categoryMap: Record<string, { positive: number; negative: number; neutral: number; count: number }> = {};

    posts.forEach((post: any) => {
      post.categories.forEach((cat: string) => {
        if (!categoryMap[cat]) categoryMap[cat] = { positive: 0, negative: 0, neutral: 0, count: 0 };

        if (post.sentiment === "Positive") categoryMap[cat].positive += 1;
        else if (post.sentiment === "Negative") categoryMap[cat].negative += 1;
        else categoryMap[cat].neutral += 1;

        categoryMap[cat].count += 1;
      });
    });

    const topics = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      positive: data.positive / data.count,
      negative: data.negative / data.count,
      neutral: data.neutral / data.count
    }));

    return { data: topics };
  },

  /**
 * Get topic details with trend (last 7 days)
 */
getTopicDetails: async (topic: string) => {
  try {
    // Use the specific topic trends endpoint
    const response = await axios.get(`${API_BASE}/topics/trends/${encodeURIComponent(topic)}`);
    
    // If the specific endpoint doesn't work, fall back to the current logic
    if (!response.data.trend || response.data.trend.length === 0) {
      const bulkResponse = await axios.get(`${API_BASE}/bulk`);
      const posts = bulkResponse.data.filter((p: any) => 
        p.categories && p.categories.includes(topic)
      );

      // Generate simple trend for last 7 days
      const trendMap: Record<string, number[]> = {};
      posts.forEach((p: any) => {
        const date = new Date(p.timestamp || new Date()).toISOString().split('T')[0];
        if (!trendMap[date]) trendMap[date] = [];
        trendMap[date].push(normalizeSentiment(p.polarity));
      });

      const trend = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, vals]) => ({
          date,
          sentiment: vals.reduce((sum, v) => sum + v, 0) / vals.length
        }));

      // Calculate overall positive/negative/neutral for topic
      const total = posts.length || 1;
      const positive = posts.filter((p: any) => p.sentiment === "Positive").length / total;
      const negative = posts.filter((p: any) => p.sentiment === "Negative").length / total;
      const neutral = posts.filter((p: any) => p.sentiment === "Neutral").length / total;

      return {
        data: {
          name: topic,
          positive,
          negative,
          neutral,
          trend
        }
      };
    }

    // Use data from the specific topic trends endpoint
    const trend = response.data.trend;
    
    // Get sentiment distribution from bulk data
    const bulkResponse = await axios.get(`${API_BASE}/bulk`);
    const posts = bulkResponse.data.filter((p: any) => 
      p.categories && p.categories.includes(topic)
    );
    
    const total = posts.length || 1;
    const positive = posts.filter((p: any) => p.sentiment === "Positive").length / total;
    const negative = posts.filter((p: any) => p.sentiment === "Negative").length / total;
    const neutral = posts.filter((p: any) => p.sentiment === "Neutral").length / total;

    return {
      data: {
        name: topic,
        positive,
        negative,
        neutral,
        trend
      }
    };
  } catch (error) {
    console.error(`Error fetching details for topic ${topic}:`, error);
    
    // Fallback to empty data
    return {
      data: {
        name: topic,
        positive: 0,
        negative: 0,
        neutral: 0,
        trend: []
      }
    };
  }
},

  getTopicTrends: async (): Promise<{ data: Record<string, any[]> }> => {
  const response = await axios.get(`${API_BASE}/topics/trends`);
  return response.data;
  },


  /**
   * Get trends (temporal sentiment)
   * days: number of days to look back
   */
   getTrends: async (days: number = 7) => {
    const response = await axios.get(`${API_BASE}/bulk`);
    const posts = Array.isArray(response.data) ? response.data : [];

    const dailyMap: Record<string, number[]> = {};
    posts.forEach((p: any) => {
      const date = new Date(p.timestamp || new Date()).toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(normalizeSentiment(p.polarity));
    });

    const trend = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-days)
      .map(([date, vals]) => ({
        date,
        sentiment: vals.reduce((sum, v) => sum + v, 0) / vals.length
      }));

    return { data: trend };
  },

  /**
   * Get platform distribution and keywords
   */
 getPlatformDistribution: async () => {
  const response = await axios.get(`${API_BASE}/bulk`);
  const posts = response.data;

  // Assert that each platform is a string
  const platforms = Array.from(new Set(posts.map((p: any) => p.platform))) as string[];

  const distribution: Record<string, number> = {};
  const sentimentByPlatform: Record<string, any> = {};

  platforms.forEach((platform) => {
    const pPosts = posts.filter((p: any) => p.platform === platform);
    distribution[platform] = pPosts.length;

    const total = pPosts.length;
    const positive = pPosts.filter((p: any) => p.sentiment === "Positive").length / total || 0;
    const negative = pPosts.filter((p: any) => p.sentiment === "Negative").length / total || 0;
    const neutral = pPosts.filter((p: any) => p.sentiment === "Neutral").length / total || 0;

    sentimentByPlatform[platform] = { positive, negative, neutral, total };
  });

  // Top keywords (by category counts)
  const keywordMap: Record<string, number> = {};
  posts.forEach((p: any) => {
    p.categories.forEach((cat: string) => {
      keywordMap[cat] = (keywordMap[cat] || 0) + 1;
    });
  });

  const keywords = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));

  const maxKeywordCount = keywords[0]?.count || 1;

  // Most active platform
  const mostActive = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const topTopic = keywords[0]?.word || '';

  return {
    data: {
      totalPosts: posts.length,
      mostActive,
      topTopic,
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        count: posts.filter((p: any) => {
          const hour = new Date(p.timestamp || new Date()).getHours();
          return hour === i;
        }).length
      })),
      distribution,
      keywords,
      maxKeywordCount,
      sentimentByPlatform
    }
  };
}
}