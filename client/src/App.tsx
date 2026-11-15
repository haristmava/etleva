import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AnnouncementBar from './components/layout/AnnouncementBar'

import Hero from './components/home/Hero'
import Categories from './components/home/Categories'
import FeaturedProducts from './components/home/FeaturedProducts'
import FeaturedCollection from './components/home/FeaturedCollection'
import BrandStory from './components/home/BrandStory'
import Newsletter from './components/home/Newsletter'
import ProductsPage from './pages/ProductsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AuthPage from './pages/AuthPage'
import { AccountPage, AccountOrderPage } from './pages/AccountPage'
import AdminPage, { AdminOrderPage } from './pages/AdminPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import { useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'

function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <FeaturedCollection />
      <BrandStory />
      <Newsletter />
    </>
  )
}



function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const requireUser = (element: ReactNode, admin = false) => {
    if (loading) return <main className="min-h-[60vh] p-12 text-center text-sm text-stone-500">Loading your account…</main>
    if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
    if (admin && user.role !== 'ADMIN') return <Navigate to="/account" replace />
    if (!admin && user.role === 'ADMIN') return <Navigate to="/admin" replace />
    return element
  }
  return (
    <>
      <AnnouncementBar />
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage key={location.search} />} />
        <Route path="/products/:id" element={<ProductDetailsPage key={location.pathname} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/account'} replace /> : <AuthPage mode="login" />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/account'} replace /> : <AuthPage mode="register" />} />
        <Route path="/account" element={requireUser(<AccountPage />)} />
        <Route path="/account/orders/:id" element={requireUser(<AccountOrderPage />)} />
        <Route path="/admin" element={requireUser(<AdminPage />, true)} />
        <Route
  path="/admin/orders"
  element={requireUser(<AdminOrdersPage />, true)}
/>
        <Route path="/admin/orders/:id" element={requireUser(<AdminOrderPage />, true)} />
        <Route path="*" element={<main className="mx-auto min-h-[55vh] max-w-3xl px-6 py-24 text-center"><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-light">Page not found</h1><a href="/" className="mt-6 inline-block text-sm underline">Return home</a></main>} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
