/**
 * Fake backend that runs in the browser. Data starts from src/data/*.json and
 * every change is saved in localStorage ("rfr_db_v2"), so it survives reloads.
 * To reset everything: localStorage.removeItem('rfr_db_v1') (or the "Reset demo data" link in the footer).
 *
 * It mimics a REST API: same routes, status codes and JSON shapes you should build in your real backend.
 */
import users from '../../data/users.json';
import listings from '../../data/listings.json';
import bookings from '../../data/bookings.json';
import blog from '../../data/blog.json';
import messages from '../../data/messages.json';
import favorites from '../../data/favorites.json';
import cities from '../../data/cities.json';
import settings from '../../data/settings.json';

const DB_KEY = 'rfr_db_v2';
const seed = () => JSON.parse(JSON.stringify({ users, listings, bookings, blog, messages, favorites, cities, settings }));
let memory = null;

function load() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) { memory = JSON.parse(raw); ensureSettings(memory); return memory; }
  } catch {}
  memory = seed();
  save();
  return memory;
}
// older saved databases may not have the auto/manual fields yet
function ensureSettings(db) {
  const s = db.settings;
  s.mode = s.mode || 'manual';
  s.autoRates = s.autoRates || { DZD: 1, EUR: 155.4, USD: 134.1 };
  s.autoUpdatedAt = s.autoUpdatedAt || today();
  s.updatedAt = s.updatedAt || today();
}
function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(memory)); } catch {} }
export function resetMockDb() { memory = null; try { localStorage.removeItem(DB_KEY); } catch {} }

const ok = (data, status = 200) => ({ status, data });
const fail = (status, message, extra = {}) => ({ status, data: { message, ...extra } });
const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);
const safe = ({ password, ...u }) => u;
const CURRENCIES = ['USD', 'EUR', 'DZD'];
// rates[X] = how many DZD one X is worth (DZD itself is 1)
// manual = the rates the admin typed. auto = official rates fetched from a bank/API (dummy numbers here).
const effRates = (db) => (db.settings.mode === 'auto' ? db.settings.autoRates : db.settings.rates);
const toUSD = (db, amount, cur) => { const r = effRates(db); return (amount * r[cur || 'USD']) / r.USD; };
const sumUSD = (db, bookings) => Math.round(bookings.filter((b) => b.status === 'confirmed' && b.total).reduce((s, b) => s + toUSD(db, b.total, b.currency), 0));

const userFromToken = (db, token) => {
  if (!token || !token.startsWith('mock.')) return null;
  try { const id = atob(token.slice(5)); return db.users.find((u) => u.id === id) || null; } catch { return null; }
};

// ---------- enrichers
const pubBusiness = (db, id) => {
  const b = db.users.find((u) => u.id === id);
  return b ? { id: b.id, name: b.name, businessName: b.businessName, phone: b.phone, email: b.email, avatar: b.avatar || '', bio: b.bio || '' } : null;
};
const withBusiness = (db, l) => ({ ...l, business: pubBusiness(db, l.businessId) });
const visible = (db, l) => l.status === 'published' && db.users.find((u) => u.id === l.businessId)?.status === 'approved';
const withBookingInfo = (db, b) => {
  const l = db.listings.find((x) => x.id === b.listingId);
  const u = db.users.find((x) => x.id === b.userId);
  return {
    ...b,
    listing: l ? { id: l.id, title: l.title, image: l.images[0], city: l.city, category: l.category, mode: l.mode, price: l.price, priceUnit: l.priceUnit, currency: l.currency } : null,
    user: u ? { id: u.id, name: u.name, email: u.email, phone: u.phone } : null,
    business: pubBusiness(db, b.businessId),
  };
};

// ---------- helpers
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const paginate = (arr, page = 1, limit = 12) => {
  page = Number(page) || 1; limit = Number(limit) || 12;
  return { items: arr.slice((page - 1) * limit, page * limit), total: arr.length, page, pages: Math.max(1, Math.ceil(arr.length / limit)) };
};

// ---------- routes
const routes = [];
const route = (method, path, roles, handler) => {
  const keys = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, roles, handler });
};

