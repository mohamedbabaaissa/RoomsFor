/**
 * All endpoints the front-end needs, in one place.
 * Build your backend with these same routes + JSON shapes (see README.md),
 * set VITE_USE_MOCK=false and nothing else in the UI has to change.
 */
import { request as r } from './http';

export const api = {
  // ---- auth
  login: (email, password) => r('POST', '/auth/login', { body: { email, password } }),
  register: (data) => r('POST', '/auth/register', { body: data }),
  registerBusiness: (data) => r('POST', '/auth/register-business', { body: data }),
  me: () => r('GET', '/auth/me'),
  updateProfile: (data) => r('PATCH', '/me', { body: data }),

  // ---- public
  listings: (params) => r('GET', '/listings', { params }),
  listing: (id) => r('GET', `/listings/${id}`),
  cities: () => r('GET', '/cities'),
  settings: () => r('GET', '/settings'),
  agents: () => r('GET', '/agents'),
  posts: () => r('GET', '/blog'),
  post: (id) => r('GET', `/blog/${id}`),
  sendContact: (data) => r('POST', '/contact', { body: data }),

  // ---- user
  favorites: () => r('GET', '/me/favorites'),
  addFavorite: (id) => r('POST', `/me/favorites/${id}`),
  removeFavorite: (id) => r('DELETE', `/me/favorites/${id}`),
  myBookings: () => r('GET', '/me/bookings'),
  createBooking: (data) => r('POST', '/bookings', { body: data }),
  cancelBooking: (id) => r('PATCH', `/bookings/${id}/cancel`),

  // ---- business dashboard
  bizStats: () => r('GET', '/business/stats'),
  bizListings: () => r('GET', '/business/listings'),
  bizCreateListing: (d) => r('POST', '/business/listings', { body: d }),
  bizUpdateListing: (id, d) => r('PUT', `/business/listings/${id}`, { body: d }),
  bizDeleteListing: (id) => r('DELETE', `/business/listings/${id}`),
  bizBookings: () => r('GET', '/business/bookings'),
  bizSetBookingStatus: (id, status) => r('PATCH', `/business/bookings/${id}`, { body: { status } }),

  // ---- website admin dashboard
  adminStats: () => r('GET', '/admin/stats'),
  adminBusinesses: (params) => r('GET', '/admin/businesses', { params }),
  adminSetBusinessStatus: (id, status) => r('PATCH', `/admin/businesses/${id}`, { body: { status } }),
  adminUsers: () => r('GET', '/admin/users'),
  adminSetUserStatus: (id, status) => r('PATCH', `/admin/users/${id}`, { body: { status } }),
  adminListings: () => r('GET', '/admin/listings'),
  adminSetListingStatus: (id, status, featured) => r('PATCH', `/admin/listings/${id}`, { body: { status, ...(featured !== undefined ? { featured } : {}) } }),
  adminDeleteListing: (id) => r('DELETE', `/admin/listings/${id}`),
  adminBookings: () => r('GET', '/admin/bookings'),
  adminMessages: () => r('GET', '/admin/messages'),
  adminCreateCity: (d) => r('POST', '/admin/cities', { body: d }),
  adminUpdateCity: (id, d) => r('PUT', `/admin/cities/${id}`, { body: d }),
  adminDeleteCity: (id) => r('DELETE', `/admin/cities/${id}`),
  adminSettings: () => r('GET', '/admin/settings'),
  adminSaveSettings: (data) => r('PUT', '/admin/settings', { body: data }), // { mode, rates }
  adminRefreshRates: () => r('POST', '/admin/settings/refresh'),
};
