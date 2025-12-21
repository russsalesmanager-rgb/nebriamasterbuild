/**
 * Nebria Frontend API Client
 * 
 * This file provides a JavaScript API client for the Nebria backend.
 * It handles authentication, API calls, and data management for the frontend.
 */

class NebriaAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('nebria_access_token');
    this.refreshToken = localStorage.getItem('nebria_refresh_token');
    this.currentUser = JSON.parse(localStorage.getItem('nebria_user') || 'null');
  }

  /**
   * Make an authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers
      });

      // If token expired, try to refresh
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers
          });
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Authentication Methods
   */
  async register(username, email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.ok && response.data) {
      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;
      this.currentUser = response.data.user;
      
      localStorage.setItem('nebria_access_token', this.accessToken);
      localStorage.setItem('nebria_refresh_token', this.refreshToken);
      localStorage.setItem('nebria_user', JSON.stringify(this.currentUser));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      this.currentUser = null;
      localStorage.removeItem('nebria_access_token');
      localStorage.removeItem('nebria_refresh_token');
      localStorage.removeItem('nebria_user');
    }
  }

  async refreshAccessToken() {
    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok && response.data) {
        this.accessToken = response.data.accessToken;
        localStorage.setItem('nebria_access_token', this.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
    }
    return false;
  }

  isAuthenticated() {
    return !!this.accessToken && !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Posts / Feed Methods
   */
  async getFeed(options = {}) {
    const params = new URLSearchParams();
    if (options.zone_key) params.append('zone_key', options.zone_key);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    return await this.request(`/posts?${params.toString()}`);
  }

  async getPost(postId) {
    return await this.request(`/posts/${postId}`);
  }

  async createPost(content, options = {}) {
    return await this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({
        content,
        type: options.type || 'TEXT',
        mediaId: options.mediaId,
        parentId: options.parentId,
        zoneKey: options.zoneKey
      })
    });
  }

  async deletePost(postId) {
    return await this.request(`/posts/${postId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Comments Methods
   */
  async getComments(postId) {
    return await this.request(`/comments?postId=${postId}`);
  }

  async createComment(postId, content, parentId = null) {
    return await this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, content, parentId })
    });
  }

  /**
   * File Upload Methods
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(formData);
    });
  }

  /**
   * Notifications Methods
   */
  async getNotifications() {
    return await this.request('/notifications');
  }

  async markNotificationRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  /**
   * Search Methods
   */
  async search(query, type = 'all') {
    const params = new URLSearchParams({ q: query, type });
    return await this.request(`/search?${params.toString()}`);
  }

  /**
   * User Methods
   */
  async getUser(userId) {
    return await this.request(`/users/${userId}`);
  }

  async updateProfile(updates) {
    return await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Admin Methods (require appropriate role)
   */
  async adminGetUsers(page = 1) {
    return await this.request(`/admin/users?page=${page}`);
  }

  async adminBanUser(userId, reason) {
    return await this.request(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async adminDeletePost(postId, reason) {
    return await this.request(`/admin/posts/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }
}

// Create global API instance
window.nebriaAPI = new NebriaAPI();

// Helper function to display errors
function showError(message) {
  console.error(message);
  // You can implement a toast notification here
  alert(message);
}

// Helper function to display success messages
function showSuccess(message) {
  console.log(message);
  // You can implement a toast notification here
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nebria API Client initialized');
  
  // Check if user is logged in
  if (window.nebriaAPI.isAuthenticated()) {
    const user = window.nebriaAPI.getCurrentUser();
    console.log('User logged in:', user.username);
    // Update UI to show logged-in state
  } else {
    console.log('User not logged in');
    // Show login/register forms
  }
});
