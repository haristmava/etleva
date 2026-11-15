import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getErrorMessage, shopApi } from '../../services/api'
import type { Category } from '../../types'

const categoryImages = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85',
]

function CategoryTile({ category, index }: { category: Category; index: number }) {
  return <Link to={`/products?categoryId=${category.id}`} className={`group block ${index === 0 ? 'md:row-span-2' : ''}`}>
    <div className={`relative overflow-hidden bg-[#eae7df] ${index === 0 ? 'aspect-[4/4.6] md:aspect-auto md:h-full md:min-h-[580px]' : 'aspect-[1.58/1]'}`}>
      <img src={categoryImages[index % categoryImages.length]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-90"/>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-7"><div><span className="mb-2 block text-[9px] uppercase tracking-[.22em] text-white/75">DISCOVER</span><h3 className="font-editorial text-2xl font-light sm:text-3xl">{category.name}</h3></div><span className="flex h-10 w-10 items-center justify-center border border-white/55 transition duration-300 group-hover:bg-white group-hover:text-[#25231f]"><ArrowUpRight size={17}/></span></div>
    </div>
  </Link>
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  useEffect(() => { shopApi.categories().then(setCategories).catch((reason: unknown) => setError(getErrorMessage(reason))) }, [])
  return <section id="categories" className="scroll-mt-32 bg-[#fbfaf7] px-5 py-16 md:px-9 md:py-24 lg:px-14"><div className="mx-auto max-w-[1400px]"><div className="mb-9 flex flex-wrap items-end justify-between gap-5 md:mb-12"><div><p className="eyebrow">A WORLD OF ETLEVA</p><h2 className="font-editorial mt-3 text-4xl font-light tracking-[-.035em] text-[#282720] sm:text-5xl">Find your point of view.</h2></div><Link to="/products" className="inline-flex items-center gap-2 border-b border-[#7c786f] pb-1 text-[10px] uppercase tracking-[.16em]">View the collection <ArrowUpRight size={14}/></Link></div>{error ? <p role="status" className="border-t border-[#e5e1d8] py-8 text-sm text-[#77746e]">{error}</p> : categories.length ? <div className="grid gap-3 sm:grid-cols-2 md:auto-rows-[minmax(0,1fr)] md:grid-cols-12 md:gap-4">{categories.slice(0, 3).map((category, index) => <div key={category.id} className={index === 0 ? 'col-span-full sm:col-span-2 md:col-span-7' : 'md:col-span-5'}><CategoryTile category={category} index={index}/></div>)}</div> : <p className="border-t border-[#e5e1d8] py-8 text-sm text-[#77746e]">The collection is taking shape. Check back soon.</p>}</div></section>
}
