import { useState } from 'react'
import { Info, LoaderCircle } from 'lucide-react'
import { adminApi, getErrorMessage } from '../../services/api'
import { orderStatusOptions } from '../../constants/orderStatuses'
import type { OrderStatus } from '../../types'

interface OrderStatusControlProps {
  orderId: string
  status: OrderStatus
  hasSuccessfulPayment?: boolean
  showCancellationInfo?: boolean
  onUpdated: (status: OrderStatus) => void
}

export default function OrderStatusControl({
  orderId,
  status,
  hasSuccessfulPayment = false,
  showCancellationInfo = true,
  onUpdated,
}: OrderStatusControlProps) {
  const [selection, setSelection] = useState<{
    baseStatus: OrderStatus
    selectedStatus: OrderStatus
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const selectedStatus = selection?.baseStatus === status
    ? selection.selectedStatus
    : status
  const cancellationBlocked = hasSuccessfulPayment && selectedStatus === 'CANCELLED'

  async function saveStatus() {
    if (saving || selectedStatus === status || cancellationBlocked) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updatedOrder = await adminApi.updateOrder(orderId, selectedStatus)
      onUpdated(updatedOrder.status)
      setSuccess('Status updated.')
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`order-status-${orderId}`}>
          New status for order {orderId.slice(0, 8)}
        </label>
        <select
          id={`order-status-${orderId}`}
          value={selectedStatus}
          disabled={saving}
          onChange={(event) => {
            setSelection({
              baseStatus: status,
              selectedStatus: event.target.value as OrderStatus,
            })
            setError('')
            setSuccess('')
          }}
          className="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        >
          {orderStatusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={hasSuccessfulPayment && option.value === 'CANCELLED'}
            >
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void saveStatus()}
          disabled={saving || selectedStatus === status || cancellationBlocked}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#a96342] px-3 text-xs font-semibold text-white transition hover:bg-[#8e4e32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96342]/30 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving && <LoaderCircle size={13} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        {hasSuccessfulPayment && showCancellationInfo && status !== 'CANCELLED' && (
          <span
            role="img"
            tabIndex={0}
            title="Paid orders cannot be cancelled because refunds are not supported by the payment simulator."
            aria-label="Paid orders cannot be cancelled because refunds are not supported by the payment simulator."
            className="inline-flex rounded-sm text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <Info
              size={15}
              aria-hidden="true"
            />
          </span>
        )}
      </div>
      {error && <p role="alert" className="max-w-56 text-xs text-red-700">{error}</p>}
      {success && <p role="status" className="text-xs text-emerald-700">{success}</p>}
    </div>
  )
}
