import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aurum_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('aurum_token');
        localStorage.removeItem('aurum_user');
        // Dispatch custom event so AuthContext can sync state immediately
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication & User Preference APIs
// ==========================================

export const requestRegisterOtp = async (username, mobile) => {
  const res = await api.post('/auth/register/request-otp', { username, mobile });
  return res.data;
};

export const verifyRegisterOtp = async (username, email, password, mobile, otp) => {
  const res = await api.post('/auth/register/verify-otp', { username, email, password, mobile, otp });
  return res.data;
};

export const requestLoginOtp = async (username, mobile) => {
  const res = await api.post('/auth/login/request-otp', { username, mobile });
  return res.data;
};

export const verifyLoginOtp = async (username, mobile, otp) => {
  const res = await api.post('/auth/login/verify-otp', { username, mobile, otp });
  return res.data;
};

export const requestForgotUsernameOtp = async (mobile) => {
  const res = await api.post('/auth/forgot-username/request-otp', { mobile });
  return res.data;
};

export const verifyForgotUsernameOtp = async (mobile, otp) => {
  const res = await api.post('/auth/forgot-username/verify-otp', { mobile, otp });
  return res.data;
};

export const requestChangeMobileOtp = async (newMobile) => {
  const res = await api.post('/auth/mobile/change/request-otp', { newMobile });
  return res.data;
};

export const verifyChangeMobileOtp = async (newMobile, otp) => {
  const res = await api.post('/auth/mobile/change/verify-otp', { newMobile, otp });
  return res.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // silent catch
  } finally {
    localStorage.removeItem('aurum_token');
    localStorage.removeItem('aurum_user');
  }
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateUserPreferences = async ({ city, state, country }) => {
  const res = await api.patch('/users/preferences', { city, state, country });
  return res.data;
};

// ==========================================
// Bullion Rates APIs (Gold & Silver)
// ==========================================

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getHealthLive = async () => {
  const res = await api.get('/health/live');
  return res.data;
};

export const getHealthReady = async () => {
  const res = await api.get('/health/ready');
  return res.data;
};

export const getHealthDetails = async () => {
  const res = await api.get('/health/details');
  return res.data;
};

export const getRates = async (params = {}) => {
  const res = await api.get('/rates', { params });
  return res.data;
};

export const getGoldLive = async (params = {}) => {
  const res = await api.get('/gold/live', { params });
  return res.data;
};

export const getGoldRates = async (params = {}) => {
  const res = await api.get('/rates', { params });
  return res.data;
};

export const getGoldRatesOnly = async (params = {}) => {
  const res = await api.get('/rates/gold', { params });
  return res.data;
};

export const getSilverRatesOnly = async (params = {}) => {
  const res = await api.get('/rates/silver', { params });
  return res.data;
};

export const getSupportedLocations = async () => {
  const res = await api.get('/rates/locations');
  return res.data;
};

// ==========================================
// Physical Assets & Purchases APIs (Gold & Silver)
// ==========================================

export const getPurchases = async (params = {}) => {
  const res = await api.get('/purchases', { params });
  return res.data;
};

export const getPurchase = async (id, params = {}) => {
  const res = await api.get(`/purchases/${id}`, { params });
  return res.data;
};

export const addPurchase = async (purchaseData) => {
  const isFormData = purchaseData instanceof FormData;
  const res = await api.post('/purchases', purchaseData, {
    headers: isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' },
  });
  return res.data;
};

export const deletePurchase = async (id) => {
  const res = await api.delete(`/purchases/${id}`);
  return res.data;
};

// Asset aliases
export const getAssets = getPurchases;
export const getAsset = getPurchase;
export const addAsset = addPurchase;
export const deleteAsset = deletePurchase;

export const getPortfolio = async (params = {}) => {
  const res = await api.get('/portfolio', { params });
  return res.data;
};

// ==========================================
// Secure Document Fetching
// ==========================================

export const fetchSecureDocumentBlob = async (endpointUrl) => {
  // Strip duplicate '/api' prefix since baseURL already points to '/api'
  let normalizedUrl = endpointUrl;
  if (normalizedUrl.startsWith('/api/')) {
    normalizedUrl = normalizedUrl.replace(/^\/api/, '');
  }

  const res = await api.get(normalizedUrl, {
    responseType: 'blob',
  });

  return {
    blobUrl: URL.createObjectURL(res.data),
    contentType: res.headers['content-type'],
  };
};

// ==========================================
// Admin Panel Management APIs
// ==========================================

export const getAdminDashboard = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getAdminUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const getAdminUser = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const updateAdminUserStatus = async (id, isActive) => {
  const res = await api.patch(`/admin/users/${id}/status`, { is_active: isActive });
  return res.data;
};

export const updateAdminUserPlan = async (id, planData) => {
  const res = await api.patch(`/admin/users/${id}/plan`, planData);
  return res.data;
};

export const getAdminPricing = async () => {
  const res = await api.get('/admin/pricing');
  return res.data;
};

export const updateAdminPricing = async (price) => {
  const res = await api.patch('/admin/pricing', { price });
  return res.data;
};

export const getAdminMetalRates = async () => {
  const res = await api.get('/admin/rates');
  return res.data;
};

export const updateAdminMetalRate = async (ratePayload) => {
  const res = await api.put('/admin/rates', ratePayload);
  return res.data;
};

export const getAdminAuditLogs = async (params = {}) => {
  const res = await api.get('/admin/audit-logs', { params });
  return res.data;
};

export default api;
