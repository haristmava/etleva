
import axios from 'axios'
import type {
  Category,
  Order,
  OrderStatus,
  Product,
  User,
} from '../types'

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  id: string
  orderId: string
  amount: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  method: 'SIMULATOR'
  transactionReference: string | null
  failureReason: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

// ============================================
// API CLIENT
// ============================================

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    'VITE_API_URL is required in production. Set it to the backend URL ending in /api.'
  )
}

const normalizeApiBaseUrl = (value: string | undefined) => {
  if (!value) return 'http://localhost:5000/api'

  const withoutTrailingSlash = value.replace(/\/+$/, '')

  if (/\/api\/api$/i.test(withoutTrailingSlash)) {
    throw new Error('VITE_API_URL must not contain a duplicated /api path.')
  }

  const baseUrl = /\/api$/i.test(withoutTrailingSlash)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`

  let parsedUrl: URL

  try {
    parsedUrl = new URL(baseUrl)
  } catch {
    throw new Error('VITE_API_URL must be an absolute backend URL.')
  }

  if (
    !['http:', 'https:'].includes(parsedUrl.protocol) ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error('VITE_API_URL must be an HTTP(S) API base URL without query or hash.')
  }

  return baseUrl
}

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(configuredApiUrl),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('etleva-token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: unknown) => Promise.reject(error)
)

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      localStorage.removeItem('etleva-token')
      localStorage.removeItem('etleva-user')

      window.dispatchEvent(
        new Event('etleva:unauthorized')
      )
    }

    return Promise.reject(error)
  }
)

// ============================================
// ERROR HANDLING
// ============================================

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Could not reach ETLEVA. Check your connection and try again.'
    }

    const message = error.response.data?.message

    if (typeof message === 'string') {
      return message
    }

    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your information.'

      case 401:
        return 'Your session has expired. Please sign in again.'

      case 403:
        return 'You do not have permission to perform this action.'

      case 404:
        return 'The requested resource could not be found.'

      case 409:
        return 'This request conflicts with the current data.'

      case 422:
        return 'Some information is invalid. Please check and try again.'

      default:
        if (error.response.status >= 500) {
          return 'The server could not complete the request. Please try again.'
        }
    }
  }

  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

// ============================================
// SHOP API
// ============================================

export const shopApi = {
  // ------------------------------------------
  // PRODUCTS
  // ------------------------------------------

  products: async (
    params: Record<string, string | number | boolean | undefined>
  ) => {
    const response = await api.get<{
      data: {
        products: Product[]
        pagination: {
          totalProducts: number
          currentPage: number
          totalPages: number
          limit: number
        }
      }
    }>('/products', { params })

    return response.data.data
  },

  product: async (id: string): Promise<Product> => {
    const response = await api.get<{
      data: { product: Product }
    }>(`/products/${id}`)

    return response.data.data.product
  },

  // ------------------------------------------
  // CATEGORIES
  // ------------------------------------------

  categories: async (): Promise<Category[]> => {
    const response = await api.get<{
      data: { categories: Category[] }
    }>('/categories')

    return response.data.data.categories
  },

  // ------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------

  login: async (email: string, password: string) => {
    const response = await api.post<{
      data: {
        token: string
        user: User
      }
    }>('/auth/login', {
      email,
      password,
    })

    return response.data.data
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    const response = await api.post<{
      data: { user: User }
    }>('/auth/register', {
      name,
      email,
      password,
    })

    return response.data.data.user
  },

  me: async (): Promise<User> => {
    const response = await api.get<{
      data: { user: User }
    }>('/auth/me')

    return response.data.data.user
  },

  updateProfile: async (
    name: string,
    email: string
  ): Promise<User> => {
    const response = await api.put<{
      data: { user: User }
    }>('/auth/me', {
      name,
      email,
    })

    return response.data.data.user
  },

  // ------------------------------------------
  // ORDERS
  // ------------------------------------------

  createOrder: async (
    shippingAddress: string,
    items: {
      productId: string
      quantity: number
    }[]
  ): Promise<Order> => {
    const response = await api.post<{
      data: { order: Order }
    }>('/orders', {
      shippingAddress,
      items,
    })

    return response.data.data.order
  },

  myOrders: async (): Promise<Order[]> => {
    const response = await api.get<{
      data: { orders: Order[] }
    }>('/orders/my-orders')

    return response.data.data.orders
  },

  myOrder: async (id: string): Promise<Order> => {
    const response = await api.get<{
      data: { order: Order }
    }>(`/orders/my-orders/${id}`)

    return response.data.data.order
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.patch<{
      data: { order: Order }
    }>(`/orders/my-orders/${id}/cancel`)

    return response.data.data.order
  },

  // ------------------------------------------
  // PAYMENTS
  // ------------------------------------------

  createPayment: async (orderId: string): Promise<Payment> => {
    const response = await api.post<{
      data: { payment: Payment }
    }>('/payments', {
      orderId,
    })

    return response.data.data.payment
  },

  processPayment: async (
    paymentId: string
  ): Promise<Payment> => {
    const response = await api.post<{
      data: { payment: Payment }
    }>(`/payments/${paymentId}/process`)

    return response.data.data.payment
  },
}

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  // ------------------------------------------
  // DASHBOARD
  // ------------------------------------------

  stats: async () => {
    const response = await api.get<{
      data: {
        stats: Record<string, number | string>
      }
    }>('/admin/dashboard/stats')

    return response.data.data.stats
  },

  recentOrders: async (): Promise<Order[]> => {
    const response = await api.get<{
      data: { orders: Order[] }
    }>('/admin/dashboard/recent-orders')

    return response.data.data.orders
  },

  // ------------------------------------------
  // PRODUCTS
  // ------------------------------------------

  products: async (
    params: Record<string, string | number | boolean | undefined>
  ) => {
    return shopApi.products(params)
  },

  saveProduct: async (
    id: string | undefined,
    data: Record<string, unknown>
  ): Promise<Product> => {
    const response = await (
      id
        ? api.put<{ data: { product: Product } }>(
            `/products/${id}`,
            data
          )
        : api.post<{ data: { product: Product } }>(
            '/products',
            data
          )
    )

    return response.data.data.product
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`)
  },

  // ------------------------------------------
  // CATEGORIES
  // ------------------------------------------

  saveCategory: async (
    id: string | undefined,
    data: {
      name: string
      slug: string
    }
  ): Promise<Category> => {
    const response = await (
      id
        ? api.put<{ data: { category: Category } }>(
            `/categories/${id}`,
            data
          )
        : api.post<{ data: { category: Category } }>(
            '/categories',
            data
          )
    )

    return response.data.data.category
  },

  deleteCategory: async (id: string) => {
    return api.delete(`/categories/${id}`)
  },

  // ------------------------------------------
  // ORDER MANAGEMENT
  // ------------------------------------------


orders: async (
  page: number,
  status: string,
  search = '',
  limit = 20,
) => {
  const response = await api.get<{
    status: string
    results: number
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
    data: {
      orders: Order[]
    }
  }>('/orders', {
    params: {
      page,
      limit,
      status: status || undefined,
      search: search.trim() || undefined,
    },
  })

  return {
    ...response.data.data,
    pagination: response.data.pagination,
  }
},


  order: async (id: string): Promise<Order> => {
    const response = await api.get<{
      data: { order: Order }
    }>(`/orders/${id}`)

    return response.data.data.order
  },

  updateOrder: async (
    id: string,
    status: OrderStatus
  ): Promise<Order> => {
    const response = await api.patch<{
      data: { order: Order }
    }>(`/orders/${id}/status`, {
      status,
    })

    return response.data.data.order
  },
}
