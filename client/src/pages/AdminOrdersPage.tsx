
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Eye,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { adminApi, getErrorMessage } from '../services/api'
import type { Order, OrderStatus } from '../types'
import OrderStatusControl from '../components/admin/OrderStatusControl'
import AdminPagination from '../components/admin/AdminPagination'
import { orderStatusOptions } from '../constants/orderStatuses'

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 ring-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const loadOrders = useCallback(async (silent = false) => {
    const currentRequest = ++requestId.current
    if (!silent) setLoading(true)
    setError('')

    try {
      const result = await adminApi.orders(
        page,
        status,
        search,
        pageSize,
      )

      if (currentRequest === requestId.current) {
        setOrders(result.orders)
        setTotal(result.pagination.total)
        const normalizedTotalPages = Math.max(1, result.pagination.totalPages)
        setTotalPages(normalizedTotalPages)
        if (page > normalizedTotalPages) setPage(normalizedTotalPages)
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(getErrorMessage(err))
        setOrders([])
      }
    } finally {
      if (currentRequest === requestId.current && !silent) setLoading(false)
    }
  }, [page, pageSize, status, search])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), search ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [loadOrders, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: OrderStatus | '') => {
    setStatus(value)
    setPage(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(1)
  }

  const handleOrderUpdated = (orderId: string, updatedStatus: OrderStatus) => {
    setOrders((current) => current.map((order) =>
      order.id === orderId ? { ...order, status: updatedStatus } : order,
    ))
    void loadOrders(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-stone-900">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/40"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#a96342]">
                <ClipboardList size={17} />
                Order management
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Orders
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                Manage, search and monitor all customer orders.
              </p>
            </div>

            <button
              onClick={() => void loadOrders()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:cursor-wait disabled:opacity-60"
            >
              <LoaderCircle
                size={16}
                className={loading ? 'animate-spin' : 'hidden'}
              />
              <span className={loading ? 'hidden' : 'inline-flex'}>
                Refresh
              </span>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">
                Total orders
              </p>
              <div className="rounded-xl bg-[#f8eee9] p-2.5 text-[#a96342]">
                <ShoppingBag size={19} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Matching current filters
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">
                Current page
              </p>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Package size={19} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
              {page} <span className="text-lg font-medium text-slate-400">/ {totalPages}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Orders page navigation
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">
                Displaying
              </p>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <Eye size={19} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
              {orders.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Orders on this page
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-[#a96342]" />
            <h2 className="text-sm font-semibold text-stone-800">
              Search and filters
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                maxLength={100}
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search by order ID, customer name or email..."
                className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 pl-11 pr-10 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
              />

              {search && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 transition hover:bg-stone-200 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(event) =>
                  handleStatusChange(event.target.value as OrderStatus | '')
                }
                className="h-11 w-full appearance-none rounded-xl border border-stone-300 bg-stone-50/70 px-4 pr-10 text-sm font-medium text-stone-700 outline-none transition focus:border-[#a96342] focus:bg-white focus:ring-4 focus:ring-[#a96342]/10"
              >
                <option value="">All statuses</option>
                {orderStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>

          {(search || status) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500">
                Active filters:
              </span>

              {search && (
                <span className="rounded-lg bg-[#f8eee9] px-2.5 py-1 text-xs font-medium text-[#854e37]">
                  Search: {search}
                </span>
              )}

              {status && (
                <span className="rounded-lg bg-[#f8eee9] px-2.5 py-1 text-xs font-medium text-[#854e37]">
                  {status}
                </span>
              )}

              <button
                onClick={() => {
                  setSearch('')
                  setStatus('')
                  setPage(1)
                }}
                className="text-xs font-semibold text-stone-600 underline underline-offset-2 transition hover:text-[#8e4e32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex flex-col justify-between gap-2 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-stone-900">
                All orders
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Review customer purchases and order status.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <CalendarDays size={15} />
              <span>Newest orders first</span>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <button
                onClick={() => void loadOrders()}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <LoaderCircle size={28} className="animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">
                Loading orders...
              </p>
            </div>
          ) : !error && orders.length === 0 ? (
            <>
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-stone-100 p-4 text-stone-500">
                  <Package size={28} />
                </div>
                <h3 className="font-semibold text-stone-900">No orders found</h3>
                <p className="mt-1 max-w-sm text-sm text-stone-500">
                  Try changing your search or removing the selected filters.
                </p>
              </div>
              <AdminPagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                itemLabel="orders"
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : !error ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[980px] text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Order
                      </th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Customer
                      </th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Date
                      </th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Items
                      </th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Total
                      </th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[.13em] text-stone-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors odd:bg-white even:bg-stone-50/40 hover:bg-[#fbf5f1]"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold text-stone-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-stone-900">
                            {order.user?.name || 'Unknown customer'}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {order.user?.email || 'No email available'}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-stone-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-stone-700">
                          {order.items.length}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold tabular-nums text-stone-900">
                          {formatPrice(order.total)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                          <OrderStatusControl
                            orderId={order.id}
                            status={order.status}
                            hasSuccessfulPayment={order.hasSuccessfulPayment === true}
                            onUpdated={(updatedStatus) => handleOrderUpdated(order.id, updatedStatus)}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5cbbc] bg-[#fbf5f1] px-3 py-2 text-xs font-semibold text-[#854e37] transition hover:border-[#a96342] hover:bg-[#f8eee9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30"
                          >
                            View details
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-stone-100 xl:hidden">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-5">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="block transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-bold text-slate-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {order.user?.name || 'Unknown customer'}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {order.user?.email || 'No email available'}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            {formatDate(order.createdAt)} · {order.items.length} items
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#854e37]">
                          View details <ArrowRight size={16} />
                        </span>
                      </div>
                    </Link>
                    <OrderStatusControl
                      orderId={order.id}
                      status={order.status}
                      hasSuccessfulPayment={order.hasSuccessfulPayment === true}
                      onUpdated={(updatedStatus) => handleOrderUpdated(order.id, updatedStatus)}
                    />
                  </div>
                ))}
              </div>

              <AdminPagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                itemLabel="orders"
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : null}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <ClipboardList size={14} />
          <span>ETLEVA Admin · Order management</span>
        </div>
      </div>
    </div>
  )
}
