
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const totalQuantity = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  )

  const handleRemove = (productId: string) => {
    setRemovingId(productId)
    removeFromCart(productId)
    setRemovingId(null)
  }

  if (!cartItems.length) {
    return (
      <main className="cart-page flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#f5f1ea] px-5 py-20">
        <section className="cart-empty-enter relative mx-auto w-full max-w-2xl text-center">
          <div className="relative mx-auto mb-9 flex h-28 w-28 items-center justify-center rounded-full border border-[#d8cabb] bg-[#eee6da]">
            <div className="absolute inset-2 rounded-full border border-[#d8cabb]/70" />
            <ShoppingBag
              size={36}
              strokeWidth={1}
              className="text-[#a96342]"
            />
            <span className="absolute -right-1 top-2 h-3 w-3 rounded-full bg-[#b77955] animate-pulse" />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a96342]">
            ETLEVA / YOUR BAG
          </p>

          <h1 className="font-editorial mt-5 text-5xl font-light leading-[1.05] tracking-[-0.045em] text-[#302b25] sm:text-7xl">
            Your bag is
            <br />
            taking a pause.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-[#81776c]">
            The pieces you choose will be gathered here. Discover something
            special and make it yours.
          </p>

          <Link
            to="/products"
            className="group mx-auto mt-9 inline-flex min-h-14 items-center gap-8 bg-[#a96342] px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_25px_rgba(169,99,66,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#8e4e32] hover:shadow-[0_15px_30px_rgba(169,99,66,0.25)]"
          >
            Explore the collection
            <ArrowUpRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>

          <div className="mt-16 flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] text-[#a49a8d]">
            <span className="h-px w-8 bg-[#d8cabb]" />
            Considered pieces. Timeless style.
            <span className="h-px w-8 bg-[#d8cabb]" />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="cart-page min-h-screen bg-[#f7f4ee] px-5 py-10 sm:px-8 md:py-14 lg:px-14">
      <div className="mx-auto max-w-[1350px]">

        {/* Header */}
        <header className="cart-header-enter mb-10 border-b border-[#ded7cc] pb-8 md:mb-14">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a96342]">
                ETLEVA / YOUR BAG
              </p>

              <h1 className="font-editorial mt-4 text-5xl font-light tracking-[-0.045em] text-[#302b25] sm:text-6xl">
                The pieces you chose.
              </h1>

              <p className="mt-4 text-xs tracking-wide text-[#81776c]">
                {cartItems.length} {cartItems.length === 1 ? 'piece' : 'pieces'}
                <span className="mx-2 text-[#c1b4a4]">/</span>
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your bag
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex w-fit items-center gap-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#81776c] transition-colors hover:text-[#a96342]"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Continue exploring
            </Link>
          </div>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-16">

          {/* Cart items */}
          <section>
            <div className="hidden grid-cols-[1fr_145px_110px] border-b border-[#ded7cc] pb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#948a7e] sm:grid">
              <span>Your selection</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-[#e5ded3]">
              {cartItems.map((item, index) => (
                <article
                  key={item.product.id}
                  className="cart-item-enter grid gap-5 py-7 sm:grid-cols-[1fr_145px_110px] sm:items-center sm:gap-5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex min-w-0 gap-5">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="group relative block h-36 w-28 shrink-0 overflow-hidden bg-[#ebe5da] sm:h-40 sm:w-32"
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-[9px] tracking-[0.25em] text-[#a49a8d]">
                            ETLEVA
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-col justify-center">
                      <p className="text-[9px] uppercase tracking-[0.17em] text-[#a96342]">
                        {item.product.category.name}
                      </p>

                      <Link
                        to={`/products/${item.product.id}`}
                        className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#302b25] transition-colors hover:text-[#a96342]"
                      >
                        {item.product.name}
                      </Link>

                      <p className="mt-2 text-xs text-[#81776c]">
                        €{Number(item.product.price).toFixed(2)} / piece
                      </p>

                      {item.quantity > item.product.stock && (
                        <p role="alert" className="mt-2 text-[10px] text-[#a14d3d]">
                          Only {item.product.stock} currently available.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removingId === item.product.id}
                        className="mt-4 inline-flex w-fit items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#948a7e] transition-colors hover:text-[#a14d3d] disabled:opacity-50"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                        Remove item
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 pl-[calc(7rem+1.25rem)] sm:pl-0">
                    <div className="flex h-10 items-center border border-[#d9d0c4] bg-[#fbf9f5]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-full w-9 items-center justify-center text-[#81776c] transition-colors hover:bg-[#eee6da] hover:text-[#302b25] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={12} />
                      </button>

                      <span className="min-w-7 text-center text-xs tabular-nums text-[#302b25]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        aria-label="Increase quantity"
                        className="flex h-full w-9 items-center justify-center text-[#81776c] transition-colors hover:bg-[#eee6da] hover:text-[#302b25] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="hidden text-[9px] text-[#a49a8d] xl:inline">
                      {item.product.stock} available
                    </span>
                  </div>

                  {/* Item total */}
                  <div className="flex items-center justify-between pl-[calc(7rem+1.25rem)] sm:block sm:pl-0 sm:text-right">
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#a49a8d] sm:hidden">
                      Item total
                    </span>
                    <p className="text-sm font-medium tabular-nums text-[#302b25]">
                      €{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-7 border-t border-[#ded7cc] pt-6">
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#81776c] transition-colors hover:text-[#a96342]"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                Continue exploring
              </Link>
            </div>
          </section>

          {/* Order summary */}
          <aside className="summary-enter h-fit border border-[#ded7cc] bg-[#eee9e0] p-6 sm:p-8 lg:sticky lg:top-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a96342]">
              YOUR ETLEVA ORDER
            </p>

            <h2 className="font-editorial mt-3 text-3xl font-light tracking-[-0.035em] text-[#302b25]">
              Order summary
            </h2>

            <div className="mt-8 space-y-5 border-b border-[#d9d0c4] pb-6 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[#81776c]">Subtotal</span>
                <span className="font-medium tabular-nums text-[#302b25]">
                  €{cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#81776c]">Shipping</span>
                <span className="text-right text-[#81776c]">
                  Calculated at checkout
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#81776c]">Items</span>
                <span className="text-[#302b25]">{totalQuantity}</span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#81776c]">
                  Estimated total
                </p>
                <p className="mt-1 text-[10px] text-[#a49a8d]">
                  Shipping excluded
                </p>
              </div>

              <p className="font-editorial text-3xl font-light tabular-nums text-[#302b25]">
                €{cartTotal.toFixed(2)}
              </p>
            </div>

            <Link
              to="/checkout"
              className="group flex min-h-14 w-full items-center justify-between bg-[#a96342] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_20px_rgba(169,99,66,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#8e4e32] hover:shadow-[0_13px_25px_rgba(169,99,66,0.25)]"
            >
              Continue to checkout
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <div className="mt-7 space-y-4 border-t border-[#d9d0c4] pt-6">
              <div className="flex items-center gap-3">
                <Truck size={17} strokeWidth={1.4} className="text-[#a96342]" />
                <p className="text-[10px] leading-5 text-[#81776c]">
                  Shipping details confirmed at checkout.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck size={17} strokeWidth={1.4} className="text-[#a96342]" />
                <p className="text-[10px] leading-5 text-[#81776c]">
                  Secure account and order management.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <PackageCheck size={17} strokeWidth={1.4} className="text-[#a96342]" />
                <p className="text-[10px] leading-5 text-[#81776c]">
                  Your selection is ready for checkout.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[9px] leading-5 text-[#a49a8d]">
              Final order total is confirmed during checkout.
            </p>
          </aside>
        </div>

        <footer className="mt-16 border-t border-[#ded7cc] pt-6 text-center">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[#a49a8d]">
            ETLEVA — Considered pieces. Timeless style.
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes cartEnter {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cartItemEnter {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .cart-empty-enter,
        .cart-header-enter,
        .summary-enter {
          animation: cartEnter 700ms cubic-bezier(.2,.7,.2,1) both;
        }

        .cart-item-enter {
          animation: cartItemEnter 600ms cubic-bezier(.2,.7,.2,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-empty-enter,
          .cart-header-enter,
          .summary-enter,
          .cart-item-enter {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}
