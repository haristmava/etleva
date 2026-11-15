export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number | string
  stock: number
  image: string | null
  isNew: boolean
  isActive: boolean
  categoryId: string
  category: Category
  createdAt?: string
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number | string
  product: Pick<Product, 'id' | 'name' | 'slug' | 'image'>
}

export interface Order {
  id: string
  total: number | string
  status: OrderStatus
  hasSuccessfulPayment?: boolean
  shippingAddress: string
  createdAt: string
  items: OrderItem[]
  user?: { id: string; name: string; email: string }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  createdAt?: string
}
