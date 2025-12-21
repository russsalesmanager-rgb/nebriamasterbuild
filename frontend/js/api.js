/*
 * Nebria Frontend API Client
 * 
 * This module provides a clean interface to the Nebria backend API.
 * It handles authentication, token management, and all API calls.
 */

// Configuration
window.NEBRIA_CONFIG = window.NEBRIA_CONFIG || {
  API_BASE_URL: 'http://localhost:3000/api',
  WS_URL: 'http://localhost:3000'
};

// Token Management
const TokenManager = {
  getAccessToken() {
    return localStorage.getItem('nebria_access_token');
  },
  
  setAccessToken(token) {
    localStorage.setItem('nebria_access_token', token);
  },
  
  getRefreshToken() {
    return localStorage.getItem('nebria_refresh_token');
  },
  
  setRefreshToken(token) {
    localStorage.setItem('nebria_refresh_token', token);
  },
  
  clearTokens() {
    localStorage.removeItem('nebria_access_token');
    localStorage.removeItem('nebria_refresh_token');
  },
  
  isAuthenticated() {
    return !!this.getAccessToken();
  }
};

// HTTP Client
const httpClient = {
  async request(method, endpoint, data = null, requiresAuth = false) {
    const url = `${window.NEBRIA_CONFIG.API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requiresAuth) {
      const token = TokenManager.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers,
      mode: 'cors',
      credentials: 'include'
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error?.message || json.message || 'Request failed');
      }
      
      return json;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  },
  
  get(endpoint, requiresAuth = false) {
    return this.request('GET', endpoint, null, requiresAuth);
  },
  
  post(endpoint, data, requiresAuth = false) {
    return this.request('POST', endpoint, data, requiresAuth);
  },
  
  put(endpoint, data, requiresAuth = false) {
    return this.request('PUT', endpoint, data, requiresAuth);
  },
  
  delete(endpoint, requiresAuth = false) {
    return this.request('DELETE', endpoint, null, requiresAuth);
  }
};

// Authentication API
const AuthAPI = {
  async register(username, email, password) {
    const response = await httpClient.post('/auth/register', {
      username,
      email,
      password
    });
    return response;
  },
  
  async login(email, password) {
    const response = await httpClient.post('/auth/login', {
      email,
      password
    });
    
    if (response.accessToken) {
      TokenManager.setAccessToken(response.accessToken);
    }
    if (response.refreshToken) {
      TokenManager.setRefreshToken(response.refreshToken);
    }
    
    return response;
  },
  
  async refresh() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await httpClient.post('/auth/refresh', {
      refreshToken
    });
    
    if (response.accessToken) {
      TokenManager.setAccessToken(response.accessToken);
    }
    
    return response;
  },
  
  logout() {
    TokenManager.clearTokens();
    window.location.reload();
  }
};

// Posts API
const PostsAPI = {
  async getFeed(options = {}) {
    const { zoneKey, limit = 50, offset = 0 } = options;
    let endpoint = `/posts?limit=${limit}&offset=${offset}`;
    
    if (zoneKey) {
      endpoint += `&zone_key=${zoneKey}`;
    }
    
    const response = await httpClient.get(endpoint);
    return response;
  },
  
  async getPost(id) {
    const response = await httpClient.get(`/posts/${id}`);
    return response;
  },
  
  async createPost(postData) {
    const { content, type = 'TEXT', mediaId, zoneKey = 'home', zoneType } = postData;
    const response = await httpClient.post('/posts', {
      content,
      type,
      mediaId,
      zoneKey,
      zoneType
    }, true);
    return response;
  },
  
  async deletePost(id) {
    const response = await httpClient.delete(`/posts/${id}`, true);
    return response;
  },
  
  async flagIllegal(id, reason) {
    const response = await httpClient.post(`/posts/${id}/flag-illegal`, {
      reason
    }, true);
    return response;
  }
};

// Comments API
const CommentsAPI = {
  async getComments(postId) {
    const response = await httpClient.get(`/posts/${postId}/comments`);
    return response;
  },
  
  async createComment(postId, content, parentId = null) {
    const response = await httpClient.post(`/posts/${postId}/comments`, {
      content,
      parentId
    }, true);
    return response;
  },
  
  async deleteComment(commentId) {
    const response = await httpClient.delete(`/comments/${commentId}`, true);
    return response;
  }
};

// Files/Media API
const MediaAPI = {
  async uploadFile(file, zoneKey = 'home') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('zoneKey', zoneKey);
    
    const token = TokenManager.getAccessToken();
    const url = `${window.NEBRIA_CONFIG.API_BASE_URL}/files/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error?.message || 'Upload failed');
      }
      
      return json;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
};

