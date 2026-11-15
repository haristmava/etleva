
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight } from 'lucide-react'

export default function Hero() {
  return <section className="hero-campaign relative isolate flex min-h-[590px] items-end overflow-hidden bg-[#4d4942] text-white sm:min-h-[660px] lg:min-h-[min(760px,calc(100svh-108px))]">
    <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=90" alt="Model wearing a modern, understated look" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_35%]"/>
    <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(23,22,19,.73)_0%,rgba(23,22,19,.45)_40%,rgba(23,22,19,.04)_100%)]"/>
    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-end gap-12 px-5 pb-14 pt-24 sm:px-9 sm:pb-16 lg:grid-cols-[1fr_auto] lg:px-14 lg:pb-[5.5rem]">
      <div className="max-w-[680px]"><p className="reveal-up text-[10px] font-medium uppercase tracking-[.26em] text-white/80">ETLEVA — THE NEW SEASON</p><h1 className="font-editorial reveal-up mt-6 text-[clamp(3.5rem,8vw,7.8rem)] font-light leading-[.88] tracking-[-.055em] [animation-delay:100ms]">Quietly<br/>unforgettable.</h1><p className="reveal-up mt-7 max-w-[410px] text-sm leading-7 text-white/80 [animation-delay:180ms] sm:text-base">Pieces with presence. A considered edit for the way you move through every day.</p><div className="reveal-up mt-8 flex flex-wrap items-center gap-3 [animation-delay:260ms]"><Link to="/products" className="group inline-flex min-h-12 items-center gap-8 bg-[#c8bba7] px-5 text-[10px] uppercase tracking-[.16em] text-[#27251f] transition-colors hover:bg-[#d5c9b7]">Discover the collection <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></Link><Link to="/products?isNew=true" className="inline-flex min-h-12 items-center border border-white/55 px-5 text-[10px] uppercase tracking-[.16em] transition-colors hover:bg-white/10">Explore new arrivals</Link></div></div>
      <a href="#categories" className="hidden items-center gap-3 text-[9px] uppercase tracking-[.18em] text-white/75 transition-colors hover:text-white lg:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50"><ArrowDown size={14}/></span>Scroll to explore</a>
    </div>
    <div aria-hidden="true" className="absolute bottom-5 right-6 hidden text-[9px] tracking-[.2em] text-white/65 sm:block lg:right-12">COLLECTION Nº 01</div>
  </section>
}
