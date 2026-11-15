import { useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // The current backend has no newsletter endpoint, so do not claim a subscription was saved.
    setSubmitted(true)
  }
  return <section className="bg-[#efede6] px-5 py-16 md:px-9 md:py-20 lg:px-14"><div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_1fr] md:items-end"><div><p className="eyebrow">LETTERS FROM ETLEVA</p><h2 className="font-editorial mt-3 text-4xl font-light tracking-[-.035em] text-[#292720] sm:text-5xl">A considered note.</h2><p className="mt-4 max-w-[450px] text-sm leading-6 text-[#706c63]">Occasional inspiration, new arrivals and stories from our world.</p></div><div><form onSubmit={submit} className="flex border-b border-[#79756b] pb-2"><label htmlFor="newsletter-email" className="sr-only">Email address</label><input id="newsletter-email" type="email" required value={email} onChange={(event) => {setEmail(event.target.value);setSubmitted(false)}} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#8d897f]"/><button aria-label="Join the mailing list" className="flex items-center gap-2 pl-3 text-[10px] uppercase tracking-[.15em] transition-opacity hover:opacity-60">Join <ArrowRight size={15}/></button></form><p role={submitted ? 'status' : undefined} className="mt-3 text-[10px] leading-5 text-[#77736a]">{submitted ? 'Thanks for your interest. Newsletter sign-ups are not available yet.' : 'A preview only — sign-ups are not connected to the store yet.'}</p></div></div></section>
}
