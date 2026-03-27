// ============================================================
// CloudArc Customer App — API Service
// ⚡ ONLY CHANGE THIS ONE LINE when your Flask API is deployed:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// ============================================================

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
  
  // Protected (require token)
  placeOrder: (restaurantId, data, token) => post(`/api/customer/place-order/${restaurantId}`, data, token),
  getOrderHistory: (token) => get('/api/customer/orders', token),
};