// AUTH
route('POST', '/auth/login', null, ({ db, body }) => {
  const { email = '', password = '' } = body || {};
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.password !== password) return fail(401, 'Wrong email or password.');
  if (u.role === 'business' && u.status === 'pending') return fail(403, 'Your business account is waiting for approval from the website admin.', { code: 'PENDING' });
  if (u.role === 'business' && u.status === 'rejected') return fail(403, 'Your business registration was rejected by the website admin.', { code: 'REJECTED' });
  if (u.status === 'suspended' || u.status === 'blocked') return fail(403, 'This account has been suspended. Contact support.', { code: 'SUSPENDED' });
  return ok({ token: 'mock.' + btoa(u.id), user: safe(u) });
});
route('POST', '/auth/register', null, ({ db, body }) => {
  const { name, email, password, phone } = body || {};
  if (!name || !email || !password) return fail(400, 'Name, email and password are required.');
  if (password.length < 6) return fail(400, 'Password must be at least 6 characters.');
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return fail(409, 'This email is already registered.');
  const u = { id: uid('u'), role: 'user', name, email, password, phone: phone || '', status: 'active', createdAt: today() };
  db.users.push(u); save();
  return ok({ token: 'mock.' + btoa(u.id), user: safe(u) }, 201);
});
route('POST', '/auth/register-business', null, ({ db, body }) => {
  const { name, email, password, businessName, phone, city, businessType } = body || {};
  if (!name || !email || !password || !businessName) return fail(400, 'Please fill in all required fields.');
  if (password.length < 6) return fail(400, 'Password must be at least 6 characters.');
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return fail(409, 'This email is already registered.');
  const u = { id: uid('b'), role: 'business', name, email, password, status: 'pending', businessName, businessType: businessType || 'agency', phone: phone || '', city: city || '', avatar: '', bio: '', createdAt: today() };
  db.users.push(u); save();
  return ok({ message: 'Registration received. The website admin must confirm your account before you can log in.', user: safe(u) }, 201);
});
route('GET', '/auth/me', ['admin', 'business', 'user'], ({ user }) => ok(safe(user)));
route('PATCH', '/me', ['admin', 'business', 'user'], ({ db, user, body }) => {
  const { name, phone, city, businessName, bio, avatar } = body || {};
  if (name !== undefined) { if (!String(name).trim()) return fail(400, 'Name is required.'); user.name = name; }
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (user.role === 'business') {
    if (businessName !== undefined) { if (!String(businessName).trim()) return fail(400, 'Business name is required.'); user.businessName = businessName; }
    if (bio !== undefined) user.bio = String(bio).slice(0, 600);
    if (avatar !== undefined) { if (avatar && avatar.length > 600000) return fail(400, 'Photo is too large.'); user.avatar = avatar; }
  }
  save(); return ok(safe(user));
});

// PUBLIC
route('GET', '/listings', null, ({ db, query: q }) => {
  let items = db.listings.filter((l) => visible(db, l));
  if (q.category) items = items.filter((l) => l.category === q.category);
  if (q.mode) items = items.filter((l) => l.mode === q.mode);
  if (q.city) items = items.filter((l) => l.city === q.city);
  if (q.featured) items = items.filter((l) => l.featured);
  if (q.businessId) items = items.filter((l) => l.businessId === q.businessId);
  if (q.beds) items = items.filter((l) => l.beds >= Number(q.beds));
  // price filters are in USD; every listing is converted from its own currency first
  if (q.minPrice) items = items.filter((l) => toUSD(db, l.price, l.currency) >= Number(q.minPrice));
  if (q.maxPrice) items = items.filter((l) => toUSD(db, l.price, l.currency) <= Number(q.maxPrice));
  if (q.q) { const s = q.q.toLowerCase(); items = items.filter((l) => `${l.title} ${l.address} ${l.description}`.toLowerCase().includes(s)); }
  const sorts = {
    price_asc: (a, b) => toUSD(db, a.price, a.currency) - toUSD(db, b.price, b.currency),
    price_desc: (a, b) => toUSD(db, b.price, b.currency) - toUSD(db, a.price, a.currency),
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  };
  items = [...items].sort(sorts[q.sort] || sorts.newest);
  const page = paginate(items, q.page, q.limit);
  return ok({ ...page, items: page.items.map((l) => withBusiness(db, l)) });
});
route('GET', '/listings/:id', null, ({ db, params }) => {
  const l = db.listings.find((x) => x.id === params.id);
  if (!l || !visible(db, l)) return fail(404, 'Listing not found.');
  return ok(withBusiness(db, l));
});
route('GET', '/cities', null, ({ db }) => {
  const count = (name) => db.listings.filter((l) => l.city === name && visible(db, l)).length;
  return ok(db.cities.map((c) => ({ ...c, count: count(c.name) })));
});
route('GET', '/settings', null, ({ db }) => ok({ rates: effRates(db), mode: db.settings.mode, currencies: CURRENCIES }));
route('GET', '/agents', null, ({ db }) =>
  ok(db.users.filter((u) => u.role === 'business' && u.status === 'approved').map((u) => ({
    id: u.id, name: u.name, businessName: u.businessName, businessType: u.businessType, phone: u.phone, email: u.email, city: u.city, avatar: u.avatar || '', bio: u.bio || '',
    listings: db.listings.filter((l) => l.businessId === u.id && visible(db, l)).length,
  }))));
