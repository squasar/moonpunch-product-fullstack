/**
 * MOON PUNCH Admin API Client
 * Shared module for admin dashboard pages to communicate with the backend.
 * Include this via: <script src="../../api-admin.js"></script>
 */

const API_BASE = 'http://localhost:3000/api';

// ─── Admin API Client ─────────────────────────────────────────────────────

const AdminAPI = {
  // Dashboard
  getDashboardStats: () => 
    apiFetch('/admin/dashboard/stats'),
  
  getAnalytics: (days = 30) =>
    apiFetch(`/admin/analytics?days=${days}`),

  // Users
  getUsers: (page = 1, limit = 10, role = null, search = null) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    if (search) url += `&search=${search}`;
    return apiFetch(url);
  },
  
  updateUserRole: (userId, role) =>
    apiFetch(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  disableUser: (userId) =>
    apiFetch(`/admin/users/${userId}/disable`, { method: 'PUT' }),

  // Products
  getProducts: (page = 1, limit = 10, status = null, category = null, search = null) => {
    let url = `/admin/products?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    return apiFetch(url);
  },
  
  createProduct: (data) =>
    apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  
  updateProduct: (productId, data) =>
    apiFetch(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteProduct: (productId) =>
    apiFetch(`/admin/products/${productId}`, { method: 'DELETE' }),
  
  publishProduct: (productId, status) =>
    apiFetch(`/admin/products/${productId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Categories
  getCategories: () =>
    apiFetch('/admin/categories'),
  
  createCategory: (data) =>
    apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  
  updateCategory: (categoryId, data) =>
    apiFetch(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCategory: (categoryId) =>
    apiFetch(`/admin/categories/${categoryId}`, { method: 'DELETE' }),

  // Comments
  getComments: (page = 1, limit = 10, isApproved = null) => {
    let url = `/admin/comments?page=${page}&limit=${limit}`;
    if (isApproved !== null) url += `&isApproved=${isApproved}`;
    return apiFetch(url);
  },
  
  approveComment: (commentId) =>
    apiFetch(`/admin/comments/${commentId}/approve`, { method: 'POST' }),
  
  rejectComment: (commentId) =>
    apiFetch(`/admin/comments/${commentId}/reject`, { method: 'POST' }),
  
  deleteComment: (commentId) =>
    apiFetch(`/admin/comments/${commentId}`, { method: 'DELETE' }),

  // Licenses
  getLicenses: (page = 1, limit = 10, isActive = null, licenseType = null) => {
    let url = `/admin/licenses?page=${page}&limit=${limit}`;
    if (isActive !== null) url += `&isActive=${isActive}`;
    if (licenseType) url += `&licenseType=${licenseType}`;
    return apiFetch(url);
  },
  
  revokeLicense: (licenseId) =>
    apiFetch(`/admin/licenses/${licenseId}/revoke`, { method: 'PUT' }),

  // Subscribers
  getSubscribers: (page = 1, limit = 10, subscriptionType = null, isActive = null) => {
    let url = `/admin/subscribers?page=${page}&limit=${limit}`;
    if (subscriptionType) url += `&subscriptionType=${subscriptionType}`;
    if (isActive !== null) url += `&isActive=${isActive}`;
    return apiFetch(url);
  },
};

// ─── Core Fetch Wrapper (reuse existing auth mechanism) ───────────────────

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('mp_access_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });

  // Auto-refresh token on 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('mp_access_token')}`;
      const retry = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });
      return retry.json();
    } else {
      localStorage.removeItem('mp_access_token');
      localStorage.removeItem('mp_user');
      window.location.href = '../login.html';
      return;
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('mp_access_token', data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Utility Functions ────────────────────────────────────────────────────

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert">&times;</button>
  `;

  alertContainer.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function setLoading(elementId, loading, originalText = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (loading) {
    element.disabled = true;
    element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
  } else {
    element.disabled = false;
    element.innerHTML = originalText;
  }
}

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page')) || 1;
}

function getPaginationHTML(current, total) {
  if (total <= 1) return '';

  let html = '<nav><ul class="pagination">';
  
  if (current > 1) {
    html += `<li class="page-item"><a class="page-link" href="?page=1">First</a></li>`;
    html += `<li class="page-item"><a class="page-link" href="?page=${current - 1}">Previous</a></li>`;
  }

  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    html += `<li class="page-item ${i === current ? 'active' : ''}">
      <a class="page-link" href="?page=${i}">${i}</a>
    </li>`;
  }

  if (current < total) {
    html += `<li class="page-item"><a class="page-link" href="?page=${current + 1}">Next</a></li>`;
    html += `<li class="page-item"><a class="page-link" href="?page=${total}">Last</a></li>`;
  }

  html += '</ul></nav>';
  return html;
}
