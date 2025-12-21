/*
 * Nebria Frontend Application
 * 
 * This module wires the HTML UI to the backend API.
 * It initializes the application, handles authentication state,
 * loads feeds, and manages user interactions.
 */

const NebriaApp = {
  currentZone: 'home',
  currentUser: null,
  
  // Initialize the application
  async init() {
    console.log('Initializing Nebria App...');
    
    // Check authentication state
    if (window.NebriaAPI.TokenManager.isAuthenticated()) {
      try {
        await this.loadCurrentUser();
        this.showAuthenticatedUI();
        window.NebriaAPI.WebSocket.connect();
      } catch (error) {
        console.error('Failed to load user:', error);
        // Token might be expired, show login
        this.showUnauthenticatedUI();
      }
    } else {
      this.showUnauthenticatedUI();
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial feed
    await this.loadFeed('home');
    
    console.log('Nebria App initialized');
  },
  
  // Load current user data
  async loadCurrentUser() {
    try {
      const response = await window.NebriaAPI.Users.getCurrentUser();
      this.currentUser = response.data || response;
      
      // Update UI with user info
      const profileNav = document.getElementById('nav-profile');
      if (profileNav && this.currentUser) {
        profileNav.style.display = 'flex';
        const usernameSpan = profileNav.querySelector('.username');
        if (usernameSpan) {
          usernameSpan.textContent = this.currentUser.username;
        }
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
      throw error;
    }
  },
  
  // Show UI for authenticated users
  showAuthenticatedUI() {
    const authElements = document.querySelectorAll('[data-auth="user"]');
    authElements.forEach(el => el.style.display = 'flex');
    
    const guestElements = document.querySelectorAll('[data-auth="guest"]');
    guestElements.forEach(el => el.style.display = 'none');
    
    const loginBtn = document.getElementById('btn-login');
    const registerBtn = document.getElementById('btn-register');
    const logoutBtn = document.getElementById('btn-logout');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
  },
  
  // Show UI for unauthenticated users
  showUnauthenticatedUI() {
    const authElements = document.querySelectorAll('[data-auth="user"]');
    authElements.forEach(el => el.style.display = 'none');
    
    const guestElements = document.querySelectorAll('[data-auth="guest"]');
    guestElements.forEach(el => el.style.display = 'flex');
    
    const loginBtn = document.getElementById('btn-login');
    const registerBtn = document.getElementById('btn-register');
    const logoutBtn = document.getElementById('btn-logout');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  },
  
  // Set up event listeners
  setupEventListeners() {
    // Zone navigation
    document.querySelectorAll('[data-zone]').forEach(navItem => {
      navItem.addEventListener('click', (e) => {
        const zone = e.currentTarget.getAttribute('data-zone');
        this.switchZone(zone);
      });
    });
    
    // Auth buttons
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginModal());
    }
    
    const registerBtn = document.getElementById('btn-register');
    if (registerBtn) {
      registerBtn.addEventListener('click', () => this.showRegisterModal());
    }
    
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Post composer
    const postBtn = document.getElementById('btn-post');
    if (postBtn) {
      postBtn.addEventListener('click', () => this.createPost());
    }
    
    // Media upload
    const uploadBtn = document.getElementById('btn-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.handleMediaUpload());
    }
  },
  
  // Switch zone/view
  async switchZone(zone) {
    console.log('Switching to zone:', zone);
    this.currentZone = zone;
    
    // Update active nav item
    document.querySelectorAll('[data-zone]').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-zone="${zone}"]`)?.classList.add('active');
    
    // Hide all zone sections
    document.querySelectorAll('[data-zone-section]').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show current zone section
    const currentSection = document.querySelector(`[data-zone-section="${zone}"]`);
    if (currentSection) {
      currentSection.style.display = 'block';
    }
    
    // Load feed for this zone
    await this.loadFeed(zone);
  },
  
  // Load feed for a specific zone
  async loadFeed(zoneKey) {
    console.log('Loading feed for zone:', zoneKey);
    
    try {
      const response = await window.NebriaAPI.Posts.getFeed({
        zoneKey: zoneKey === 'home' ? null : zoneKey,
        limit: 50
      });
      
      const posts = response.data || response;
      
      // Find feed container for this zone
      const feedContainer = document.querySelector(`[data-zone-section="${zoneKey}"] .feed-container`) ||
                           document.querySelector('.feed-container');
      
      if (feedContainer) {
        this.renderFeed(feedContainer, posts);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      this.showError('Failed to load feed. Please try again.');
    }
  },
  
  // Render feed posts
  renderFeed(container, posts) {
    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<div class="no-posts">No posts yet. Be the first to post!</div>';
      return;
    }
    
    container.innerHTML = posts.map(post => this.renderPost(post)).join('');
    
    // Attach event listeners to post actions
    this.attachPostEventListeners(container);
  },
  
  // Render a single post
  renderPost(post) {
    const author = post.author || { username: 'Unknown' };
    const content = this.escapeHtml(post.content || '');
    const createdAt = new Date(post.createdAt).toLocaleString();
    
    return `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author">
            <strong>${this.escapeHtml(author.username)}</strong>
            <span class="post-time">${createdAt}</span>
          </div>
        </div>
        <div class="post-content">
          ${this.linkifyContent(content)}
        </div>
        <div class="post-actions">
          <button class="btn-like" data-action="like" data-post-id="${post.id}">
            ❤️ ${post.reactions?.length || 0}
          </button>
          <button class="btn-comment" data-action="comment" data-post-id="${post.id}">
            💬 ${post.comments?.length || 0}
          </button>
          <button class="btn-share" data-action="share" data-post-id="${post.id}">
            🔄 Share
          </button>
        </div>
      </div>
    `;
  },
  
  // Attach event listeners to post actions
  attachPostEventListeners(container) {
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const postId = e.currentTarget.getAttribute('data-post-id');
        this.handlePostAction(action, postId);
      });
    });
  },
  
  // Handle post actions
  async handlePostAction(action, postId) {
    if (!window.NebriaAPI.TokenManager.isAuthenticated()) {
      this.showLoginModal();
      return;
    }
    
    switch (action) {
      case 'like':
        // TODO: Implement like functionality
        console.log('Like post:', postId);
        break;
      case 'comment':
        // TODO: Implement comment functionality
        console.log('Comment on post:', postId);
        break;
      case 'share':
        // TODO: Implement share functionality
        console.log('Share post:', postId);
        break;
    }
  },
  
  // Create new post
  async createPost() {
    if (!window.NebriaAPI.TokenManager.isAuthenticated()) {
      this.showLoginModal();
      return;
    }
    
    const contentInput = document.getElementById('post-content');
    if (!contentInput) return;
    
    const content = contentInput.value.trim();
    if (!content) {
      this.showError('Please enter some content');
      return;
    }
    
    try {
      const response = await window.NebriaAPI.Posts.createPost({
        content,
        type: 'TEXT',
        zoneKey: this.currentZone
      });
      
      console.log('Post created:', response);
      
      // Clear input
      contentInput.value = '';
      
      // Reload feed
      await this.loadFeed(this.currentZone);
      
      this.showSuccess('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      this.showError('Failed to create post. Please try again.');
    }
  },
  
  // Handle media upload
  async handleMediaUpload() {
    if (!window.NebriaAPI.TokenManager.isAuthenticated()) {
      this.showLoginModal();
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        this.showLoading('Uploading...');
        
        const response = await window.NebriaAPI.Media.uploadFile(file, this.currentZone);
        
        console.log('File uploaded:', response);
        
        this.hideLoading();
        this.showSuccess('Media uploaded successfully!');
        
        // TODO: Add uploaded media to post composer
      } catch (error) {
        console.error('Upload failed:', error);
        this.hideLoading();
        this.showError('Upload failed. Please try again.');
      }
    });
    
    fileInput.click();
  },
  
  // Show login modal
  showLoginModal() {
    const email = prompt('Email:');
    if (!email) return;
    
    const password = prompt('Password:');
    if (!password) return;
    
    this.login(email, password);
  },
  
  // Show register modal
  showRegisterModal() {
    const username = prompt('Username:');
    if (!username) return;
    
    const email = prompt('Email:');
    if (!email) return;
    
    const password = prompt('Password (min 8 characters):');
    if (!password) return;
    
    this.register(username, email, password);
  },
  
  // Login
  async login(email, password) {
    try {
      this.showLoading('Logging in...');
      
      const response = await window.NebriaAPI.Auth.login(email, password);
      
      console.log('Login successful:', response);
      
      await this.loadCurrentUser();
      this.showAuthenticatedUI();
      window.NebriaAPI.WebSocket.connect();
      
      this.hideLoading();
      this.showSuccess('Welcome back!');
      
      // Reload current feed
      await this.loadFeed(this.currentZone);
    } catch (error) {
      console.error('Login failed:', error);
      this.hideLoading();
      this.showError('Login failed. Please check your credentials.');
    }
  },
  
  // Register
  async register(username, email, password) {
    try {
      this.showLoading('Creating account...');
      
      await window.NebriaAPI.Auth.register(username, email, password);
      
      console.log('Registration successful');
      
      this.hideLoading();
      this.showSuccess('Account created! Please log in.');
    } catch (error) {
      console.error('Registration failed:', error);
      this.hideLoading();
      this.showError('Registration failed. Please try again.');
    }
  },
  
  // Logout
  logout() {
    window.NebriaAPI.Auth.logout();
  },
  
  // Utility: Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // Utility: Linkify content
  linkifyContent(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  },
  
  // UI helpers
  showError(message) {
    alert('Error: ' + message);
  },
  
  showSuccess(message) {
    alert('Success: ' + message);
  },
  
  showLoading(message) {
    console.log('Loading:', message);
    // TODO: Implement proper loading UI
  },
  
  hideLoading() {
    console.log('Loading complete');
    // TODO: Implement proper loading UI
  },
  
  // Notification handler
  onNotification(data) {
    console.log('Received notification:', data);
    // TODO: Update notification UI
  },
  
  // Message handler
  onMessage(data) {
    console.log('Received message:', data);
    // TODO: Update message UI
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.nebriaApp = NebriaApp;
    NebriaApp.init();
  });
} else {
  window.nebriaApp = NebriaApp;
  NebriaApp.init();
}

console.log('Nebria App script loaded');
