import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  itemLabel: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export default function AdminPagination({
  page,
  pageSize,
  total,
  totalPages,
  itemLabel,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const pageCount = Math.max(1, totalPages)
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, total)
  const pages = pageCount <= 5
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : Array.from(new Set([1, page - 1, page, page + 1, pageCount]))
        .filter((value) => value >= 1 && value <= pageCount)
        .sort((left, right) => left - right)

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="flex flex-col gap-4 border-t border-stone-200 bg-stone-50/70 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
        <span>
          Showing <strong className="font-semibold text-stone-800">{firstItem}–{lastItem}</strong> of{' '}
          <strong className="font-semibold text-stone-800">{total}</strong> {itemLabel}
        </span>
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-stone-300 bg-white px-2 text-xs font-medium text-stone-700 outline-none transition focus:border-[#a96342] focus:ring-2 focus:ring-[#a96342]/15"
            aria-label={`Rows per page for ${itemLabel}`}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>per page</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-[#a96342] hover:bg-[#fbf5f1] hover:text-[#8e4e32] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-stone-300 disabled:hover:bg-white disabled:hover:text-stone-700"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages.map((value, index) => {
          const previous = pages[index - 1]
          return (
            <span key={value} className="contents">
              {previous !== undefined && value - previous > 1 && (
                <span aria-hidden="true" className="px-1 text-xs text-stone-400">…</span>
              )}
              <button
                type="button"
                aria-label={`Go to page ${value}`}
                aria-current={page === value ? 'page' : undefined}
                onClick={() => onPageChange(value)}
                className={`h-9 min-w-9 rounded-lg px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 active:scale-[.98] ${
                  page === value
                    ? 'bg-[#a96342] text-white shadow-sm'
                    : 'border border-transparent text-stone-600 hover:border-stone-300 hover:bg-white'
                }`}
              >
                {value}
              </button>
            </span>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-[#a96342] hover:bg-[#fbf5f1] hover:text-[#8e4e32] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-stone-300 disabled:hover:bg-white disabled:hover:text-stone-700"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  )
}
