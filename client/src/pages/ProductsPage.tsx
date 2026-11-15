
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { shopApi, getErrorMessage } from '../services/api'
import type { Category, Product } from '../types'
import ProductCard from '../components/product/ProductCard'

const controlClass =
  'transition-all duration-300 ease-out focus-within:border-[#a96342] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(169,99,66,0.09)]'

const categoryBase =
  'group relative inline-flex shrink-0 items-center justify-center overflow-hidden border px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342] focus-visible:ring-offset-2'

const categoryActive =
  'border-[#a96342] bg-[#a96342] text-white shadow-[0_5px_15px_rgba(169,99,66,0.17)]'

const categoryInactive =
  'border-[#d8d0c4] bg-transparent text-[#625f58] hover:-translate-y-0.5 hover:border-[#a96342] hover:bg-[#f2e9df] hover:text-[#8e4e32]'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('categoryId') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt-desc')
  const [newOnly, setNewOnly] = useState(searchParams.get('isNew') === 'true')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    shopApi.categories()
      .then((result) => {
        if (!cancelled) setCategories(result)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(getErrorMessage(reason))
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      const [sortBy, order] = sort.split('-')

      setLoading(true)
      setError('')

      void shopApi.products({
        page,
        limit: 12,
        search: search.trim() || undefined,
        categoryId: category || undefined,
        sortBy,
        order,
        isActive: true,
        isNew: newOnly || undefined,
        inStock: inStockOnly || undefined,
      })
        .then((result) => {
          if (cancelled) return

          setProducts(result.products)
          setTotalProducts(result.pagination.totalProducts)
          setTotalPages(result.pagination.totalPages)
        })
        .catch((reason: unknown) => {
          if (!cancelled) setError(getErrorMessage(reason))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, search ? 300 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [search, category, sort, page, newOnly, inStockOnly, reloadKey])

  const changeFilter = (update: () => void) => {
    update()
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setNewOnly(false)
    setInStockOnly(false)
    setSort('createdAt-desc')
    setPage(1)
  }

  const activeFilters = Boolean(
    search || category || newOnly || inStockOnly
  )

  return (
    <main className="products-page min-h-screen bg-[#fbfaf7]">

      {/* Collection hero */}
      <section className="collection-hero relative isolate overflow-hidden bg-[#eee9e0] px-5 py-16 text-center sm:py-20 md:py-24">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#d5c8b8]" />
          <div className="absolute -right-10 -top-18 h-60 w-60 rounded-full border border-[#d5c8b8]" />
          <div className="absolute -bottom-48 -left-20 h-80 w-80 rounded-full border border-[#d5c8b8]" />
        </div>

        <div className="collection-hero-content mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a96342]">
            THE ETLEVA COLLECTION
          </p>

          <h1 className="font-editorial mt-5 text-5xl font-light leading-[1.05] tracking-[-0.045em] text-[#302b25] sm:text-6xl md:text-7xl">
            Considered,
            <br className="sm:hidden" /> collected.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#777065]">
            Pieces with presence, selected to make the everyday feel a little
            more yours.
          </p>

          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#c9b8a5]" />
            <span className="text-[9px] uppercase tracking-[0.22em] text-[#928679]">
              Discover your next favourite
            </span>
            <span className="h-px w-8 bg-[#c9b8a5]" />
          </div>
        </div>
      </section>

      {/* Product collection */}
      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-9 md:py-16 lg:px-14">

        {/* Collection heading and controls */}
        <div className="mb-8 flex flex-col gap-6 border-b border-[#e3dfd6] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="collection-heading-enter">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#a96342]">
              THE SELECTION
            </p>

            <h2 className="font-editorial mt-3 text-4xl font-light tracking-[-0.04em] text-[#302b25]">
              Shop all
            </h2>

            <p className="mt-2 text-[11px] text-[#817d74]">
              {loading
                ? 'Finding your pieces...'
                : `${totalProducts} ${totalProducts === 1 ? 'piece' : 'pieces'} to discover`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <label
              className={`flex min-h-12 items-center gap-3 border border-[#d8d4cb] bg-transparent px-4 ${controlClass}`}
            >
              <Search
                size={16}
                strokeWidth={1.6}
                className="shrink-0 text-[#a18f7c] transition-colors"
              />

              <input
                aria-label="Search products"
                value={search}
                onChange={(event) =>
                  changeFilter(() => setSearch(event.target.value))
                }
                placeholder="Search the collection"
                className="w-full bg-transparent py-3 text-xs text-[#302b25] outline-none placeholder:text-[#99958d] sm:w-48"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => changeFilter(() => setSearch(''))}
                  aria-label="Clear search"
                  className="text-[#99958d] transition-colors hover:text-[#a96342]"
                >
                  ×
                </button>
              )}
            </label>

            {/* Sorting */}
            <label
              className={`flex min-h-12 items-center gap-3 border border-[#d8d4cb] px-4 ${controlClass}`}
            >
              <SlidersHorizontal
                size={15}
                strokeWidth={1.5}
                className="shrink-0 text-[#a18f7c]"
              />

              <select
                aria-label="Sort products"
                value={sort}
                onChange={(event) =>
                  changeFilter(() => setSort(event.target.value))
                }
                className="w-full cursor-pointer bg-transparent py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#625f58] outline-none sm:w-auto"
              >
                <option value="createdAt-desc">Recently added</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name-asc">Name: A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#948a7e]">
              Explore by category
            </p>

            {activeFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a96342] transition-colors hover:text-[#713e29]"
              >
                <RotateCcw size={11} />
                Reset filters
              </button>
            )}
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-3">
            <button
              type="button"
              aria-pressed={!category}
              onClick={() => changeFilter(() => setCategory(''))}
              className={`${categoryBase} ${!category ? categoryActive : categoryInactive}`}
            >
              All pieces
            </button>

            {categories.map((item) => {
              const active = category === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    changeFilter(() => setCategory(item.id))
                  }
                  className={`${categoryBase} ${active ? categoryActive : categoryInactive}`}
                >
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Additional filters */}
        <div className="mb-8 flex flex-wrap items-center gap-x-7 gap-y-4 border-b border-[#e8e3da] pb-7">
          <label className="filter-option inline-flex cursor-pointer items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#716e66]">
            <input
              type="checkbox"
              checked={newOnly}
              onChange={(event) =>
                changeFilter(() => setNewOnly(event.target.checked))
              }
              className="h-4 w-4 cursor-pointer accent-[#a96342]"
            />
            New arrivals
          </label>

          <label className="filter-option inline-flex cursor-pointer items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#716e66]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) =>
                changeFilter(() => setInStockOnly(event.target.checked))
              }
              className="h-4 w-4 cursor-pointer accent-[#a96342]"
            />
            Available now
          </label>

          {(newOnly || inStockOnly) && (
            <span className="filter-status text-[9px] uppercase tracking-[0.14em] text-[#a96342]">
              Filters applied
            </span>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-[#e4cfc6] bg-[#f7eeea] p-5 text-xs text-[#814e40]"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="group inline-flex items-center gap-2 font-semibold uppercase tracking-[0.12em] transition-colors hover:text-[#a96342]"
            >
              Try again
              <RotateCcw
                size={13}
                className="transition-transform duration-300 group-hover:-rotate-45"
              />
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div
            className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index}>
                <div className="aspect-[4/5] animate-pulse bg-[#ece9e2]" />
                <div className="mt-4 h-2.5 w-1/3 animate-pulse bg-[#ece9e2]" />
                <div className="mt-3 h-4 w-2/3 animate-pulse bg-[#ece9e2]" />
                <div className="mt-3 h-3 w-1/4 animate-pulse bg-[#ece9e2]" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div
              key={`${category}-${search}-${sort}-${page}-${newOnly}-${inStockOnly}`}
              className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4"
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="product-enter min-w-0"
                  style={{ animationDelay: `${Math.min(index * 65, 390)}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-products-enter border-y border-[#e5e1d8] py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ded4c7] bg-[#f1ebe2]">
              <Search size={23} strokeWidth={1.2} className="text-[#a96342]" />
            </div>

            <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#a96342]">
              NOTHING MATCHED THIS TIME
            </p>

            <h3 className="font-editorial mt-4 text-4xl font-light tracking-[-0.035em] text-[#302b25]">
              Try another direction.
            </h3>

            <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-[#77746e]">
              Adjust your search or filters to see more of the collection.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="group mx-auto mt-7 inline-flex min-h-12 items-center gap-3 bg-[#a96342] px-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#8e4e32] hover:shadow-[0_8px_20px_rgba(169,99,66,0.2)] active:scale-[0.98]"
            >
              Clear all filters
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <nav
            aria-label="Product pages"
            className="pagination-enter mt-16 flex flex-wrap items-center justify-center gap-5 border-t border-[#e3dfd6] pt-9"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="group inline-flex min-h-11 items-center gap-2 border border-[#d8d4cb] px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#625f58] transition-all duration-300 hover:-translate-x-1 hover:border-[#a96342] hover:bg-[#f2e9df] hover:text-[#8e4e32] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:border-[#d8d4cb] disabled:hover:bg-transparent"
            >
              <ArrowRight size={13} className="rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Previous
            </button>

            <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#81776c]">
              <span className="text-[#302b25]">{page}</span>
              <span className="mx-2 text-[#c1b4a4]">/</span>
              {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="group inline-flex min-h-11 items-center gap-2 border border-[#d8d4cb] px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#625f58] transition-all duration-300 hover:translate-x-1 hover:border-[#a96342] hover:bg-[#f2e9df] hover:text-[#8e4e32] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:border-[#d8d4cb] disabled:hover:bg-transparent"
            >
              Next
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </nav>
        )}
      </section>

      {/* Animations */}
      <style>{`
        @keyframes collectionEnter {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes productEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes emptyEnter {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .collection-hero-content,
        .collection-heading-enter {
          animation: collectionEnter 750ms cubic-bezier(.2,.7,.2,1) both;
        }

        .product-enter {
          opacity: 0;
          animation: productEnter 650ms cubic-bezier(.2,.7,.2,1) both;
        }

        .empty-products-enter,
        .pagination-enter {
          animation: collectionEnter 600ms cubic-bezier(.2,.7,.2,1) both;
        }

        .filter-option {
          transition: color 250ms ease;
        }

        .filter-option:hover {
          color: #a96342;
        }

        @media (prefers-reduced-motion: reduce) {
          .collection-hero-content,
          .collection-heading-enter,
          .product-enter,
          .empty-products-enter,
          .pagination-enter {
            animation: none !important;
            opacity: 1;
            transform: none;
          }

          .products-page *,
          .products-page *::before,
          .products-page *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  )
}
