/**
 * MOON PUNCH — API Client
 * Shared module for all frontend pages to communicate with the backend.
 * Include this via: <script src="js/api.js"></script>
 */

const API_BASE = 'http://localhost:3000/api';

// ─── Token Storage ────────────────────────────────────────────────────────────
const Auth = {
  getToken:    ()         => localStorage.getItem('mp_access_token'),
  setToken:    (t)        => localStorage.setItem('mp_access_token', t),
  getUser:     ()         => { try { return JSON.parse(localStorage.getItem('mp_user') || 'null'); } catch { return null; } },
  setUser:     (u)        => localStorage.setItem('mp_user', JSON.stringify(u)),
  clear:       ()         => { localStorage.removeItem('mp_access_token'); localStorage.removeItem('mp_user'); },
  isLoggedIn:  ()         => !!Auth.getToken(),
  isAdmin:     ()         => Auth.getUser()?.role === 'admin',
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });

  // Auto-refresh token on 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${Auth.getToken()}`;
      const retry = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });
      return retry.json();
    } else {
      Auth.clear();
      window.location.href = 'login.html';
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
    const { accessToken } = await res.json();
    Auth.setToken(accessToken);
    return true;
  } catch { return false; }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
const AuthAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getRedirectUrl: () =>
    apiFetch('/auth/redirect'),

  logout: async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    Auth.clear();
    window.location.href = 'login.html';
  },
};

// ─── Products API ─────────────────────────────────────────────────────────────
const ProductsAPI = {
  list:   (params = {}) => apiFetch('/products?' + new URLSearchParams(params)),
  get:    (slug)        => apiFetch(`/products/${slug}`),
  create: (data)        => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data)    => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archive:(id)          => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
const UsersAPI = {
  me:         ()              => apiFetch('/users/me'),
  updateMe:   (data)          => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  list:       (params = {})   => apiFetch('/users?' + new URLSearchParams(params)),
  changeRole: (id, role)      => apiFetch(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  disable:    (id)            => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ─── Comments API ─────────────────────────────────────────────────────────────
const CommentsAPI = {
  list:    (productId)           => apiFetch(`/comments/product/${productId}`),
  create:  (productId, data)     => apiFetch(`/comments/product/${productId}`, { method: 'POST', body: JSON.stringify(data) }),
  approve: (id)                  => apiFetch(`/comments/${id}/approve`, { method: 'PATCH' }),
  delete:  (id)                  => apiFetch(`/comments/${id}`, { method: 'DELETE' }),
};

// ─── Subscribers API ─────────────────────────────────────────────────────────
const SubscribersAPI = {
  subscribe:   (productId, type) => apiFetch(`/subscribers/product/${productId}`, { method: 'POST', body: JSON.stringify({ subscriptionType: type }) }),
  unsubscribe: (productId)       => apiFetch(`/subscribers/product/${productId}`, { method: 'DELETE' }),
  mine:        ()                => apiFetch('/subscribers/me'),
  forProduct:  (productId)       => apiFetch(`/subscribers/product/${productId}`),
};

// ─── Licenses API ─────────────────────────────────────────────────────────────
const LicensesAPI = {
  mine:     ()                  => apiFetch('/licenses/me'),
  generate: (data)              => apiFetch('/licenses/generate', { method: 'POST', body: JSON.stringify(data) }),
  activate: (licenseKey)        => apiFetch('/licenses/activate', { method: 'POST', body: JSON.stringify({ licenseKey }) }),
  revoke:   (id)                => apiFetch(`/licenses/${id}/revoke`, { method: 'PATCH' }),
};

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showAlert(msg, type = 'danger', containerId = 'alertBox') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}

function setLoading(btnId, loading, text = 'Submit') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner-border spinner-border-sm me-2"></span>Loading...`
    : text;
}