route('GET', '/blog', null, ({ db }) => ok(db.blog));
route('GET', '/blog/:id', null, ({ db, params }) => {
  const p = db.blog.find((x) => x.id === params.id);
  return p ? ok(p) : fail(404, 'Post not found.');
});
route('POST', '/contact', null, ({ db, body }) => {
  const { name, email, message } = body || {};
  if (!name || !email || !message) return fail(400, 'Name, email and message are required.');
  db.messages.unshift({ id: uid('m'), name, email, subject: body.subject || '', message, createdAt: today() });
  save(); return ok({ message: 'Message sent. We will get back to you soon.' }, 201);
});

// USER
route('GET', '/me/favorites', ['user'], ({ db, user }) => {
  const ids = db.favorites.filter((f) => f.userId === user.id).map((f) => f.listingId);
  return ok(db.listings.filter((l) => ids.includes(l.id) && visible(db, l)).map((l) => withBusiness(db, l)));
});
route('POST', '/me/favorites/:id', ['user'], ({ db, user, params }) => {
  if (!db.favorites.some((f) => f.userId === user.id && f.listingId === params.id)) db.favorites.push({ userId: user.id, listingId: params.id });
  save(); return ok({ ok: true }, 201);
});
route('DELETE', '/me/favorites/:id', ['user'], ({ db, user, params }) => {
  db.favorites = db.favorites.filter((f) => !(f.userId === user.id && f.listingId === params.id));
  save(); return ok({ ok: true });
});
route('GET', '/me/bookings', ['user'], ({ db, user }) =>
  ok(db.bookings.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((b) => withBookingInfo(db, b))));
route('POST', '/bookings', ['user'], ({ db, user, body }) => {
  const l = db.listings.find((x) => x.id === body?.listingId);
  if (!l || !visible(db, l)) return fail(404, 'Listing not found.');
  const b = { id: uid('bk'), listingId: l.id, userId: user.id, businessId: l.businessId, message: body.message || '', status: 'pending', createdAt: today() };
  if (l.mode === 'sale') {
    Object.assign(b, { kind: 'inquiry', checkIn: null, checkOut: null, guests: null, total: null, currency: l.currency });
  } else {
    const { checkIn, checkOut } = body;
    const guests = Number(body.guests) || 1;
    if (!checkIn || !checkOut) return fail(400, 'Please choose your dates.');
    const nights = dayDiff(checkIn, checkOut);
    if (nights < 1) return fail(400, 'Check-out must be after check-in.');
    if (checkIn < today()) return fail(400, 'Check-in cannot be in the past.');
    if (guests > l.guests) return fail(400, `This place accepts up to ${l.guests} guests.`);
    const clash = db.bookings.some((x) => x.listingId === l.id && x.kind === 'booking' && x.status === 'confirmed' && checkIn < x.checkOut && checkOut > x.checkIn);
    if (clash) return fail(409, 'Those dates are already booked. Try other dates.');
    const total = l.priceUnit === 'night' ? nights * l.price : Math.max(1, Math.ceil(nights / 30)) * l.price;
    Object.assign(b, { kind: 'booking', checkIn, checkOut, guests, total, currency: l.currency });
  }
  db.bookings.push(b); save();
  return ok(withBookingInfo(db, b), 201);
});
route('PATCH', '/bookings/:id/cancel', ['user'], ({ db, user, params }) => {
  const b = db.bookings.find((x) => x.id === params.id && x.userId === user.id);
  if (!b) return fail(404, 'Booking not found.');
  if (['cancelled', 'declined'].includes(b.status)) return fail(400, 'Already closed.');
  b.status = 'cancelled'; save(); return ok(withBookingInfo(db, b));
});