// Notifications API
const NotificationsAPI = {
  async getNotifications(limit = 20) {
    const response = await httpClient.get(`/notifications?limit=${limit}`, true);
    return response;
  },
  
  async markAsRead(notificationId) {
    const response = await httpClient.post(`/notifications/${notificationId}/read`, {}, true);
    return response;
  },
  
  async markAllAsRead() {
    const response = await httpClient.post('/notifications/read-all', {}, true);
    return response;
  }
};

// Users API
const UsersAPI = {
  async getProfile(userId) {
    const response = await httpClient.get(`/users/${userId}`);
    return response;
  },
  
  async getCurrentUser() {
    const response = await httpClient.get('/users/me', true);
    return response;
  },
  
  async updateProfile(data) {
    const response = await httpClient.put('/users/me', data, true);
    return response;
  },
  
  async follow(userId) {
    const response = await httpClient.post(`/users/${userId}/follow`, {}, true);
    return response;
  },
  
  async unfollow(userId) {
    const response = await httpClient.delete(`/users/${userId}/follow`, true);
    return response;
  },
  
  async block(userId) {
    const response = await httpClient.post(`/users/${userId}/block`, {}, true);
    return response;
  },
  
  async mute(userId) {
    const response = await httpClient.post(`/users/${userId}/mute`, {}, true);
    return response;
  }
};

// Search API
const SearchAPI = {
  async search(query, type = 'all') {
    const response = await httpClient.get(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    return response;
  }
};

// Admin API
const AdminAPI = {
  async getAnalytics() {
    const response = await httpClient.get('/admin/analytics', true);
    return response;
  },
  
  async getUsers(page = 1, limit = 50) {
    const response = await httpClient.get(`/admin/users?page=${page}&limit=${limit}`, true);
    return response;
  },
  
  async banUser(userId, reason) {
    const response = await httpClient.post(`/admin/users/${userId}/ban`, { reason }, true);
    return response;
  },
  
  async unbanUser(userId) {
    const response = await httpClient.delete(`/admin/users/${userId}/ban`, true);
    return response;
  }
};

// Tokens/Boosts API
const TokensAPI = {
  async getBalance() {
    const response = await httpClient.get('/tokens/balance', true);
    return response;
  },
  
  async purchaseBoost(postId, amount) {
    const response = await httpClient.post('/tokens/boost', {
      postId,
      amount
    }, true);
    return response;
  },
  
  async getTransactions(limit = 50) {
    const response = await httpClient.get(`/tokens/transactions?limit=${limit}`, true);
    return response;
  }
};

// WebSocket Manager
const WebSocketManager = {
  socket: null,
  
  connect() {
    if (this.socket) return;
    
    const token = TokenManager.getAccessToken();
    if (!token) return;
    
    this.socket = io(window.NEBRIA_CONFIG.WS_URL, {
      query: { token }
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    this.socket.on('notification', (data) => {
      console.log('New notification:', data);
      // Trigger UI update
      if (window.nebriaApp && window.nebriaApp.onNotification) {
        window.nebriaApp.onNotification(data);
      }
    });
    
    this.socket.on('message', (data) => {
      console.log('New message:', data);
      // Trigger UI update
      if (window.nebriaApp && window.nebriaApp.onMessage) {
        window.nebriaApp.onMessage(data);
      }
    });
  },
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
};

// Export API object
window.NebriaAPI = {
  Auth: AuthAPI,
  Posts: PostsAPI,
  Comments: CommentsAPI,
  Media: MediaAPI,
  Notifications: NotificationsAPI,
  Users: UsersAPI,
  Search: SearchAPI,
  Admin: AdminAPI,
  Tokens: TokensAPI,
  WebSocket: WebSocketManager,
  TokenManager
};

console.log('Nebria API Client loaded');
