import api from './api'

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  login:    (data)         => api.post('/auth/login', data),
  register: (data)         => api.post('/auth/register', data),
  refresh:  (refreshToken) => api.post('/auth/refresh', null, { params: { refreshToken } }),
}

// ── Restaurants ───────────────────────────────────────────────
export const restaurantService = {
  search:    (params)              => api.get('/restaurants', { params }),
  getById:   (id)                  => api.get(`/restaurants/${id}`),
  getCuisines: ()                  => api.get('/restaurants/cuisines'),
  getMine:   ()                    => api.get('/restaurants/my'),
  create:    (data)                => api.post('/restaurants', data),
  update:    (id, data)            => api.put(`/restaurants/${id}`, data),
  remove:    (id)                  => api.delete(`/restaurants/${id}`),
  addTable:  (restaurantId, data)  => api.post(`/restaurants/${restaurantId}/tables`, data),
  updateTable: (rId, tId, data)    => api.put(`/restaurants/${rId}/tables/${tId}`, data),
  getTables: (restaurantId)        => api.get(`/restaurants/${restaurantId}/tables`),
}

// ── Bookings ──────────────────────────────────────────────────
export const bookingService = {
  create:          (data)                  => api.post('/bookings', data),
  cancel:          (id)                    => api.delete(`/bookings/${id}`),
  getMyBookings:   (params)                => api.get('/bookings/my', { params }),
  getByRef:        (ref)                   => api.get(`/bookings/ref/${ref}`),
  getByRestaurant: (restaurantId, params)  => api.get(`/bookings/restaurant/${restaurantId}`, { params }),
  checkAvailable:  (params)               => api.get('/bookings/available-tables', { params }),
  updateStatus:    (id, status)            => api.patch(`/bookings/${id}/status`, null, { params: { status } }),
}

// ── Reviews ───────────────────────────────────────────────────
export const reviewService = {
  getByRestaurant: (restaurantId, params) => api.get(`/restaurants/${restaurantId}/reviews`, { params }),
  create:          (data)                 => api.post('/reviews', data),
  getMyReviews:    (params)               => api.get('/reviews/my', { params }),
  toggleVisibility: (reviewId)            => api.patch(`/admin/reviews/${reviewId}/visibility`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminService = {
  getUsers:          (params) => api.get('/admin/users', { params }),
  toggleUserStatus:  (userId) => api.patch(`/admin/users/${userId}/toggle-status`),
  getRestaurants:    (params) => api.get('/admin/restaurants', { params }),
  getDashboard:      ()       => api.get('/admin/dashboard'),
}