// BUSINESS
const mine = (db, user) => db.listings.filter((l) => l.businessId === user.id);
route('GET', '/business/stats', ['business'], ({ db, user }) => {
  const ls = mine(db, user), bs = db.bookings.filter((b) => b.businessId === user.id);
  return ok({
    listings: ls.length, published: ls.filter((l) => l.status === 'published').length,
    pending: bs.filter((b) => b.status === 'pending').length,
    confirmed: bs.filter((b) => b.status === 'confirmed').length,
    revenueUSD: sumUSD(db, bs),
    byStatus: ['pending', 'confirmed', 'declined', 'cancelled'].map((s) => ({ status: s, count: bs.filter((b) => b.status === s).length })),
    recent: bs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((b) => withBookingInfo(db, b)),
  });
});
route('GET', '/business/listings', ['business'], ({ db, user }) => ok(mine(db, user).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
const validateListing = (d, db) => {
  if (!d.title?.trim()) return 'Title is required.';
  if (!['home', 'hotel'].includes(d.category)) return 'Choose home or hotel.';
  if (!['rent', 'sale'].includes(d.mode)) return 'Choose rent or sale.';
  if (!d.city || (db && !db.cities.some((c) => c.name === d.city))) return 'Choose a city from the list.';
  if (!CURRENCIES.includes(d.currency || 'USD')) return 'Choose USD, EUR or DZD.';
  if (!(Number(d.price) > 0)) return 'Price must be greater than 0.';
  return null;
};
const cleanListing = (d) => ({
  title: d.title.trim(), category: d.category, mode: d.mode, city: d.city, address: d.address || d.city,
  price: Number(d.price), currency: d.currency || 'USD', priceUnit: d.mode === 'sale' ? 'once' : d.priceUnit === 'month' ? 'month' : 'night',
  beds: Number(d.beds) || 0, baths: Number(d.baths) || 0, sqft: Number(d.sqft) || 0, guests: Number(d.guests) || 1,
  stars: d.category === 'hotel' ? Number(d.stars) || null : null,
  amenities: Array.isArray(d.amenities) ? d.amenities : [], description: d.description || '',
  images: Array.isArray(d.images) && d.images.length ? d.images : ['/img/p1.jpg'],
});
route('POST', '/business/listings', ['business'], ({ db, user, body }) => {
  const err = validateListing(body || {}, db); if (err) return fail(400, err);
  const l = { id: uid('l'), businessId: user.id, featured: false, status: 'published', rating: 4.5, createdAt: today(), ...cleanListing(body) };
  db.listings.push(l); save(); return ok(l, 201);
});
route('PUT', '/business/listings/:id', ['business'], ({ db, user, params, body }) => {
  const l = mine(db, user).find((x) => x.id === params.id);
  if (!l) return fail(404, 'Listing not found.');
  const err = validateListing(body || {}, db); if (err) return fail(400, err);
  Object.assign(l, cleanListing(body), body.status && ['published', 'hidden'].includes(body.status) && l.status !== 'blocked' ? { status: body.status } : {});
  save(); return ok(l);
});
route('DELETE', '/business/listings/:id', ['business'], ({ db, user, params }) => {
  if (!mine(db, user).some((x) => x.id === params.id)) return fail(404, 'Listing not found.');
  db.listings = db.listings.filter((x) => x.id !== params.id); save(); return ok({ ok: true });
});
route('GET', '/business/bookings', ['business'], ({ db, user }) =>
  ok(db.bookings.filter((b) => b.businessId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((b) => withBookingInfo(db, b))));
route('PATCH', '/business/bookings/:id', ['business'], ({ db, user, params, body }) => {
  const b = db.bookings.find((x) => x.id === params.id && x.businessId === user.id);
  if (!b) return fail(404, 'Request not found.');
  if (!['confirmed', 'declined'].includes(body?.status)) return fail(400, 'Invalid status.');
  if (body.status === 'confirmed' && b.kind === 'booking') {
    const clash = db.bookings.some((x) => x.id !== b.id && x.listingId === b.listingId && x.kind === 'booking' && x.status === 'confirmed' && b.checkIn < x.checkOut && b.checkOut > x.checkIn);
    if (clash) return fail(409, 'Another confirmed booking overlaps these dates.');
  }
  b.status = body.status; save(); return ok(withBookingInfo(db, b));
});

// ADMIN
route('GET', '/admin/stats', ['admin'], ({ db }) => {
  const biz = db.users.filter((u) => u.role === 'business');
  return ok({
    users: db.users.filter((u) => u.role === 'user').length,
    businesses: biz.filter((b) => b.status === 'approved').length,
    pendingBusinesses: biz.filter((b) => b.status === 'pending').length,
    listings: db.listings.length,
    bookings: db.bookings.length,
    revenueUSD: sumUSD(db, db.bookings),
    pending: biz.filter((b) => b.status === 'pending').map(safe),
    listingsByCity: Object.entries(db.listings.reduce((m, l) => ({ ...m, [l.city]: (m[l.city] || 0) + 1 }), {})).map(([city, count]) => ({ city, count })),
    unreadMessages: db.messages.length,
  });
});
route('GET', '/admin/businesses', ['admin'], ({ db, query }) => {
  let list = db.users.filter((u) => u.role === 'business');
  if (query.status) list = list.filter((u) => u.status === query.status);
  return ok(list.map((u) => ({ ...safe(u), listings: db.listings.filter((l) => l.businessId === u.id).length })));
});
route('PATCH', '/admin/businesses/:id', ['admin'], ({ db, params, body }) => {
  const u = db.users.find((x) => x.id === params.id && x.role === 'business');
  if (!u) return fail(404, 'Business not found.');
  if (!['approved', 'rejected', 'suspended', 'pending'].includes(body?.status)) return fail(400, 'Invalid status.');
  u.status = body.status; save(); return ok(safe(u));
});
route('GET', '/admin/users', ['admin'], ({ db }) =>
  ok(db.users.filter((u) => u.role === 'user').map((u) => ({ ...safe(u), bookings: db.bookings.filter((b) => b.userId === u.id).length }))));
route('PATCH', '/admin/users/:id', ['admin'], ({ db, params, body }) => {
  const u = db.users.find((x) => x.id === params.id && x.role === 'user');
  if (!u) return fail(404, 'User not found.');
  if (!['active', 'blocked'].includes(body?.status)) return fail(400, 'Invalid status.');
  u.status = body.status; save(); return ok(safe(u));
});
route('GET', '/admin/listings', ['admin'], ({ db }) => ok(db.listings.map((l) => withBusiness(db, l))));
route('PATCH', '/admin/listings/:id', ['admin'], ({ db, params, body }) => {
  const l = db.listings.find((x) => x.id === params.id);
  if (!l) return fail(404, 'Listing not found.');
  if (!['published', 'hidden', 'blocked'].includes(body?.status)) return fail(400, 'Invalid status.');
  if (body.featured !== undefined) l.featured = !!body.featured;
  l.status = body.status; save(); return ok(l);
});
route('DELETE', '/admin/listings/:id', ['admin'], ({ db, params }) => {
  db.listings = db.listings.filter((x) => x.id !== params.id); save(); return ok({ ok: true });
});
route('GET', '/admin/bookings', ['admin'], ({ db }) => ok(db.bookings.map((b) => withBookingInfo(db, b)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
route('GET', '/admin/messages', ['admin'], ({ db }) => ok(db.messages));

// ADMIN: round city cards + currency rates (only the website admin can change these)
const cleanCity = (d) => ({ name: String(d.name || '').trim(), image: d.image || '' });
route('POST', '/admin/cities', ['admin'], ({ db, body }) => {
  const c = cleanCity(body || {});
  if (!c.name) return fail(400, 'City name is required.');
  if (db.cities.some((x) => x.name.toLowerCase() === c.name.toLowerCase())) return fail(409, 'This city already exists.');
  if (c.image.length > 600000) return fail(400, 'Photo is too large.');
  const city = { id: uid('c'), ...c }; db.cities.push(city); save(); return ok(city, 201);
});
route('PUT', '/admin/cities/:id', ['admin'], ({ db, params, body }) => {
  const city = db.cities.find((x) => x.id === params.id);
  if (!city) return fail(404, 'City not found.');
  const c = cleanCity(body || {});
  if (!c.name) return fail(400, 'City name is required.');
  if (db.cities.some((x) => x.id !== city.id && x.name.toLowerCase() === c.name.toLowerCase())) return fail(409, 'This city already exists.');
  if (c.image.length > 600000) return fail(400, 'Photo is too large.');
  if (c.name !== city.name) db.listings.forEach((l) => { if (l.city === city.name) l.city = c.name; });
  Object.assign(city, c); save(); return ok(city);
});
route('DELETE', '/admin/cities/:id', ['admin'], ({ db, params }) => {
  const city = db.cities.find((x) => x.id === params.id);
  if (!city) return fail(404, 'City not found.');
  const n = db.listings.filter((l) => l.city === city.name).length;
  if (n) return fail(409, `${n} listing(s) still use ${city.name}. Move or delete them first.`);
  db.cities = db.cities.filter((x) => x.id !== city.id); save(); return ok({ ok: true });
});
const adminSettings = (db) => ({ mode: db.settings.mode, manualRates: db.settings.rates, autoRates: db.settings.autoRates, autoUpdatedAt: db.settings.autoUpdatedAt, updatedAt: db.settings.updatedAt, rates: effRates(db), currencies: CURRENCIES });
route('GET', '/admin/settings', ['admin'], ({ db }) => ok(adminSettings(db)));
route('PUT', '/admin/settings', ['admin'], ({ db, body }) => {
  const { mode, rates } = body || {};
  if (mode && !['manual', 'auto'].includes(mode)) return fail(400, 'Mode must be manual or auto.');
  if (rates) {
    const eur = Number(rates.EUR), usd = Number(rates.USD);
    if (!(eur > 0) || !(usd > 0)) return fail(400, 'Rates must be numbers greater than 0.');
    db.settings.rates = { DZD: 1, EUR: eur, USD: usd };
  }
  if (mode) db.settings.mode = mode;
  db.settings.updatedAt = today(); save();
  return ok(adminSettings(db));
});
// Real backend: call your bank / exchange-rate API here and store the result in autoRates (ideally on a daily schedule too).
route('POST', '/admin/settings/refresh', ['admin'], ({ db }) => {
  const j = (v) => Math.round(v * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100;
  db.settings.autoRates = { DZD: 1, EUR: j(db.settings.autoRates.EUR), USD: j(db.settings.autoRates.USD) };
  db.settings.autoUpdatedAt = today(); save();
  return ok(adminSettings(db));
});

// ---------- dispatcher
export function handleMock({ method, path, body, params: query, token }) {
  const db = load();
  const user = userFromToken(db, token);
  for (const r of route_list()) {
    if (r.method !== method) continue;
    const m = path.match(r.re);
    if (!m) continue;
    if (r.roles) {
      if (!user) return fail(401, 'Please log in.');
      if (!r.roles.includes(user.role)) return fail(403, 'You are not allowed to do this.');
    }
    const params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    try { return r.handler({ db, user, params, query, body }); }
    catch (e) { console.error(e); return fail(500, 'Mock server error.'); }
  }
  return fail(404, `No route for ${method} ${path}`);
}
const route_list = () => routes;
