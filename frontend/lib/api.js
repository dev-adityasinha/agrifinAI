// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('agrifinai_token');
  }
  return null;
};

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    const data = await response.json();
    
    if (!response.ok) {
      // Return error object with backend message
      return { 
        success: false, 
        error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    // Return error object instead of throwing for better error handling
    return { success: false, error: error.message };
  }
}

// Auth APIs
export const authAPI = {
  // Register new user
  register: async (data) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  // Login user
  login: async (data) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  // Get current user profile
  getProfile: () => apiRequest('/auth/profile'),

  // Update user profile
  updateProfile: (data) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Change password
  changePassword: (data) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Logout (client-side)
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agrifinai_token');
      localStorage.removeItem('agrifinai_user');
    }
  },
};

// Farmer APIs
export const farmerAPI = {
  // Get all farmers
  getAll: () => apiRequest('/farmers'),

  // Get farmer by ID
  getById: (id) => apiRequest(`/farmers/${id}`),

  // Create new farmer
  create: (data) => apiRequest('/farmers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update farmer
  update: (id, data) => apiRequest(`/farmers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete farmer
  delete: (id) => apiRequest(`/farmers/${id}`, {
    method: 'DELETE',
  }),
};

// Loan APIs
export const loanAPI = {
  // Get all loans
  getAll: () => apiRequest('/loans'),

  // Get loan by ID
  getById: (id) => apiRequest(`/loans/${id}`),

  // Create new loan application
  create: (data) => apiRequest('/loans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update loan status
  updateStatus: (id, status) => apiRequest(`/loans/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

// Product APIs
export const productAPI = {
  // Get all products with optional filters
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/products${queryParams ? '?' + queryParams : ''}`);
  },

  // Get product by ID
  getById: (id) => apiRequest(`/products/${id}`),

  // Create new product listing
  create: (data) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update product
  update: (id, data) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete product
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),

  // Update product status
  updateStatus: (id, status) => apiRequest(`/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  // Increment inquiry count
  incrementInquiry: (id) => apiRequest(`/products/${id}/inquiry`, {
    method: 'POST',
  }),
};

// Health check
const healthCheck = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app';
    const response = await fetch(`${apiUrl}/health`);
    return await response.json();
  } catch (error) {
    throw new Error('Backend is not running');
  }
};

const api = {
  authAPI,
  farmerAPI,
  loanAPI,
  productAPI,
  healthCheck,
};

export default api;
