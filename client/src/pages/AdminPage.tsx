
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Trash2,
  Users,
  X,
  Pencil,
  ArrowLeft,
CalendarDays,
Circle,
MapPin,
ShoppingBag,
UserRound,
XCircle,
} from 'lucide-react'

import { adminApi, getErrorMessage, shopApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import OrderStatusControl from '../components/admin/OrderStatusControl'
import AdminPagination from '../components/admin/AdminPagination'
import type { Category, Order, OrderStatus, Product } from '../types'



const price = (value: string | number) =>
  `€${Number(value).toFixed(2)}`
const currentYear = new Date().getFullYear()

const initialProduct = {
  name: '',
  slug: '',
  description: '',
  price: '',
  stock: '0',
  image: '',
  isNew: false,
  isActive: true,
  categoryId: '',
}

const inputClass =
  'mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 disabled:cursor-not-allowed disabled:bg-stone-100'

const cardClass =
  'rounded-2xl border border-stone-200/80 bg-white shadow-sm'

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    PROCESSING: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    SHIPPED: 'bg-violet-50 text-violet-700 ring-violet-600/10',
    DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    CANCELLED: 'bg-red-50 text-red-700 ring-red-600/10',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${styles[status]}`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accent,
}: {
  label: string
  value: string | number
  icon: typeof Package
  description: string
  accent: string
}) {
  return (
    <article className={`${cardClass} group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-3 truncate text-3xl font-semibold tracking-tight text-stone-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 transition duration-300 group-hover:scale-110 ${accent}`}>
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
        <Activity size={14} />
        {description}
      </div>
    </article>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm text-stone-500">{description}</p>
      )}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Package
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="rounded-2xl bg-stone-100 p-4 text-stone-400">
        <Icon size={25} />
      </div>
      <p className="mt-4 text-sm font-semibold text-stone-700">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-stone-400">
        {description}
      </p>
    </div>
  )
}

export default function AdminPage() {
  const { signOut } = useAuth()

  const [stats, setStats] = useState<Record<string, number | string> | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productTotal, setProductTotal] = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(1)
  const [catalogPage, setCatalogPage] = useState(1)
  const [catalogPageSize, setCatalogPageSize] = useState(20)
  const [catalogCategory, setCatalogCategory] = useState('')
  const [catalogStock, setCatalogStock] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  const [catalogVisibility, setCatalogVisibility] = useState<'all' | 'active' | 'inactive'>('all')
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [catalogReloadKey, setCatalogReloadKey] = useState(0)
  const catalogRequestId = useRef(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState(initialProduct)
  const [formOpen, setFormOpen] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [categoryName, setCategoryName] = useState('')


  const [savingProduct, setSavingProduct] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [busyProductId, setBusyProductId] = useState<string | null>(null)
  const [busyCategoryId, setBusyCategoryId] = useState<string | null>(null)
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    return Promise.all([
        adminApi.stats(),
        shopApi.categories(),
        adminApi.orders(1,''),
    ])
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [s, c, o] = await loadDashboard()
      setStats(s)
      setCategories(c)
      setOrders(o.orders)
      setError('')
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [loadDashboard])

  useEffect(() => {
    let active = true
    loadDashboard()
      .then(([s, c, o]) => {
        if (!active) return
        setStats(s)
        setCategories(c)
        setOrders(o.orders)
        setError('')
      })
      .catch((e: unknown) => {
        if (active) setError(getErrorMessage(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [loadDashboard])

  useEffect(() => {
    const requestId = ++catalogRequestId.current
    const timer = window.setTimeout(() => {
      setCatalogLoading(true)
      setCatalogError('')
      void adminApi.products({
        page: catalogPage,
        limit: catalogPageSize,
        search: productSearch.trim() || undefined,
        categoryId: catalogCategory || undefined,
        inStock: catalogStock === 'all' ? undefined : catalogStock === 'in-stock',
        isActive: catalogVisibility === 'all' ? undefined : catalogVisibility === 'active',
        sortBy: 'createdAt',
        order: 'desc',
      }).then((result) => {
        if (requestId !== catalogRequestId.current) return
        const totalPages = Math.max(1, result.pagination.totalPages)
        setProductTotal(result.pagination.totalProducts)
        setProductTotalPages(totalPages)
        if (catalogPage > totalPages) {
          setCatalogPage(totalPages)
          setProducts([])
          return
        }
        setProducts(result.products)
      }).catch((reason: unknown) => {
        if (requestId === catalogRequestId.current) {
          setCatalogError(getErrorMessage(reason))
          setProducts([])
        }
      }).finally(() => {
        if (requestId === catalogRequestId.current) setCatalogLoading(false)
      })
    }, productSearch ? 250 : 0)

    return () => {
      window.clearTimeout(timer)
      if (requestId === catalogRequestId.current) catalogRequestId.current += 1
    }
  }, [catalogPage, catalogPageSize, catalogCategory, catalogStock, catalogVisibility, productSearch, catalogReloadKey])

  function showNotice(message: string) {
    setNotice(message)
    setError('')
  }

  function closeProductForm() {
    setEditing(null)
    setFormOpen(false)
    setProductForm(initialProduct)
  }

  function edit(product?: Product) {
    setEditing(product || null)
    setFormOpen(true)
    setNotice('')
    setError('')

    setProductForm(
      product
        ? {
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            image: product.image || '',
            isNew: product.isNew,
            isActive: product.isActive,
            categoryId: product.categoryId,
          }
        : {
            ...initialProduct,
            categoryId: categories[0]?.id || '',
          },
    )
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProduct(true)
    setError('')

    try {
      await adminApi.saveProduct(editing?.id, {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image: productForm.image || null,
      })

      showNotice(
        editing
          ? 'Product updated successfully.'
          : 'Product created successfully.',
      )

      if (!editing) setCatalogPage(1)
      setCatalogReloadKey((current) => current + 1)
      closeProductForm()
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSavingProduct(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return

    setBusyProductId(product.id)
    setError('')

    try {
      await adminApi.deleteProduct(product.id)
      showNotice('Product deleted successfully.')
      setCatalogReloadKey((current) => current + 1)
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyProductId(null)
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = categoryName.trim()
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    setSavingCategory(true)
    setError('')

    try {
      await adminApi.saveCategory(undefined, { name, slug })
      setCategoryName('')
      showNotice('Category created successfully.')
      setCatalogReloadKey((current) => current + 1)
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSavingCategory(false)
    }
  }

  async function renameCategory(category: Category) {
    const name = window.prompt('Category name', category.name)

    if (!name || !name.trim() || name.trim() === category.name) return

    const cleanName = name.trim()
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    setBusyCategoryId(category.id)
    setError('')

    try {
      await adminApi.saveCategory(category.id, {
        name: cleanName,
        slug,
      })

      showNotice('Category updated successfully.')
      setCatalogReloadKey((current) => current + 1)
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyCategoryId(null)
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return

    setBusyCategoryId(category.id)
    setError('')

    try {
      await adminApi.deleteCategory(category.id)
      showNotice('Category deleted successfully.')
      if (catalogCategory === category.id) {
        setCatalogCategory('')
        setCatalogPage(1)
      }
      setCatalogReloadKey((current) => current + 1)
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyCategoryId(null)
    }
  }

  async function updateStatus(order: Order, status: OrderStatus) {
    setBusyOrderId(order.id)
    setError('')

    try {
      const updatedOrder = await adminApi.updateOrder(order.id, status)
      setOrders((current) => current.map((item) =>
        item.id === order.id ? { ...item, status: updatedOrder.status } : item,
      ))
      showNotice('Order status updated successfully.')
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusyOrderId(null)
    }
  }

  const pendingCount = orders.filter(
    (order) => order.status === 'PENDING',
  ).length

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-stone-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-stone-100 px-7 py-7">
            <Link to="/" className="text-2xl font-semibold tracking-[0.18em]">
              ETLEVA
            </Link>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Administration
            </p>
          </div>

          <div className="px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Workspace
            </p>

            <nav className="space-y-1">
              <a
                href="#overview"
                className="flex items-center gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-sm"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>

              <a
                href="#products"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <Package size={18} />
                Products
              </a>

              <a
                href="#categories"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <Tags size={18} />
                Categories
              </a>

              <a
                href="#orders"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <ShoppingCart size={18} />
                Orders
                {pendingCount > 0 && (
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </a>
            </nav>
          </div>

          <div className="mt-auto border-t border-stone-100 p-5">
            <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                <ShieldCheck size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Administrator</p>
                <p className="text-xs text-stone-500">Store management</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <button
              onClick={signOut}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-500 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">

          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-xs font-medium text-stone-400">
                  ETLEVA / ADMINISTRATION
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight">
                  Store dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="hidden items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm transition hover:border-stone-400 hover:bg-stone-50 sm:flex"
                >
                  View storefront
                  <ExternalLink size={14} />
                </Link>

                <button
                  onClick={() => { void refresh(); setCatalogReloadKey((current) => current + 1) }}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? 'animate-spin' : ''}
                  />
                  <span className="hidden sm:inline">
                    {loading ? 'Refreshing' : 'Refresh'}
                  </span>
                </button>
              </div>
            </div>

            <nav className="flex gap-5 overflow-x-auto border-t border-stone-100 px-5 py-3 lg:hidden">
              <a href="#overview" className="whitespace-nowrap text-sm font-medium">Overview</a>
              <a href="#products" className="whitespace-nowrap text-sm text-stone-500">Products</a>
              <a href="#categories" className="whitespace-nowrap text-sm text-stone-500">Categories</a>
              <a href="#orders" className="whitespace-nowrap text-sm text-stone-500">Orders</a>
              <button onClick={signOut} className="whitespace-nowrap text-sm text-red-700">Sign out</button>
            </nav>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-8 p-5 md:p-8">

            {/* Notifications */}
            {error && (
              <div
                role="alert"
                className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <div>
                  <p className="font-semibold">Something went wrong</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button
                  onClick={() => void refresh()}
                  className="shrink-0 font-semibold underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  {notice}
                </span>
                <button
                  onClick={() => setNotice('')}
                  aria-label="Dismiss notification"
                  className="rounded-lg p-1 transition hover:bg-emerald-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Overview */}
            <section id="overview" className="scroll-mt-28">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    Overview
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Welcome back.
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Here is what is happening with your store.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Store management
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  label="Total revenue"
                  value={stats ? price(stats.totalRevenue || 0) : '—'}
                  icon={CircleDollarSign}
                  description="Revenue recorded by the store"
                  accent="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                  label="Total orders"
                  value={stats?.totalOrders ?? '—'}
                  icon={ShoppingCart}
                  description="All orders in the system"
                  accent="bg-blue-50 text-blue-700"
                />

                <StatCard
                  label="Total products"
                  value={stats?.totalProducts ?? '—'}
                  icon={Package}
                  description="Products in your catalogue"
                  accent="bg-violet-50 text-violet-700"
                />

                <StatCard
                  label="Customers"
                  value={stats?.totalUsers ?? '—'}
                  icon={Users}
                  description="Registered store customers"
                  accent="bg-orange-50 text-orange-700"
                />

                <StatCard
                  label="Categories"
                  value={stats?.totalCategories ?? '—'}
                  icon={Tags}
                  description="Available product categories"
                  accent="bg-pink-50 text-pink-700"
                />

                <StatCard
                  label="Pending orders"
                  value={stats?.pendingOrders ?? '—'}
                  icon={Clock3}
                  description="Orders waiting for processing"
                  accent="bg-amber-50 text-amber-700"
                />
              </div>
            </section>

            {/* Products */}
            <section
              id="products"
              className={`${cardClass} scroll-mt-28 overflow-hidden`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 p-5 md:p-7">
                <SectionHeading
                  eyebrow="Catalogue management"
                  title="Products"
                  description="Manage your store inventory and product details."
                />

                <button
                  onClick={() => edit()}
                  className="flex items-center gap-2 rounded-xl bg-[#a96342] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#8e4e32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/40 focus-visible:ring-offset-2 active:translate-y-0"
                >
                  <Plus size={17} />
                  Add product
                </button>
              </div>

              {/* Product form */}
              {formOpen && (
                <form
                  onSubmit={saveProduct}
                  className="m-5 grid gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 md:m-7 md:grid-cols-2 md:p-7"
                >
                  <div className="flex items-center justify-between md:col-span-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Product editor
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">
                        {editing ? 'Edit product' : 'Create new product'}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={closeProductForm}
                      aria-label="Close form"
                      className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-200"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <label className="text-xs font-semibold text-stone-600">
                    Product name
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      className={inputClass}
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          name: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, ''),
                        })
                      }
                      placeholder="Enter product name"
                    />
                  </label>

                  <label className="text-xs font-semibold text-stone-600">
                    URL slug
                    <input
                      required
                      className={inputClass}
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          slug: e.target.value,
                        })
                      }
                      placeholder="product-url"
                    />
                  </label>

                  <label className="text-xs font-semibold text-stone-600">
                    Price (€)
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <label className="text-xs font-semibold text-stone-600">
                    Stock quantity
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      className={inputClass}
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-stone-600">
                    Category
                    <select
                      required
                      disabled={categories.length === 0}
                      className={inputClass}
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <span className="mt-1 block text-xs text-red-600">
                        Create a category before adding a product.
                      </span>
                    )}
                  </label>

                  <label className="text-xs font-semibold text-stone-600">
                    Image URL
                    <input
                      type="url"
                      className={inputClass}
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </label>

                  <label className="text-xs font-semibold text-stone-600 md:col-span-2">
                    Description
                    <textarea
                      required
                      minLength={10}
                      rows={4}
                      className={inputClass}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the product..."
                    />
                  </label>

                  <div className="flex flex-wrap gap-6 md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            isNew: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-stone-900"
                      />
                      New arrival
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={productForm.isActive}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            isActive: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-stone-900"
                      />
                      Active product
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-stone-200 pt-5 md:col-span-2">
                    <button
                      type="submit"
                      disabled={savingProduct || categories.length === 0}
                      className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProduct && (
                        <RefreshCw size={15} className="animate-spin" />
                      )}
                      {savingProduct
                        ? 'Saving...'
                        : editing
                          ? 'Save changes'
                          : 'Create product'}
                    </button>

                    <button
                      type="button"
                      onClick={closeProductForm}
                      disabled={savingProduct}
                      className="rounded-xl border border-stone-300 px-6 py-3 text-sm transition hover:bg-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Product toolbar */}
              <div className="grid gap-3 border-b border-stone-100 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-6">
                <div className="relative sm:col-span-2">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={productSearch}
                    maxLength={100}
                    onChange={(e) => { setProductSearch(e.target.value); setCatalogPage(1) }}
                    placeholder="Search by product name"
                    aria-label="Search products by name"
                    className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
                  />
                </div>
                <label className="relative">
                  <span className="sr-only">Filter products by category</span>
                  <select
                    value={catalogCategory}
                    onChange={(event) => { setCatalogCategory(event.target.value); setCatalogPage(1) }}
                    className="h-11 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/70 px-3.5 pr-9 text-sm text-stone-700 outline-none transition focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <ChevronRight size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-stone-400" />
                </label>
                <label className="relative">
                  <span className="sr-only">Filter products by stock</span>
                  <select
                    value={catalogStock}
                    onChange={(event) => { setCatalogStock(event.target.value as typeof catalogStock); setCatalogPage(1) }}
                    className="h-11 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/70 px-3.5 pr-9 text-sm text-stone-700 outline-none transition focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
                  >
                    <option value="all">All stock levels</option>
                    <option value="in-stock">In stock</option>
                    <option value="out-of-stock">Out of stock</option>
                  </select>
                  <ChevronRight size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-stone-400" />
                </label>
                <label className="relative">
                  <span className="sr-only">Filter products by active status</span>
                  <select
                    value={catalogVisibility}
                    onChange={(event) => { setCatalogVisibility(event.target.value as typeof catalogVisibility); setCatalogPage(1) }}
                    className="h-11 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/70 px-3.5 pr-9 text-sm text-stone-700 outline-none transition focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
                  >
                    <option value="all">All visibility</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronRight size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-stone-400" />
                </label>
                <div className="flex items-center justify-end gap-2 text-xs text-stone-500 sm:col-span-2 lg:col-span-3">
                  {catalogLoading && <RefreshCw size={13} className="animate-spin text-[#a96342]" />}
                  <span>{productTotal.toLocaleString()} products</span>
                </div>
              </div>

              {catalogError && (
                <div role="alert" className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 md:mx-6">
                  <span>{catalogError}</span>
                  <button type="button" onClick={() => setCatalogReloadKey((value) => value + 1)} className="font-semibold underline underline-offset-2">Try again</button>
                </div>
              )}

              {/* Product table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-y border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase tracking-[.12em] text-stone-500">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors odd:bg-white even:bg-stone-50/45 hover:bg-[#fbf5f1]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition duration-300 hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-stone-400">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900">
                                {product.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-stone-400">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-stone-600">
                          {product.category.name}
                        </td>

                        <td className="px-4 py-3.5 font-semibold tabular-nums text-stone-900">
                          {price(product.price)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={
                              product.stock === 0
                              ? 'inline-flex rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700'
                                : product.stock < 5
                                  ? 'inline-flex rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700'
                                  : 'inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'
                            }
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                product.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>

                            {product.isNew && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                New
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => edit(product)}
                              disabled={busyProductId === product.id}
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg border border-stone-300 bg-white p-2 text-stone-600 transition hover:border-[#a96342] hover:bg-[#fbf5f1] hover:text-[#8e4e32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:opacity-50"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() => void deleteProduct(product)}
                              disabled={busyProductId === product.id}
                              aria-label={`Delete ${product.name}`}
                              className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:border-red-400 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50"
                            >
                              {busyProductId === product.id ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!catalogLoading && products.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          {catalogError ? null : <EmptyState icon={Package} title="No products found" description="Try another search or filter, or add a new product to your catalogue." />}
                        </td>
                      </tr>
                    )}
                    {catalogLoading && products.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-stone-500"><span className="inline-flex items-center gap-2"><RefreshCw size={15} className="animate-spin text-[#a96342]" />Loading products…</span></td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:hidden">
                {products.map((product) => (
                  <article key={product.id} className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-stone-300">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {product.image ? <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone-400"><Package size={19} /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-stone-900">{product.name}</h3>
                        <p className="mt-1 truncate text-xs text-stone-500">{product.category.name}</p>
                        <p className="mt-2 text-sm font-semibold tabular-nums text-stone-900">{price(product.price)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.stock === 0 ? 'bg-red-50 text-red-700' : product.stock < 5 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>{product.stock === 0 ? 'Out of stock' : product.stock < 5 ? `${product.stock} left` : `${product.stock} in stock`}</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => edit(product)} disabled={busyProductId === product.id} aria-label={`Edit ${product.name}`} className="rounded-lg border border-stone-300 p-2 text-stone-600 transition hover:border-[#a96342] hover:bg-[#fbf5f1] hover:text-[#854e37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:opacity-50"><Pencil size={15} /></button>
                        <button type="button" onClick={() => void deleteProduct(product)} disabled={busyProductId === product.id} aria-label={`Delete ${product.name}`} className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:border-red-400 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50">{busyProductId === product.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}</button>
                      </div>
                    </div>
                  </article>
                ))}
                {!catalogLoading && products.length === 0 && !catalogError && (
                  <div className="sm:col-span-2"><EmptyState icon={Package} title="No products found" description="Try another search or filter, or add a new product to your catalogue." /></div>
                )}
                {catalogLoading && products.length === 0 && <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-stone-500 sm:col-span-2"><RefreshCw size={15} className="animate-spin text-[#a96342]" />Loading products…</div>}
              </div>

              <AdminPagination
                page={catalogPage}
                pageSize={catalogPageSize}
                total={productTotal}
                totalPages={productTotalPages}
                itemLabel="products"
                onPageChange={setCatalogPage}
                onPageSizeChange={(value) => { setCatalogPageSize(value); setCatalogPage(1) }}
              />
            </section>

            {/* Categories and Orders */}
            <div className="grid items-start gap-6 xl:grid-cols-2">

              {/* Categories */}
              <section
                id="categories"
                className={`${cardClass} scroll-mt-28 p-5 md:p-7`}
              >
                <div className="flex items-center justify-between gap-4">
                  <SectionHeading
                    eyebrow="Catalogue structure"
                    title="Categories"
                    description="Organise your products into collections."
                  />

                  <div className="rounded-xl bg-stone-100 p-3 text-stone-600">
                    <Boxes size={20} />
                  </div>
                </div>

                <form onSubmit={addCategory} className="mt-6 flex gap-2">
                  <input
                    aria-label="New category name"
                    required
                    minLength={2}
                    maxLength={50}
                    className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
                    placeholder="Enter category name..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
                  >
                    {savingCategory ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    <span className="hidden sm:inline">
                      {savingCategory ? 'Adding' : 'Add'}
                    </span>
                  </button>
                </form>

                <div className="mt-5 divide-y divide-stone-100">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between gap-3 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-stone-100 p-2.5 text-stone-500">
                          <Tags size={17} />
                        </div>
                        <span className="truncate text-sm font-medium">
                          {category.name}
                        </span>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => void renameCategory(category)}
                          disabled={busyCategoryId === category.id}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => void deleteCategory(category)}
                          disabled={busyCategoryId === category.id}
                          aria-label={`Delete ${category.name}`}
                          className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {busyCategoryId === category.id ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <EmptyState
                      icon={Tags}
                      title="No categories yet"
                      description="Create your first category to organise your product catalogue."
                    />
                  )}
                </div>
              </section>


{/* Orders */}
<section
  id="orders"
  className={`${cardClass} scroll-mt-28 p-5 md:p-7`}
>
  <div className="flex flex-wrap items-center justify-between gap-4">
    <SectionHeading
      eyebrow="Order management"
      title="Recent orders"
      description="A quick overview of your latest customer orders."
    />

    <Link
      to="/admin/orders"
      className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-700"
    >
      View all orders
      <ChevronRight size={15} />
    </Link>
  </div>

  <div className="mt-5 divide-y divide-stone-100">
    {orders.slice(0, 5).map((order) => (
      <div key={order.id} className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/admin/orders/${order.id}`}
              className="inline-flex items-center text-sm font-semibold transition hover:text-stone-500"
            >
              #{order.id.slice(0, 8).toUpperCase()}
              <ChevronRight size={14} className="ml-1" />
            </Link>

            <p className="mt-1 truncate text-xs text-stone-400">
              {order.user?.name || 'Customer'}
            </p>
          </div>

          <p className="text-sm font-semibold tabular-nums">
            {price(order.total)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs text-stone-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <OrderStatusControl
            orderId={order.id}
            status={order.status}
            hasSuccessfulPayment={order.hasSuccessfulPayment === true}
            showCancellationInfo={false}
            onUpdated={(updatedStatus) => {
              setOrders((current) => current.map((item) =>
                item.id === order.id ? { ...item, status: updatedStatus } : item,
              ))
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            {nextStatus[order.status] && (
              <button
                disabled={busyOrderId === order.id}
                onClick={() =>
                  void updateStatus(
                    order,
                    nextStatus[order.status]!,
                  )
                }
                className="text-xs font-semibold text-stone-700 underline underline-offset-4 transition hover:text-stone-400 disabled:opacity-50"
              >
                {busyOrderId === order.id
                  ? 'Updating...'
                  : `Mark ${nextStatus[order.status]?.toLowerCase()}`}
              </button>
            )}

            {(order.status === 'PENDING' ||
              order.status === 'PROCESSING') && (
              <span className="inline-flex items-center gap-1.5">
                <button
                  disabled={busyOrderId === order.id || order.hasSuccessfulPayment === true}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Cancel this order and restore its stock?',
                      )
                    ) {
                      void updateStatus(order, 'CANCELLED')
                    }
                  }}
                  className="text-xs font-semibold text-red-600 underline underline-offset-4 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Cancel
                </button>
                {order.hasSuccessfulPayment && (
                  <span
                    role="img"
                    tabIndex={0}
                    title="Paid orders cannot be cancelled because refunds are not supported by the payment simulator."
                    aria-label="Paid orders cannot be cancelled because refunds are not supported by the payment simulator."
                    className="inline-flex rounded-sm text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                  >
                    <Info size={14} aria-hidden="true" />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    ))}

    {orders.length === 0 && (
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="New customer orders will appear here."
      />
    )}
  </div>

  {orders.length > 0 && (
    <div className="mt-4 border-t border-stone-100 pt-4">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
      >
        Open order management
        <ChevronRight size={15} />
      </Link>
    </div>
  )}
