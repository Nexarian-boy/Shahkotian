import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token (skip if an explicit header is already set)
api.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Auto-retry once on timeout or network error.
    if (
      !originalRequest._retry &&
      (error.code === 'ECONNABORTED' || !error.response)
    ) {
      originalRequest._retry = true;
      console.log('Request failed, retrying once...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return api(originalRequest);
    }

    if (error.response?.status === 401) {
      // Token expired - clear storage
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetryDoctorRequest = (error) => {
  const status = error?.response?.status;
  return status === 401 || error?.code === 'ECONNABORTED' || !error?.response;
};

const withDoctorTokenRetry = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (shouldRetryDoctorRequest(error)) {
      await sleep(2000);
      return requestFn();
    }
    throw error;
  }
};

// ============ AUTH API ============
export const authAPI = {
  sendOtp: (email) => api.post('/auth/send-otp', { email }, { timeout: 60000 }),
  register: (data) => api.post('/auth/register', data, { timeout: 60000 }),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data, { timeout: 60000 }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  checkLocation: (data) => api.post('/auth/check-location', data),
  uploadPhoto: (formData) => api.post('/auth/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAccount: () => api.delete('/auth/delete-account'),
};

// ============ LISTINGS API ============
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getOne: (id) => api.get(`/listings/${id}`),
  like: (id) => api.post(`/listings/${id}/like`),
  view: (id) => api.post(`/listings/${id}/view`),
  create: (formData) => api.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  getMine: () => api.get('/listings/my/all'),
};

