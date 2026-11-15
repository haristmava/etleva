import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function BrandStory() {
  return <section className="bg-[#292720] px-5 py-16 text-[#f6f4ed] md:px-9 md:py-24 lg:px-14"><div className="mx-auto grid max-w-[1400px] gap-9 md:grid-cols-[.85fr_1.15fr] md:items-end md:gap-16"><div><p className="text-[9px] uppercase tracking-[.24em] text-[#c5ab8e]">A NOTE FROM ETLEVA</p><h2 className="font-editorial mt-5 text-4xl font-light leading-[1.03] tracking-[-.035em] sm:text-5xl">A little more<br/>meaning in the<br/>everyday.</h2></div><div className="md:pb-1"><p className="max-w-[610px] text-sm leading-7 text-white/70 sm:text-base sm:leading-8">ETLEVA is a modern shopping destination built around considered choices. We bring together pieces that feel special without asking for a special occasion — thoughtful design, lasting appeal and room for your own point of view.</p><Link to="/products" className="mt-8 inline-flex items-center gap-3 border-b border-white/45 pb-2 text-[10px] uppercase tracking-[.17em] transition-colors hover:border-white">Find your next favourite <ArrowUpRight size={14}/></Link></div></div></section>
}
