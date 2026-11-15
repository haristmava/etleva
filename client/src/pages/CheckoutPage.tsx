
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  getErrorMessage,
  shopApi,
  type Payment,
} from '../services/api'

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()

  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')

  const [orderId, setOrderId] = useState('')
  const [payment, setPayment] = useState<Payment | null>(null)

  // ------------------------------------------
  // PROCESS PAYMENT
  // ------------------------------------------

  async function startPayment(currentOrderId: string) {
    setPaymentLoading(true)
    setPaymentError('')

    try {
      const newPayment = await shopApi.createPayment(currentOrderId)

      setPayment(newPayment)

      const result = await shopApi.processPayment(newPayment.id)

      setPayment(result)
    } catch (reason) {
      setPaymentError(getErrorMessage(reason))
    } finally {
      setPaymentLoading(false)
    }
  }

  // ------------------------------------------
  // CREATE ORDER
  // ------------------------------------------

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || paymentLoading || !user || orderId) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const order = await shopApi.createOrder(
        address.trim(),
        cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        }))
      )

      setOrderId(order.id)

      // Cart is cleared only after the order is created.
      clearCart()

      await startPayment(order.id)
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  // ------------------------------------------
  // RETRY PAYMENT
  // ------------------------------------------

  async function handleRetryPayment() {
    if (!orderId || paymentLoading) return

    await startPayment(orderId)
  }

  // ------------------------------------------
  // EMPTY CART
  // ------------------------------------------

  if (!cartItems.length && !orderId) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-stone-100">
          <CreditCard size={25} className="text-stone-500" />
        </div>

        <h1 className="mt-6 text-3xl font-light">
          Your bag is empty
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Add something from the collection before checkout.
        </p>

        <Link
          to="/products"
          className="mt-7 bg-stone-900 px-8 py-4 text-sm text-white transition hover:bg-stone-700"
        >
          Explore the collection
        </Link>
      </main>
    )
  }

  // ------------------------------------------
  // PAYMENT RESULT
  // ------------------------------------------

  if (orderId) {
    const paymentSucceeded = payment?.status === 'SUCCEEDED'
    const paymentFailed = payment?.status === 'FAILED'

    return (
      <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">

        {paymentLoading && (
          <>
            <div className="flex h-20 w-20 items-center justify-center bg-stone-100">
              <LoaderCircle
                size={32}
                className="animate-spin text-stone-700"
              />
            </div>

            <p className="eyebrow mt-7">
              ETLEVA PAYMENT
            </p>

            <h1 className="mt-3 text-3xl font-light">
              Processing your payment
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">
              Please wait while we process your payment.
              Do not close this page.
            </p>
          </>
        )}

        {!paymentLoading && paymentSucceeded && (
          <>
            <div className="flex h-20 w-20 items-center justify-center bg-green-50 text-green-700">
              <CheckCircle2 size={36} />
            </div>

            <p className="eyebrow mt-7 text-green-800">
              PAYMENT SUCCESSFUL
            </p>

            <h1 className="mt-3 text-4xl font-light tracking-tight">
              Thank you, {user?.name.split(' ')[0]}
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">
              Your payment has been completed successfully.
              Your order is now being processed.
            </p>

            <div className="mt-8 w-full border border-stone-200 p-5 text-left">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-500">Order ID</span>
                <span className="font-medium">{orderId}</span>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-stone-500">Payment status</span>
                <span className="font-medium text-green-700">
                  {payment.status}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-stone-500">Amount paid</span>
                <span className="font-medium">
                  €{Number(payment.amount).toFixed(2)}
                </span>
              </div>

              {payment.transactionReference && (
                <div className="mt-4 border-t border-stone-200 pt-4">
                  <p className="text-xs text-stone-500">
                    Transaction reference
                  </p>
                  <p className="mt-1 break-all text-xs font-medium">
                    {payment.transactionReference}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to={`/account/orders/${orderId}`}
                className="bg-stone-900 px-7 py-4 text-sm text-white transition hover:bg-stone-700"
              >
                View order
              </Link>

              <Link
                to="/products"
                className="border border-stone-300 px-7 py-4 text-sm transition hover:bg-stone-100"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}

        {!paymentLoading && paymentFailed && (
          <>
            <div className="flex h-20 w-20 items-center justify-center bg-red-50 text-red-700">
              <XCircle size={36} />
            </div>

            <p className="eyebrow mt-7 text-red-800">
              PAYMENT FAILED
            </p>

            <h1 className="mt-3 text-3xl font-light">
              Payment unsuccessful
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-stone-500">
              Your payment could not be completed.
              Your order remains pending. You can try again.
            </p>

            {payment.failureReason && (
              <p className="mt-5 border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
                {payment.failureReason}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="inline-flex items-center gap-2 bg-stone-900 px-7 py-4 text-sm text-white transition hover:bg-stone-700"
              >
                <RefreshCw size={16} />
                Try payment again
              </button>

              <Link
                to={`/account/orders/${orderId}`}
                className="border border-stone-300 px-7 py-4 text-sm transition hover:bg-stone-100"
              >
                View order
              </Link>
            </div>
          </>
        )}

        {!paymentLoading && !payment && paymentError && (
          <>
            <div className="flex h-20 w-20 items-center justify-center bg-red-50 text-red-700">
              <XCircle size={36} />
            </div>

            <h1 className="mt-5 text-3xl font-light">
              Payment could not be started
            </h1>

            <p role="alert" className="mt-4 text-sm text-red-700">
              {paymentError}
            </p>

            <button
              type="button"
              onClick={handleRetryPayment}
              className="mt-8 inline-flex items-center gap-2 bg-stone-900 px-7 py-4 text-sm text-white transition hover:bg-stone-700"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </>
        )}

        {!paymentLoading && payment?.status === 'PENDING' && paymentError && (
          <>
            <div className="flex h-20 w-20 items-center justify-center bg-amber-50 text-amber-700">
              <CreditCard size={36} />
            </div>

            <h1 className="mt-5 text-3xl font-light">
              Payment status needs checking
            </h1>

            <p role="alert" className="mt-4 text-sm text-stone-600">
              {paymentError}
            </p>

            <p className="mt-3 text-xs text-stone-500">
              The payment may still be pending. Check its status before attempting another payment.
            </p>

            <Link
              to={`/account/orders/${orderId}`}
              className="mt-8 border border-stone-300 px-7 py-4 text-sm transition hover:bg-stone-100"
            >
              View order
            </Link>
          </>
        )}
      </main>
    )
  }

  // ------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------

  if (!user) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-light">
          Sign in to place your order
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Your bag will be here when you return.
        </p>

        <Link
          to="/login?redirect=/checkout"
          className="mt-7 bg-stone-900 px-8 py-4 text-sm text-white"
        >
          Sign in
        </Link>
      </main>
    )
  }

  // ------------------------------------------
  // CHECKOUT FORM
  // ------------------------------------------

  const inputClass =
    'mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-900'

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">

      <div className="mb-10">
        <p className="eyebrow">ETLEVA CHECKOUT</p>

        <h1 className="font-editorial mt-3 text-4xl font-light tracking-[-.035em] md:text-5xl">
          Complete your order
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Order as {user.email}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-12 lg:grid-cols-[1fr_380px]"
      >

        {/* DELIVERY DETAILS */}

        <section>
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-stone-100">
              <LockKeyhole size={18} />
            </div>

            <div>
              <h2 className="text-lg font-medium">
                Delivery details
              </h2>

              <p className="text-xs text-stone-500">
                Where should we deliver your order?
              </p>
            </div>
          </div>

          <label
            htmlFor="shippingAddress"
            className="text-sm font-medium"
          >
            Shipping address
          </label>

          <textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            minLength={10}
            maxLength={500}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={5}
            className={inputClass}
            placeholder="Full name, street address, city, postal code, country"
          />

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Include your full name and complete delivery address.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          {/* PAYMENT METHOD */}

          <div className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-stone-100">
                <CreditCard size={19} />
              </div>

              <div>
                <h2 className="text-lg font-medium">
                  Payment method
                </h2>

                <p className="text-xs text-stone-500">
                  Choose how to complete your payment.
                </p>
              </div>
            </div>

            <div className="border border-stone-900 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-stone-900">
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-900" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Card payment
                    </p>

                    <span className="text-xs text-stone-500">
                      Demo mode
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    This portfolio version uses a payment simulator.
                    No real card details or money are involved.
                  </p>
                </div>

                <CreditCard
                  size={23}
                  className="text-stone-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 text-xs leading-5 text-stone-500">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0"
              />

              <p>
                Your order is processed securely by the ETLEVA backend.
                Real bank card payments will require an approved payment provider.
              </p>
            </div>
          </div>
        </section>

        {/* ORDER SUMMARY */}

        <aside className="h-fit bg-[#f4f1eb] p-6 md:p-7">
          <h2 className="text-lg font-medium">
            Order summary
          </h2>

          <p className="mt-1 text-xs text-stone-500">
            {cartItems.length} different products
          </p>

          <div className="mt-6 space-y-5 border-b border-stone-300 pb-6">
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Quantity: {quantity}
                  </p>
                </div>

                <span className="shrink-0 font-medium">
                  €{(Number(product.price) * quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between py-5 text-sm">
            <span className="text-stone-500">
              Subtotal
            </span>

            <span>
              €{cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between border-t border-stone-300 pt-5 text-base font-medium">
            <span>Total</span>

            <span>
              €{cartTotal.toFixed(2)}
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-stone-500">
            The final order total is calculated by the server
            using current product prices.
          </p>

          <button
            disabled={submitting || paymentLoading || !address.trim()}
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-3 bg-stone-900 px-6 py-4 text-sm text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating order...
              </>
            ) : (
              <>
                <LockKeyhole size={16} />
                Place order & pay
              </>
            )}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-500">
            <ShieldCheck size={15} />
            Secure demo checkout
          </div>
        </aside>
      </form>

      <Link
        to="/cart"
        className="mt-9 inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
      >
        <ArrowLeft size={16} />
        Return to bag
      </Link>
    </main>
  )
}

export default CheckoutPage
