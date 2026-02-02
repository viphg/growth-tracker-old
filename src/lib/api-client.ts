// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // 移除/api后缀

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('API Client initialized with base URL:', this.baseUrl); // 调试信息
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making API request to:', url); // 调试信息
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log('API response status:', response.status); // 调试信息
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`); // 调试信息
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data); // 调试信息
      return data;
    } catch (error) {
      console.error(`API请求错误 ${url}:`, error);
      throw error;
    }
  }

  // Profiles API
  getProfile(userId: string) {
    console.log('Getting profile for user:', userId); // 调试信息
    return this.request(`/profiles/${userId}`);
  }

  upsertProfile(profile: any) {
    console.log('Upserting profile:', profile); // 调试信息
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Skills API
  getSkills(userId: string) {
    console.log('Getting skills for user:', userId); // 调试信息
    const params = new URLSearchParams({ user_id: userId });
    return this.request(`/skills?${params}`);
  }

  createSkill(skill: any) {
    console.log('Creating skill:', skill); // 调试信息
    return this.request('/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  updateSkill(skillId: string, updates: any) {
    console.log('Updating skill:', skillId, updates); // 调试信息
    return this.request(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  deleteSkill(skillId: string) {
    console.log('Deleting skill:', skillId); // 调试信息
    return this.request(`/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Goals API
  getGoals(userId: string) {
    console.log('Getting goals for user:', userId); // 调试信息
    const params = new URLSearchParams({ user_id: userId });
    return this.request(`/goals?${params}`);
  }

  createGoal(goal: any) {
    console.log('Creating goal:', goal); // 调试信息
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  updateGoal(goalId: string, updates: any) {
    console.log('Updating goal:', goalId, updates); // 调试信息
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  deleteGoal(goalId: string) {
    console.log('Deleting goal:', goalId); // 调试信息
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // Achievements API
  getAchievements(userId: string) {
    console.log('Getting achievements for user:', userId); // 调试信息
    const params = new URLSearchParams({ user_id: userId });
    return this.request(`/achievements?${params}`);
  }

  createAchievement(achievement: any) {
    console.log('Creating achievement:', achievement); // 调试信息
    return this.request('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievement),
    });
  }

  deleteAchievement(achievementId: string) {
    console.log('Deleting achievement:', achievementId); // 调试信息
    return this.request(`/achievements/${achievementId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();