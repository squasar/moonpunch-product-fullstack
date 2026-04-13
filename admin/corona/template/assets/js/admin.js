/**
 * MOON PUNCH — Admin Panel Shared Utilities
 * Included on all admin pages.
 */

const API_BASE = 'http://localhost:3000/api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('mp_access_token'),
  getUser:  () => { try { return JSON.parse(localStorage.getItem('mp_user') || 'null'); } catch { return null; } },
  clear:    () => { localStorage.removeItem('mp_access_token'); localStorage.removeItem('mp_user'); },
  isAdmin:  () => Auth.getUser()?.role === 'admin',
};

// Guard: redirect to login if not admin
(function requireAdmin() {
  if (!Auth.getToken() || !Auth.isAdmin()) {
    window.location.href = '../../../../frontend/login.html';
  }
})();

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });
  if (res.status === 401) { Auth.clear(); window.location.href = '../../../../frontend/login.html'; return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Populate Admin User Info in Navbar ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  if (user) {
    document.querySelectorAll('.admin-username').forEach(el => el.textContent = user.username);
    document.querySelectorAll('.admin-role').forEach(el => el.textContent = user.role);
  }

  // Logout button
  document.querySelectorAll('.admin-logout').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await api('/auth/logout', { method: 'POST' }); } catch {}
      Auth.clear();
      window.location.href = '../../../../frontend/login.html';
    });
  });
});

// ─── Toast Helper ─────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const id = 'toast_' + Date.now();
  const colors = { success: '#28a745', danger: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" style="background:${colors[type]||colors.info};color:#fff;padding:14px 20px;border-radius:8px;margin-bottom:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.3);animation:fadeIn .3s ease">
      ${msg}
    </div>`);
  setTimeout(() => { const el = document.getElementById(id); if(el) el.remove(); }, 4000);
}

// ─── Format Date ──────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Badge HTML ───────────────────────────────────────────────────────────────
function roleBadge(role) {
  const map = { admin: 'danger', moderator: 'warning', user: 'secondary' };
  return `<span class="badge badge-outline-${map[role]||'secondary'}">${role}</span>`;
}
function statusBadge(status) {
  const map = { published: 'success', draft: 'warning', archived: 'secondary' };
  return `<span class="badge badge-outline-${map[status]||'secondary'}">${status}</span>`;
}
