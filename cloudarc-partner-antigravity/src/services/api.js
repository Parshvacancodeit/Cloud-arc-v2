// ============================================================
// CloudArc Partner App — API Service
// ⚡ ONLY CHANGE THIS ONE LINE when your Flask API is deployed:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// ============================================================

// Partner App identifier — sent to backend so analytics can distinguish sources
const SOURCE_APP = 'Partner App';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const get = (path, token) => fetch(`${BASE_URL}${path}`, {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {},
}).then(handleResponse);

const post = (path, body, token) => fetch(`${BASE_URL}${path}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
}).then(handleResponse);

export const customerApi = {
  // Auth
  login: (email, password) => post('/api/customer/login', { email, password }),
  register: (data) => post('/api/customer/register', data),

  // Public
  getRestaurantsByPincode: (pincode) => get(`/api/public/restaurants?pincode=${pincode}`),
  getRestaurant: (id) => get(`/api/public/restaurants/${id}`),
  getMenu: (id) => get(`/api/public/restaurants/${id}/menu`),

  // Protected (require token) — source_app injected so backend records "Partner App"
  placeOrder: (restaurantId, data, token) =>
    post(`/api/customer/place-order/${restaurantId}`, { ...data, source_app: SOURCE_APP }, token),
  getOrderHistory: (token) => get('/api/customer/orders', token),
};
