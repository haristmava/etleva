import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { getErrorMessage, shopApi } from '../../services/api'
import type { Product } from '../../types'
import ProductCard from '../product/ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(true)
  const carousel = useRef<HTMLDivElement>(null)

  useEffect(() => { shopApi.products({ limit: 8, page: 1, sortBy: 'createdAt', order: 'desc', isActive: true, isNew: true }).then((result) => setProducts(result.products)).catch((reason: unknown) => setError(getErrorMessage(reason))) }, [])

  const updateScrollState = useCallback(() => {
    const element = carousel.current
    if (!element) return
    setCanGoBack(element.scrollLeft > 4)
    setCanGoForward(element.scrollLeft + element.clientWidth < element.scrollWidth - 4)
  }, [])

  function move(direction: -1 | 1) {
    const element = carousel.current
    if (!element) return
    const cardWidth = element.querySelector<HTMLElement>('[data-carousel-card]')?.offsetWidth ?? element.clientWidth * 0.7
    element.scrollBy({ left: direction * (cardWidth + 20) * 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return <section className="overflow-hidden bg-[#fbfaf7] px-5 py-16 md:px-9 md:py-24 lg:px-14"><div className="mx-auto max-w-[1400px]"><div className="mb-8 flex items-end justify-between gap-6 md:mb-11"><div><p className="eyebrow">JUST ARRIVED</p><h2 className="font-editorial mt-3 text-4xl font-light tracking-[-.035em] text-[#282720] sm:text-5xl">The latest edit.</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#77746e]">Fresh perspectives, new textures and the pieces you’ll reach for again.</p></div><div className="hidden items-center gap-3 sm:flex"><button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Scroll to previous arrivals" className="flex h-11 w-11 items-center justify-center border border-[#d8d4cb] text-[#39372f] transition hover:bg-[#292720] hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#39372f]"><ArrowLeft size={16}/></button><button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="Scroll to more arrivals" className="flex h-11 w-11 items-center justify-center border border-[#d8d4cb] text-[#39372f] transition hover:bg-[#292720] hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#39372f]"><ArrowRight size={16}/></button></div></div>
    {error ? <p role="status" className="border-y border-[#e5e1d8] py-8 text-sm text-[#77746e]">{error}</p> : products.length ? <div ref={carousel} onScroll={updateScrollState} onLoad={updateScrollState} className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:-mx-9 md:gap-5 md:px-9 lg:-mx-14 lg:px-14">{products.map((product, index) => <div data-carousel-card key={product.id} className="w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[42vw] md:w-[calc((100%-3.75rem)/4)] md:max-w-none" style={{ animationDelay: `${index * 60}ms` }}><ProductCard product={product}/></div>)}</div> : <p className="border-y border-[#e5e1d8] py-8 text-sm text-[#77746e]">New pieces will appear here as they join the collection.</p>}
    <div className="mt-5 flex justify-end sm:hidden"><button type="button" onClick={() => move(1)} aria-label="Scroll to more arrivals" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em]">Explore arrivals <ArrowRight size={15}/></button></div><div className="mt-8 flex justify-center sm:justify-start"><Link to="/products?isNew=true" className="inline-flex items-center gap-2 border-b border-[#79766d] pb-1 text-[10px] uppercase tracking-[.16em]">View all new arrivals <ArrowUpRight size={14}/></Link></div></div></section>
}
