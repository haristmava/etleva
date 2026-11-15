import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import type { Product } from '../../types'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  function add() {
    addToCart(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }
  return <article className="product-card group min-w-0"><Link to={`/products/${product.id}`} className="block"><div className="product-image-frame relative aspect-[4/5] overflow-hidden bg-[#ece9e2]">{product.image ? <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"/> : <div className="flex h-full items-center justify-center font-editorial text-xl tracking-[.2em] text-[#a19c91]">ETLEVA</div>}{product.isNew && <span className="absolute left-3 top-3 bg-[#fbfaf7] px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[.18em] text-[#51483d]">Just arrived</span>}{product.stock < 1 && <span className="absolute inset-x-0 bottom-0 bg-[#292720]/85 py-3 text-center text-[9px] uppercase tracking-[.17em] text-white">Currently unavailable</span>}</div></Link><div className="flex items-start justify-between gap-2 pt-3.5 sm:pt-4"><div className="min-w-0"><p className="truncate text-[9px] uppercase tracking-[.14em] text-[#89857c]">{product.category.name}</p><Link to={`/products/${product.id}`} className="mt-1.5 block"><h3 className="line-clamp-2 text-[12px] font-medium leading-5 text-[#33312b] transition-colors group-hover:text-[#8e6748] sm:text-[13px]">{product.name}</h3></Link><p className="mt-2 text-[12px] text-[#34322c]">€{Number(product.price).toFixed(2)}</p>{product.stock > 0 && product.stock <= 5 && <p className="mt-1 text-[9px] text-[#8b684b]">Only {product.stock} left</p>}</div><button type="button" onClick={add} disabled={product.stock < 1} aria-label={added ? `${product.name} added to bag` : `Add ${product.name} to bag`} className="mt-4 flex h-9 w-9 shrink-0 items-center justify-center border border-[#d8d4cb] text-[#39372f] transition-colors hover:border-[#292720] hover:bg-[#292720] hover:text-white disabled:cursor-not-allowed disabled:opacity-35" title={product.stock < 1 ? 'Out of stock' : added ? 'Added to bag' : 'Quick add'}>{added ? <Check size={15}/> : <Plus size={15}/>}</button></div><p aria-live="polite" className="sr-only">{added ? `${product.name} added to your bag` : ''}</p></article>
}
