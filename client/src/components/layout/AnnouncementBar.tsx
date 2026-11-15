import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AnnouncementBar() {
  return <div className="bg-[#292720] px-4 py-2 text-center text-[10px] tracking-[0.12em] text-white/85 sm:text-[11px] sm:tracking-[0.18em]"><Link to="/products?isNew=true" className="inline-flex items-center gap-2">A NEW SEASON, A NEW PERSPECTIVE <ArrowRight size={12} aria-hidden="true"/></Link></div>
}
