
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Product } from '../types'

export interface CartItem {
  product: Product
  quantity: number
}

function isStoredCart(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false
  return value.every((item) => {
    if (!item || typeof item !== 'object' || !('product' in item) || !('quantity' in item)) return false
    const product = item.product
    return Boolean(product && typeof product === 'object' && 'id' in product && typeof product.id === 'string' && 'stock' in product && typeof product.stock === 'number' && 'category' in product && typeof product.category === 'object' && product.category !== null && 'name' in product.category && typeof product.category.name === 'string' && typeof item.quantity === 'number' && item.quantity > 0)
  })
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('etleva-cart')
      const parsed: unknown = savedCart ? JSON.parse(savedCart) : []
      return isStoredCart(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('etleva-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.isActive || product.stock < 1 || !Number.isInteger(quantity) || quantity < 1) return

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, product, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        )
      }

      return [...currentItems, { product, quantity: Math.min(product.stock, quantity) }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    )
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return

    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) return [item]
        if (item.product.stock < 1) return []
        return [{ ...item, quantity: Math.min(item.product.stock, quantity) }]
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
