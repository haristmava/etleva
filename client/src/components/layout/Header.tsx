import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Menu, UserRound, X, ArrowUpRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Shop all', to: '/products' },
  { label: 'New arrivals', to: '/products?isNew=true' },
  { label: 'The categories', to: '/#categories' },
]

export default function Header() {
  const { cartCount } = useCart()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const accountPath = user?.role === 'ADMIN' ? '/admin' : user ? '/account' : '/login'
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    setSearchOpen(false)
    setMenuOpen(false)
    navigate(`/products?search=${encodeURIComponent(value)}`)
  }
  const navClass = ({ isActive }: { isActive: boolean }) => `relative py-2 text-[10px] uppercase tracking-[.17em] text-[#716e66] transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#35332d] after:transition-transform hover:text-[#292720] hover:after:scale-x-100 ${isActive ? 'text-[#292720] after:scale-x-100' : ''}`

  return <header className="sticky top-0 z-50 border-b border-[#e9e6df] bg-[#fbfaf7]/95 backdrop-blur-md">
    <div className="mx-auto max-w-[1500px] px-5 md:px-9 lg:px-14"><div className="relative flex h-[68px] items-center justify-between md:h-[72px]">
      <button type="button" className="flex w-fit items-center gap-2 text-[10px] uppercase tracking-[.16em] text-[#625f58] md:hidden" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={18}/> : <Menu size={19}/>}<span className="hidden min-[380px]:inline">{menuOpen ? 'Close' : 'Menu'}</span></button>
      <button type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)} className="hidden w-fit items-center gap-2 text-[#625f58] transition hover:text-[#1f1e1b] md:flex"><Search size={17} strokeWidth={1.5}/><span className="text-[10px] uppercase tracking-[.16em]">Search</span></button>
      <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-[21px] font-medium tracking-[.31em] text-[#24231f] md:text-[24px]">ETLEVA<span className="text-[#a77950]">.</span></Link>
      <div className="flex items-center gap-4 md:gap-6"><Link to={accountPath} aria-label={user ? 'Your account' : 'Sign in'} className="text-[#625f58] transition hover:text-[#1f1e1b]"><UserRound size={19} strokeWidth={1.5}/></Link><Link to="/cart" aria-label={`Shopping bag, ${cartCount} items`} className="relative text-[#625f58] transition hover:text-[#1f1e1b]"><ShoppingBag size={19} strokeWidth={1.5}/><span className="absolute -right-2.5 -top-2.5 min-w-4 bg-[#a77950] px-1 text-center text-[9px] leading-4 text-white">{cartCount > 99 ? '99+' : cartCount}</span></Link></div>
    </div><nav aria-label="Main navigation" className="hidden h-9 items-center justify-center gap-10 md:flex">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/products' || link.to.startsWith('/#')} className={navClass}>{link.label}</NavLink>)}</nav></div>
    {searchOpen && <div className="absolute inset-x-0 top-full border-y border-[#e9e6df] bg-[#fbfaf7] px-5 py-5 shadow-[0_16px_30px_rgba(40,36,28,.08)]"><form onSubmit={submitSearch} className="mx-auto flex max-w-3xl items-center gap-4 border-b border-[#a8a49b] pb-3"><Search size={19} className="text-[#77746e]"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products" placeholder="What are you looking for?" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#99958d] md:text-lg"/><button className="text-[10px] uppercase tracking-[.16em]">Search</button><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={18}/></button></form><div className="mx-auto mt-3 max-w-3xl text-[10px] uppercase tracking-[.12em] text-[#8a867d]">Search the ETLEVA collection</div></div>}
    {menuOpen && <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-t border-[#e9e6df] bg-[#fbfaf7] px-6 py-5 shadow-[0_16px_30px_rgba(40,36,28,.08)] md:hidden"><div className="flex flex-col divide-y divide-[#e9e6df]">{links.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 text-[10px] uppercase tracking-[.17em]">{link.label}<ArrowUpRight size={15}/></NavLink>)}<button onClick={() => {setMenuOpen(false);setSearchOpen(true)}} className="flex items-center gap-3 py-4 text-left text-[10px] uppercase tracking-[.17em]"><Search size={16}/>Search the collection</button></div></nav>}
  </header>
}
