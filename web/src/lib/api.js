const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const TOKEN_KEY = 'amora_admin_token'
const USER_KEY = 'amora_admin_user'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveAdminSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('amora_local_admin')
}

export function getSavedAdminUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, token, multipart = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (!multipart) headers['Content-Type'] = 'application/json'
  const auth = token ?? getAdminToken()
  if (auth) headers.Authorization = `Bearer ${auth}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: multipart ? body : body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearAdminSession()
      window.dispatchEvent(new Event('amora-admin-auth-lost'))
    }
    const message =
      data.message ||
      (data.errors && Object.values(data.errors).flat()[0]) ||
      `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export const api = {
  adminLogin: (email, password) =>
    request('/admin/login', { method: 'POST', body: { email, password } }),
  adminMe: () => request('/admin/me'),
  adminLogout: () => request('/admin/logout', { method: 'POST' }),
  dashboard: () => request('/admin/dashboard'),
  customers: () => request('/admin/customers'),

  // Products
  products: () => request('/admin/products'),
  getProduct: (id) => request(`/admin/products/${id}`),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PATCH', body: data }),
  duplicateProduct: (id) => request(`/admin/products/${id}/duplicate`, { method: 'POST' }),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return request('/admin/products/upload-image', {
      method: 'POST',
      body: formData,
      multipart: true,
    })
  },

  orders: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/admin/orders${q ? `?${q}` : ''}`)
  },
  inventory: () => request('/admin/inventory'),
}
