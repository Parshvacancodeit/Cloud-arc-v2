// ============================================================
// CloudArc API Service Layer
// ============================================================
// ⚡ ONLY CHANGE THIS ONE LINE when your Flask API is deployed:
const BASE_URL = import.meta.env.VITE_API_URL || '';
// ============================================================

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`, { headers: getHeaders() }).then(handleResponse),

  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ─── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout', {}),
};

// ─── Dashboard ──────────────────────────────────────────────
export const dashboardApi = {
  getStats: (restaurantId) =>
    api.get(`/api/dashboard/stats/${restaurantId}`),
  getRecentOrders: (restaurantId, limit = 5) =>
    api.get(`/api/dashboard/recent-orders/${restaurantId}?limit=${limit}`),
  getAlerts: (restaurantId) =>
    api.get(`/api/dashboard/alerts/${restaurantId}`),
  getPlatformStats: (restaurantId) =>
    api.get(`/api/dashboard/platform-stats/${restaurantId}`),
};

// ─── Orders / Kanban ────────────────────────────────────────
export const ordersApi = {
  getAll: (restaurantId) =>
    api.get(`/api/orders/${restaurantId}`),
  updateStatus: (orderId, status, assignedTo = null, customerMessage = null) =>
    api.patch(`/api/orders/${orderId}/status`, { 
      status, 
      assigned_to: assignedTo,
      customer_message: customerMessage 
    }),
  create: (restaurantId, data) =>
    api.post(`/api/orders/${restaurantId}`, data),
  delete: (orderId) =>
    api.delete(`/api/orders/${orderId}`),
};

// ─── Menu ────────────────────────────────────────────────────
export const menuApi = {
  getAll: (restaurantId) =>
    api.get(`/api/menu/${restaurantId}`),
  create: (restaurantId, data) =>
    api.post(`/api/menu/${restaurantId}`, data),
  update: (itemId, data) =>
    api.put(`/api/menu/item/${itemId}`, data),
  delete: (itemId) =>
    api.delete(`/api/menu/item/${itemId}`),
  toggleAvailability: (itemId, isAvailable) =>
    api.patch(`/api/menu/item/${itemId}/availability`, { is_available: isAvailable }),
  // Upload image — multipart/form-data (no JSON header)
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      body: form,
    }).then(handleResponse);
  },
};

// ─── Team ────────────────────────────────────────────────────
export const teamApi = {
  getAll: (restaurantId) =>
    api.get(`/api/team/${restaurantId}`),
  create: (restaurantId, data) =>
    api.post(`/api/team/${restaurantId}`, data),
  update: (memberId, data) =>
    api.put(`/api/team/member/${memberId}`, data),
  delete: (memberId) =>
    api.delete(`/api/team/member/${memberId}`),
};

// ─── Analytics ──────────────────────────────────────────────
export const analyticsApi = {
  getData: (restaurantId, period = '7d') =>
    api.get(`/api/analytics/${restaurantId}?period=${period}`),
};

// ─── Settings ────────────────────────────────────────────────
export const settingsApi = {
  get: (restaurantId) =>
    api.get(`/api/settings/${restaurantId}`),
  update: (restaurantId, data) =>
    api.put(`/api/settings/${restaurantId}`, data),
  toggleStatus: (restaurantId, isActive) =>
    api.patch(`/api/settings/${restaurantId}/status`, { is_active: isActive }),
  // Dedicated integration connect/disconnect — maps field name → platform key
  toggleIntegration: (restaurantId, platform, connected) =>
    api.patch(`/api/settings/${restaurantId}/integration`, { platform, connected }),
};

// ─── Public (Customer App) ──────────────────────────────────
export const publicApi = {
  getRestaurantsByPincode: (pincode) =>
    api.get(`/api/public/restaurants?pincode=${pincode}`),
  getRestaurant: (restaurantId) =>
    api.get(`/api/public/restaurants/${restaurantId}`),
  getRestaurantMenu: (restaurantId) =>
    api.get(`/api/public/restaurants/${restaurantId}/menu`),
  placeOrder: (restaurantId, data) =>
    api.post(`/api/orders/${restaurantId}`, data),
};