// ============ TOURNAMENTS API ============
export const tournamentsAPI = {
  getAll: (sport) => api.get(`/tournaments${sport ? `?sport=${sport}` : ''}`),
  getSports: () => api.get('/tournaments/sports'),
  getOne: (id) => api.get(`/tournaments/${id}`),
  create: (formData) => api.post('/tournaments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // JSON-based create (no image upload needed)
  createJSON: (data) => api.post('/tournaments', data),
  addMatch: (id, data) => api.post(`/tournaments/${id}/matches`, data),
  deleteMatch: (matchId) => api.delete(`/tournaments/matches/${matchId}`),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  updateMatch: (matchId, data) => api.put(`/tournaments/matches/${matchId}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
};

// ============ GOVT OFFICES API ============
export const govtOfficesAPI = {
  getAll: (search) => api.get(`/govt-offices${search ? `?search=${search}` : ''}`),
  getOne: (id) => api.get(`/govt-offices/${id}`),
  create: (data) => api.post('/govt-offices', data),
  update: (id, data) => api.put(`/govt-offices/${id}`, data),
  delete: (id) => api.delete(`/govt-offices/${id}`),
};

// ============ SHOPS API ============
export const shopsAPI = {
  search: (query) => api.get(`/shops?search=${query}`),
  getSuggestions: () => api.get('/shops/suggestions'),
  getOne: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`),
};

// ============ RISHTA API ============
export const rishtaAPI = {
  getAgreement: () => api.get('/rishta/agreement'),
  getMyProfile: () => api.get('/rishta/my-profile'),
  apply: (formData) => api.post('/rishta/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadPhotos: (formData) => api.post('/rishta/upload-photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getProfiles: (params) => api.get('/rishta/profiles', { params }),
  sendInterest: (profileId) => api.post(`/rishta/interest/${profileId}`),
  getInterests: () => api.get('/rishta/interests'),
  getSentInterests: () => api.get('/rishta/sent-interests'),
  acceptInterest: (interestId) => api.put(`/rishta/interest/${interestId}/accept`),
  rejectInterest: (interestId) => api.put(`/rishta/interest/${interestId}/reject`),
  shortlist: (profileId) => api.post(`/rishta/shortlist/${profileId}`),
  getShortlisted: () => api.get('/rishta/shortlisted'),
  deleteProfile: () => api.delete('/rishta/my-profile'),
};

// ============ NEWS API ============
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getCategories: () => api.get('/news/categories'),
  getOne: (id) => api.get(`/news/${id}`),
  like: (id) => api.post(`/news/${id}/like`),
  view: (id) => api.post(`/news/${id}/view`),
  create: (formData) => api.post('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  delete: (id) => api.delete(`/news/${id}`),
};

// ============ NOTIFICATIONS API ============
export const notificationsAPI = {
  getAll: (page = 1) => api.get(`/notifications?page=${page}`),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  saveFcmToken: (token) => api.put('/notifications/fcm-token', { token }),
  removeFcmToken: () => api.delete('/notifications/fcm-token'),
};

// ============ CHAT API ============
export const chatAPI = {
  getMessages: (page = 1) => api.get(`/chat/messages?page=${page}`),
  sendMessage: (data) => api.post('/chat/messages', {
    text: data.text || null,
    images: data.images || [],
    videos: [],
    voiceUrl: data.voiceUrl || null,
    voiceDuration: data.voiceDuration || null,
    replyToId: data.replyToId || null,
  }),
  uploadVoice: (data) => api.post('/chat/voice', data),
  getUserProfile: (userId) => api.get(`/chat/user/${userId}`),
  reactToMessage: (msgId, emoji) => api.post(`/chat/messages/${msgId}/react`, { emoji }),
  reportMessage: (data) => api.post('/chat/report', data),
  deleteMessage: (msgId) => api.delete(`/chat/messages/${msgId}`),
};

// ============ CHATBOT API ============
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
};

// ============ DM API ============
export const dmAPI = {
  startChat: (userId, source) => api.post(`/dm/start/${userId}`, { source }),
  getChats: () => api.get('/dm/chats'),
  getMessages: (chatId, page = 1) => api.get(`/dm/${chatId}/messages?page=${page}`),
  sendMessage: (chatId, data) => api.post(`/dm/${chatId}/messages`, data),
  uploadImages: (chatId, formData) => api.post(`/dm/${chatId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  blockUser: (chatId) => api.post(`/dm/${chatId}/block`),
  unblockUser: (chatId) => api.post(`/dm/${chatId}/unblock`),
  report: (chatId, data) => api.post(`/dm/${chatId}/report`, data),
};

// ============ BLOOD DONATION API ============
export const bloodAPI = {
  getDonors: (params) => api.get('/blood/donors', { params }),
  getGroups: () => api.get('/blood/groups'),
  getMyDonation: () => api.get('/blood/my-donation'),
  register: (data) => api.post('/blood/register', data),
  update: (data) => api.put('/blood/update', data),
  unregister: () => api.delete('/blood/unregister'),
};

// ============ PUBLIC CONFIG API ============
export const publicConfigAPI = {
  getPublicConfig: () => api.get('/public-config', { headers: { Authorization: '' } }),
};

// ============ ADMIN API ============
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle-active`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingRishta: () => api.get('/admin/rishta/pending'),
  approveRishta: (id) => api.put(`/admin/rishta/${id}/approve`),
  rejectRishta: (id, reason) => api.put(`/admin/rishta/${id}/reject`, { reason }),
  getReporters: () => api.get('/admin/reporters'),
  addReporter: (data) => api.post('/admin/reporters', data),
  toggleReporter: (id) => api.put(`/admin/reporters/${id}/toggle-active`),
  deleteReporter: (id) => api.delete(`/admin/reporters/${id}`),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  deleteChatMessage: (id) => api.delete(`/admin/chat-messages/${id}`),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
  deleteTournament: (id) => api.delete(`/admin/tournaments/${id}`),
  // Bulk cleanup
  bulkDeleteChat: (data) => api.delete('/admin/chat-messages-bulk', { data }),
  bulkDeleteNotifications: (data) => api.delete('/admin/notifications-bulk', { data }),
  // Storage / DB info
  getStorage: () => api.get('/admin/storage'),
  getDbStatus: () => api.get('/db-status'),
  getCloudinaryStatus: () => api.get('/cloudinary-status'),
  switchCloudinary: (index) => api.post('/cloudinary-switch', { index }),
  switchDatabase: (index) => api.post('/db-switch', { index }),
  // Cleanup old records
  cleanup: (target, olderThanDays = 30) => api.post('/admin/cleanup', { target, olderThanDays }),
  // Push notifications
  sendNotification: (data) => api.post('/admin/send-notification', data),
  getNotificationStats: () => api.get('/admin/notification-stats'),
  // Job poster permissions
  requestJobPosterAccess: () => api.post('/admin/job-posters/request'),
  getJobPosterRequests: () => api.get('/admin/job-posters/requests'),
  getApprovedJobPosters: () => api.get('/admin/job-posters/approved'),
  approveJobPoster: (userId) => api.put(`/admin/job-posters/${userId}/approve`),
  revokeJobPoster: (userId) => api.put(`/admin/job-posters/${userId}/revoke`),
  // Ads settings
  getAdSettings: () => api.get('/admin/settings/ads'),
  updateAdSettings: (adsEnabled) => api.post('/admin/settings/ads', { adsEnabled }),
};

// ============ REPORTS API ============
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  takeAction: (id, action) => api.put(`/reports/${id}/action`, { action }),
  // Submit a content report (posts, listings, users, etc.)
  submit: (data) => api.post('/reports', data), // { targetType, targetId, targetUserId, reason }
};

// ============ DOCTORS API ============
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getSpecialties: () => api.get('/doctors/specialties'),
  getOne: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  // Doctor auth
  doctorLogin: (data) => api.post('/doctors/auth/login', data),
  doctorProfile: (token) => withDoctorTokenRetry(() => api.get('/doctors/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })),
  doctorUpdateProfile: (token, data) => withDoctorTokenRetry(() => api.put('/doctors/me/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  doctorDashboard: (token) => withDoctorTokenRetry(() => api.get('/doctors/me/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  })),
  doctorUpdateToken: (token, currentToken) => withDoctorTokenRetry(() => api.put('/doctors/me/current-token', { currentToken }, {
    headers: { Authorization: `Bearer ${token}` },
  })),
};

// ============ APPOINTMENTS API ============
export const appointmentsAPI = {
  book: (data) => withDoctorTokenRetry(() => api.post('/appointments/book', data)),
  getMine: () => api.get('/appointments/my'),
  getForDoctor: (token, params) => withDoctorTokenRetry(() => api.get('/appointments/doctor', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })),
  getOne: (id) => api.get(`/appointments/${id}`),
  uploadPaymentProof: (id, formData) => api.put(`/appointments/${id}/payment-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  // Doctor actions
  approve: (token, id) => withDoctorTokenRetry(() => api.put(`/appointments/${id}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  reject: (token, id, reason) => withDoctorTokenRetry(() => api.put(`/appointments/${id}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  verifyPayment: (token, id) => withDoctorTokenRetry(() => api.put(`/appointments/${id}/verify-payment`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  complete: (token, id) => withDoctorTokenRetry(() => api.put(`/appointments/${id}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  noShow: (token, id) => withDoctorTokenRetry(() => api.put(`/appointments/${id}/no-show`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })),
  // Public - returns { currentToken, totalTokensToday } for live queue display
  getLiveToken: (doctorId) => api.get(`/appointments/live-token/${doctorId}`),
};

// ============ JOBS API ============
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  canPost: () => api.get('/jobs/can-post'),
  getCategories: () => api.get('/jobs/categories'),
  getOne: (id) => api.get(`/jobs/${id}`),
  getMine: () => api.get('/jobs/my'),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  requestPostAccess: () => api.post('/admin/job-posters/request'),
};

// ============ SERVICES API ============
export const servicesAPI = {
  // Public
  getCategories: () => api.get('/services/categories'),
  getSubCategories: (categoryId) => api.get(`/services/categories/${categoryId}/sub`),
  getProviders: (subCategoryId, categoryId) => api.get('/services/providers', { params: { subCategoryId, categoryId } }),
  getProviderDetail: (providerId) => api.get(`/services/providers/${providerId}`),
  // Provider
  getMyProviderStatus: () => api.get('/services/my-provider'),
  registerProvider: (formData) => api.post('/services/register-provider', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  // Reviews
  submitReview: (providerId, stars, comment) => api.post(`/services/providers/${providerId}/review`, { stars, comment }),
  // Admin
  adminGetPending: () => api.get('/services/admin/pending'),
  adminApproveProvider: (id) => api.put(`/services/admin/providers/${id}/approve`),
  adminRejectProvider: (id, reason) => api.put(`/services/admin/providers/${id}/reject`, { reason }),
  adminAddCategory: (data) => api.post('/services/admin/categories', data),
  adminAddSubCategory: (categoryId, data) => api.post(`/services/admin/categories/${categoryId}/sub`, data),
  adminDeleteCategory: (id) => api.delete(`/services/admin/categories/${id}`),
  adminDeleteSubCategory: (id) => api.delete(`/services/admin/subcategories/${id}`),
};

// ============ ALIASES FOR BACKWARDS COMPATIBILITY ============
export const listingAPI = listingsAPI;
export const tournamentAPI = tournamentsAPI;

// ============ RESTAURANTS & DEALS API ============
export const restaurantsAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getOne: (id) => api.get(`/restaurants/${id}`),
  getAllDeals: () => api.get('/restaurants/deals/all'),
  likeDeal: (dealId) => api.post(`/restaurants/deals/${dealId}/like`),
  viewDeal: (dealId) => api.post(`/restaurants/deals/${dealId}/view`),
  // Admin
  adminCreate: (formData) => api.post('/restaurants/admin/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminUpdate: (id, data) => api.put(`/restaurants/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/restaurants/admin/${id}`),
  // Restaurant owner auth (uses separate token stored per session)
  ownerLogin: (data) => api.post('/restaurants/auth/login', data),
  ownerProfile: (token) => api.get('/restaurants/owner/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  getOwnerStats: (token) => api.get('/restaurants/owner/stats', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  ownerCreateDeal: (token, formData) => api.post('/restaurants/owner/deals', formData, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
  }),
  ownerUpdateDeal: (token, dealId, data) => api.put(`/restaurants/owner/deals/${dealId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  ownerDeleteDeal: (token, dealId) => api.delete(`/restaurants/owner/deals/${dealId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  // Approved trader deal posting (uses user JWT)
  traderMyDeals: () => api.get('/restaurants/trader/my-deals'),
  traderCreateDeal: (formData) => api.post('/restaurants/trader/deals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  traderDeleteDeal: (dealId) => api.delete(`/restaurants/trader/deals/${dealId}`),
};

// ============ CLOTH BRANDS & DEALS API ============
export const clothBrandsAPI = {
  getAll: (params) => api.get('/cloth-brands', { params }),
  getOne: (id) => api.get(`/cloth-brands/${id}`),
  getAllDeals: () => api.get('/cloth-brands/deals/all'),
  likeDeal: (dealId) => api.post(`/cloth-brands/deals/${dealId}/like`),
  viewDeal: (dealId) => api.post(`/cloth-brands/deals/${dealId}/view`),
  // Admin
  adminCreate: (formData) => api.post('/cloth-brands/admin/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminUpdate: (id, data) => api.put(`/cloth-brands/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/cloth-brands/admin/${id}`),
  // Brand owner auth
  ownerLogin: (data) => api.post('/cloth-brands/auth/login', data),
  ownerProfile: (token) => api.get('/cloth-brands/owner/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  ownerCreateDeal: (token, formData) => api.post('/cloth-brands/owner/deals', formData, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}`, timeout: 300000 },
  }),
  ownerUpdateDeal: (token, dealId, data) => api.put(`/cloth-brands/owner/deals/${dealId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  ownerDeleteDeal: (token, dealId) => api.delete(`/cloth-brands/owner/deals/${dealId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  // Approved trader deal posting (uses user JWT)
  traderMyDeals: () => api.get('/cloth-brands/trader/my-deals'),
  traderCreateDeal: (formData) => api.post('/cloth-brands/trader/deals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  traderDeleteDeal: (dealId) => api.delete(`/cloth-brands/trader/deals/${dealId}`),
};

// ============ BAZAR / TRADER API ============
export const bazarAPI = {
  // Bazars
  getBazars: () => api.get('/bazar/bazars'),
  // Trader registration
  register: (formData) => api.post('/bazar/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyStatus: () => api.get('/bazar/my-status'),
  // Traders
  getTraders: (bazarId) => api.get(`/bazar/traders/${bazarId}`),
  searchTraders: (q) => api.get('/bazar/traders/search', { params: { q } }),
  // Chat
  getMessages: (bazarId, page = 1) => api.get('/bazar/chat/messages', { params: { bazarId, page } }),
  sendMessage: (formData) => api.post('/bazar/chat/send', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  createPoll: (data) => api.post('/bazar/chat/poll', data),
  votePoll: (messageId, optionIndex) => api.post(`/bazar/chat/poll/${messageId}/vote`, { optionIndex }),
  deleteMessage: (id) => api.delete(`/bazar/chat/messages/${id}`),
  reportMessage: (messageId, reason) =>
    api.post(`/bazar/chat/messages/${messageId}/report`, { reason }),
  // Admin/President
  getPending: (adminToken) => api.get('/bazar/pending', {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  getApproved: (adminToken) => api.get('/bazar/approved', {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  approveTrader: (id, adminToken) => api.put(`/bazar/${id}/approve`, {}, {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  rejectTrader: (id, adminToken) => api.put(`/bazar/${id}/reject`, {}, {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  deleteTrader: (id, adminToken) => api.delete(`/bazar/trader/${id}`, {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  updateTraderControls: async (id, data, adminToken) => {
    const headers = adminToken ? { 'x-president-token': adminToken } : {};
    try {
      return await api.put(`/bazar/trader/${id}/controls`, data, { headers });
    } catch (err) {
      if (err?.response?.status !== 404) throw err;
      try {
        return await api.put(`/bazar/traders/${id}/controls`, data, { headers });
      } catch (err2) {
        if (err2?.response?.status !== 404) throw err2;
        return api.put(`/bazar/${id}/controls`, data, { headers });
      }
    }
  },
  getAllTraders: () => api.get('/bazar/all-traders'),
  // Bazar management (admin/president)
  addBazar: (name, adminToken) => api.post('/bazar/bazars', { name }, {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  deleteBazar: (id, adminToken) => api.delete(`/bazar/bazars/${id}`, {
    headers: adminToken ? { 'x-president-token': adminToken } : {},
  }),
  // President
  adminLogin: (data) => api.post('/bazar/president/login', data),
  adminDashboard: (adminToken) => api.get('/bazar/president/dashboard', {
    headers: { 'x-president-token': adminToken },
  }),
  createAdmin: (data) => api.post('/bazar/president/create', data),
  listAdmins: () => api.get('/bazar/presidents'),
  deleteAdmin: (id) => api.delete(`/bazar/president/${id}`),
  // Export
  getExportUrl: (adminToken, bazarId) =>
    `${API_URL}/bazar/export-traders?presidentToken=${encodeURIComponent(adminToken)}${bazarId && bazarId !== 'all' ? '&bazarId=' + bazarId : ''}`,
};

// ============ AC OFFICE API ============
export const acAPI = {
  // AC Officer auth
  login: (data) => api.post('/ac/auth/login', data),
  // Admin: manage officers
  createOfficer: (data) => api.post('/ac/admin/officer/create', data),
  getOfficers: () => api.get('/ac/admin/officers'),
  deleteOfficer: (id) => api.delete(`/ac/admin/officer/${id}`),
  // Admin: CNIC verification
  getPendingCnic: () => api.get('/ac/admin/pending-cnic'),
  getAllComplainants: () => api.get('/ac/admin/all-complainants'),
  approveCnic: (id) => api.put(`/ac/admin/cnic/${id}/approve`),
  rejectCnic: (id, reason) => api.put(`/ac/admin/cnic/${id}/reject`, { reason }),
  adminExport: () => api.get('/ac/admin/export', { responseType: 'blob' }),
  adminCreateAnnouncement: (data) => api.post('/ac/admin/announcements', data),
  // User: complainant
  submitCnic: (formData) => api.post('/ac/complainant/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  getComplainantStatus: () => api.get('/ac/complainant/status'),
  // User: complaints
  submitComplaint: (formData) => api.post('/ac/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  getMyComplaints: () => api.get('/ac/complaints/mine'),
  rateComplaint: (id, rating) => api.post(`/ac/complaints/${id}/rate`, { rating }),
  // Public: announcements
  getAnnouncements: () => api.get('/ac/announcements'),
  viewAnnouncement: (id) => api.post(`/ac/announcements/${id}/view`),
  likeAnnouncement: (id) => api.post(`/ac/announcements/${id}/like`),
  // AC Officer dashboard (uses x-ac-token)
  getDashboard: (token) => api.get('/ac/dashboard', {
    headers: { 'x-ac-token': token },
  }),
  getComplaintDetail: (token, id) => api.get(`/ac/complaints/${id}/detail`, {
    headers: { 'x-ac-token': token },
  }),
  updateComplaintStatus: (token, id, status) => api.put(`/ac/complaints/${id}/status`, { status }, {
    headers: { 'x-ac-token': token },
  }),
  acCreateAnnouncement: (token, formData) => api.post('/ac/announcements/create', formData, {
    headers: { 'x-ac-token': token, 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  acDeleteAnnouncement: (token, id) => api.delete(`/ac/announcements/${id}`, {
    headers: { 'x-ac-token': token },
  }),
  acExport: (token) => api.get('/ac/export', {
    headers: { 'x-ac-token': token },
    responseType: 'blob',
  }),
  getExportUrl: (token) => `${API_URL}/ac/export?token=${encodeURIComponent(token)}`,
};

export default api;