</section>
</div>


            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-6 text-xs text-stone-400">
              <p>© {currentYear} ETLEVA Administration</p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} />
                Secure admin workspace
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}


export function AdminOrderPage() {
  const { id } = useParams<{ id: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadOrder = useCallback(() => {
    if (!id) return Promise.reject(new Error('ID e porosisë mungon.'))
    return adminApi.order(id)
  }, [id])

  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      setOrder(await loadOrder())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nuk mund të ngarkoheshin detajet e porosisë.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loadOrder])

useEffect(() => {
  let active = true
  loadOrder()
    .then((data) => { if (active) setOrder(data) })
    .catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : 'Nuk mund të ngarkoheshin detajet e porosisë.')
    })
    .finally(() => { if (active) setLoading(false) })
  return () => { active = false }
}, [loadOrder])



  const timeline = [
    {
      status: 'PENDING',
      title: 'Porosia u pranua',
      description: 'Porosia është regjistruar në sistem.',
    },
    {
      status: 'PROCESSING',
      title: 'Në përpunim',
      description: 'Porosia është duke u përgatitur.',
    },
    {
      status: 'SHIPPED',
      title: 'U dërgua',
      description: 'Porosia është nisur për te klienti.',
    },
    {
      status: 'DELIVERED',
      title: 'U dorëzua',
      description: 'Porosia është dorëzuar me sukses.',
    },
  ]

  const currentStep = timeline.findIndex(
    (step) => step.status === order?.status,
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Duke ngarkuar porosinë...</span>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Kthehu te dashboard
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Porosia nuk u gjet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'Kjo porosi nuk ekziston ose nuk mund të hapet.'}
          </p>
          <button
            onClick={() => void fetchOrder()}
            className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Provo përsëri
          </button>
        </div>
      </div>
    )
  }

  const orderDate = new Date(order.createdAt)
  const validDate = !Number.isNaN(orderDate.getTime())

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/admin"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Kthehu te porositë
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Porosia #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge status={order.status} />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Detajet dhe informacionet e porosisë
          </p>
        </div>

        <button
  onClick={() => void fetchOrder(true)}
  disabled={refreshing}
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
>
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          Rifresko
        </button>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Totali i porosisë</p>
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            {price(order.total)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {order.items.length} produkte në porosi
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Data e porosisë</p>
            <div className="rounded-xl bg-blue-50 p-2.5">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-xl font-bold text-gray-900">
            {validDate
              ? orderDate.toLocaleDateString('sq-AL', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {validDate
              ? orderDate.toLocaleTimeString('sq-AL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Data nuk është e disponueshme'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Statusi aktual</p>
            <div className="rounded-xl bg-violet-50 p-2.5">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge status={order.status} />
          </div>
          <OrderStatusControl
            orderId={order.id}
            status={order.status}
            hasSuccessfulPayment={order.hasSuccessfulPayment === true}
            showCancellationInfo={false}
            onUpdated={(updatedStatus) => {
              setOrder((current) => current
                ? { ...current, status: updatedStatus }
                : current)
            }}
          />
          {order.hasSuccessfulPayment && order.status !== 'CANCELLED' && (
            <p role="note" className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-stone-500">
              <Info size={14} className="mt-0.5 shrink-0 text-stone-400" aria-hidden="true" />
              Paid orders cannot be cancelled because refunds are not supported by the payment simulator.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Gjendja aktuale e përpunimit
          </p>
        </div>
      </div>

      {/* Timeline */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900">
            Ecuria e porosisë
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ndiq statusin e porosisë nga pranimi deri në dorëzim.
          </p>
        </div>

        {order.status === 'CANCELLED' ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-800">Porosia është anuluar</p>
              <p className="mt-1 text-sm text-red-700">
                Kjo porosi nuk vazhdon më në procesin e dërgesës.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-4">
            {timeline.map((step, index) => {
              const completed = index < currentStep
              const active = index === currentStep

              return (
                <div key={step.status} className="relative">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? 'bg-emerald-100 text-emerald-600'
                          : active
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={21} />
                      ) : active ? (
                        <Clock3 size={21} />
                      ) : (
                        <Circle size={21} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          completed || active
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {completed ? 'Përfunduar' : active ? 'Aktualisht' : 'Në pritje'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-500">
                    {step.description}
                  </p>

                  {index < timeline.length - 1 && (
                    <div className="absolute right-0 top-5 hidden h-px w-5 bg-gray-200 sm:block xl:w-8" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Products */}
        <section className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-gray-900">Produktet e porosisë</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {order.items.length} artikuj
                </p>
              </div>
              <ShoppingBag className="h-5 w-5 text-gray-400" />
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-7 w-7 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Sasia: {item.quantity}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Çmimi për njësi: {price(item.unitPrice)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold text-gray-900">
                      {price(Number(item.unitPrice) * item.quantity)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Totali i produktit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Adresa e dërgesës</h2>
                <p className="text-xs text-gray-500">
                  Destinacioni i porosisë
                </p>
              </div>
            </div>

            <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {order.shippingAddress}
            </p>
          </div>
        </section>

        {/* Customer and summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <UserRound className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Klienti</h2>
                <p className="text-xs text-gray-500">
                  Informacionet e blerësit
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Emri
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {order.user?.name || 'Nuk është i disponueshëm'}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-gray-700">
                  {order.user?.email || 'Nuk është i disponueshëm'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-900">
              Përmbledhja e pagesës
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-gray-500">
                <span>Numri i produkteve</span>
                <span className="font-medium text-gray-900">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-gray-500">
                <span>Produkte gjithsej</span>
                <span className="font-medium text-gray-900">
                  {price(
                    order.items.reduce(
                      (sum, item) =>
                        sum + Number(item.unitPrice) * item.quantity,
                      0,
                    ),
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-900">
                    Totali
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {price(order.total)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
              Informacionet e pagesës dhe referenca e transaksionit nuk
              përfshihen në përgjigjen aktuale të API-së për këtë porosi.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
