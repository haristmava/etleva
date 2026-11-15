import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getErrorMessage, shopApi } from '../services/api'
import type { Product } from '../types'
import ProductCard from '../components/product/ProductCard'

export default function ProductDetailsPage() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    shopApi.product(id)
      .then((item) => { if (!item.isActive) throw new Error('This piece is no longer available.'); setProduct(item) })
      .catch((reason: unknown) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product) return
    shopApi.products({ page: 1, limit: 5, categoryId: product.categoryId, isActive: true, sortBy: 'createdAt', order: 'desc' })
      .then((result) => setRelated(result.products.filter((item) => item.id !== product.id).slice(0, 4)))
      .catch(() => setRelated([]))
  }, [product])

  if (loading) return <main className="mx-auto max-w-7xl px-5 py-16 md:px-9"><div className="grid animate-pulse gap-9 md:grid-cols-2"><div className="aspect-[4/5] bg-[#ece9e2]"/><div className="space-y-6 py-12"><div className="h-3 w-1/4 bg-[#ece9e2]"/><div className="h-10 w-2/3 bg-[#ece9e2]"/><div className="h-5 w-1/5 bg-[#ece9e2]"/></div></div></main>
  if (error || !product) return <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"><p className="eyebrow">ETLEVA COLLECTION</p><h1 className="font-editorial mt-3 text-4xl font-light">Piece unavailable</h1><p role="alert" className="mt-3 text-sm text-[#77746e]">{error || 'The product could not be found.'}</p><Link to="/products" className="mt-6 border border-[#39372f] px-6 py-3 text-[10px] uppercase tracking-[.15em]">Back to the collection</Link></main>

  return <main className="bg-[#fbfaf7]">
    <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-9 md:py-12 lg:px-14"><Link to="/products" className="mb-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#77746e] hover:text-[#292720]"><ArrowLeft size={14}/>Back to the collection</Link><div className="grid gap-8 md:grid-cols-[1.05fr_.95fr] md:gap-14 lg:gap-20"><div className="relative overflow-hidden bg-[#ece9e2]"><div className="aspect-[4/4.8] md:aspect-[4/5.1]">{product.image ? <img src={product.image} alt={product.name} fetchPriority="high" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center font-editorial text-2xl tracking-[.2em] text-[#a19c91]">ETLEVA</div>}</div>{product.isNew && <span className="absolute left-4 top-4 bg-[#fbfaf7] px-3 py-2 text-[8px] uppercase tracking-[.18em]">Just arrived</span>}</div>
        <section className="flex flex-col justify-center py-3 md:py-10"><p className="eyebrow">{product.category.name}</p><h1 className="font-editorial mt-4 text-4xl font-light leading-[1.02] tracking-[-.035em] text-[#292720] sm:text-5xl lg:text-6xl">{product.name}</h1><p className="mt-5 text-base tracking-[.04em]">€{Number(product.price).toFixed(2)}</p><div className="my-7 border-t border-[#e2dfd7]"/><h2 className="text-[9px] uppercase tracking-[.17em] text-[#77746e]">A closer look</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#68655d]">{product.description}</p><div className="mt-7 flex items-center justify-between border-y border-[#e2dfd7] py-4"><span className="text-[10px] uppercase tracking-[.14em] text-[#77746e]">Availability</span><span className={`text-xs ${product.stock > 0 ? 'text-[#5d705a]' : 'text-[#8e4b3e]'}`}>{product.stock > 0 ? product.stock <= 5 ? `Only ${product.stock} remaining` : 'Available' : 'Currently unavailable'}</span></div><div className="mt-6 flex items-center justify-between gap-5"><span className="text-[10px] uppercase tracking-[.14em] text-[#77746e]">Quantity</span><div className="flex items-center border border-[#d8d4cb]"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3.5 disabled:opacity-30"><Minus size={14}/></button><span aria-live="polite" className="min-w-10 text-center text-xs">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="p-3.5 disabled:opacity-30"><Plus size={14}/></button></div></div><button type="button" disabled={!product.stock} onClick={() => {addToCart(product, quantity);setAdded(true);window.setTimeout(() => setAdded(false),1800)}} className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 bg-[#292720] px-5 text-[10px] uppercase tracking-[.16em] text-white transition-colors hover:bg-[#49463d] disabled:cursor-not-allowed disabled:opacity-45"><ShoppingBag size={16}/>{product.stock ? added ? 'Added to your bag' : 'Add to bag' : 'Unavailable'}</button>{added && <p role="status" className="mt-3 text-center text-xs text-[#5d705a]">Added to your bag. <Link to="/cart" className="underline underline-offset-4">View bag</Link></p>}<p className="mt-5 text-center text-[9px] uppercase tracking-[.12em] text-[#969187]">A considered addition to your everyday</p></section>
      </div></div>
    {related.length > 0 && <section className="border-t border-[#e5e1d8] px-5 py-14 md:px-9 md:py-20 lg:px-14"><div className="mx-auto max-w-[1400px]"><div className="mb-8 flex items-end justify-between"><div><p className="eyebrow">CONTINUE EXPLORING</p><h2 className="font-editorial mt-3 text-3xl font-light tracking-[-.03em] sm:text-4xl">More from {product.category.name}.</h2></div><Link to={`/products?categoryId=${product.categoryId}`} className="hidden items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:flex">View category <ArrowUpRight size={14}/></Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-5">{related.map((item) => <ProductCard key={item.id} product={item}/>)}</div></div></section>}
  </main>
}
