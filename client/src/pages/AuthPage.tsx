
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const { signIn, signUp } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const requestedRedirect = new URLSearchParams(location.search).get('redirect') || '/account'
  let redirect = '/account'
  try {
    const target = new URL(requestedRedirect, window.location.origin)
    if (target.origin === window.location.origin) {
      redirect = `${target.pathname}${target.search}${target.hash}`
    }
  } catch {
    // Keep the safe in-app default for malformed redirect values.
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      if (isRegister) {
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }

      navigate(redirect, { replace: true })
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  const input =
    'mt-2 w-full rounded-sm border border-[#d8cec1] bg-[#faf8f4] px-4 py-3.5 text-sm text-[#302b25] placeholder:text-[#aaa095] outline-none transition-all duration-300 focus:border-[#a66c4b] focus:bg-white focus:ring-2 focus:ring-[#b77955]/15'

  return (
    <main className="min-h-[calc(100svh-80px)] bg-[#f5f1ea] px-4 py-10 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-14">
      <div className="mx-auto grid w-full max-w-[1150px] overflow-hidden bg-white shadow-[0_25px_80px_rgba(50,40,30,0.10)] lg:min-h-[690px] lg:grid-cols-[1fr_0.9fr]">

        {/* Editorial image panel */}
        <section className="group relative hidden overflow-hidden bg-[#494137] text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85"
            alt="ETLEVA editorial fashion collection"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#171511]/85 via-[#171511]/15 to-[#171511]/10" />

          <div className="absolute left-10 top-10">
            <span className="text-xs font-medium tracking-[0.35em]">ETLEVA</span>
            <div className="mt-3 h-px w-12 bg-[#d7b99c]" />
          </div>

          <div className="absolute bottom-12 left-10 right-10">
            <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-[#e2c9ae]">
              THE ART OF EVERYDAY STYLE
            </p>

            <h2 className="font-editorial max-w-md text-6xl font-light leading-[0.95] tracking-[-0.04em] xl:text-7xl">
              Style that
              <br />
              speaks quietly.
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
              Discover considered pieces, timeless details and a collection
              designed to become part of your everyday story.
            </p>

            <div className="mt-9 flex items-center gap-3">
              <span className="h-px w-10 bg-[#d7b99c]" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/70">
                ETLEVA — COLLECTION Nº 01
              </span>
            </div>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="auth-form-enter w-full max-w-[390px]">

            <div className="mb-10 lg:hidden">
              <p className="text-sm font-semibold tracking-[0.3em] text-[#302b25]">
                ETLEVA
              </p>
              <div className="mt-3 h-px w-10 bg-[#b77955]" />
            </div>

            <div className="mb-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a66c4b]">
                {isRegister ? 'JOIN THE ETLEVA WORLD' : 'WELCOME BACK'}
              </p>

              <h1 className="font-editorial mt-4 text-5xl font-light leading-tight tracking-[-0.045em] text-[#302b25] sm:text-6xl">
                {isRegister ? (
                  <>Create your<br />account.</>
                ) : (
                  <>Good to<br />see you.</>
                )}
              </h1>

              <p className="mt-4 text-sm leading-7 text-[#81776c]">
                {isRegister
                  ? 'Create an account to enjoy a more personal shopping experience.'
                  : 'Sign in to access your account, orders and personal details.'}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">

              {isRegister && (
                <label className="auth-field-enter block text-xs font-medium tracking-wide text-[#50483f]">
                  Full name
                  <input
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={50}
                    placeholder="Your full name"
                    className={input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}

              <label className="auth-field-enter block text-xs font-medium tracking-wide text-[#50483f] [animation-delay:100ms]">
                Email address
                <input
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="auth-field-enter block text-xs font-medium tracking-wide text-[#50483f] [animation-delay:200ms]">
                Password
                <div className="relative">
                  <input
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    type={visible ? 'text' : 'password'}
                    required
                    minLength={isRegister ? 8 : 1}
                    placeholder="Enter your password"
                    className={`${input} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8174] transition-colors hover:text-[#a66c4b]"
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {isRegister && (
                  <span className="mt-2 block text-[11px] text-[#958a7f]">
                    Use at least 8 characters.
                  </span>
                )}
              </label>

              {error && (
                <p
                  role="alert"
                  className="animate-[shake_.35s_ease-in-out] border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="auth-button-enter group mt-3 flex min-h-[54px] w-full items-center justify-between bg-[#a96342] px-6 text-[11px] font-semibold uppercase tracking-[0.17em] text-white shadow-[0_8px_20px_rgba(169,99,66,0.20)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#8e4e32] hover:shadow-[0_13px_28px_rgba(169,99,66,0.30)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>
                  {busy
                    ? 'Please wait...'
                    : isRegister
                      ? 'Create account'
                      : 'Sign in'}
                </span>

                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3 border-t border-[#eee8df] pt-6">
              <ShieldCheck size={17} className="shrink-0 text-[#a66c4b]" />
              <p className="text-[11px] leading-5 text-[#958a7f]">
                Your account information is handled securely.
              </p>
            </div>

            <p className="mt-8 text-center text-sm text-[#81776c]">
              {isRegister ? 'Already have an account?' : 'New to ETLEVA?'}{' '}
              <Link
                className="font-semibold text-[#a05e40] underline decoration-[#d6b29d] underline-offset-4 transition-colors hover:text-[#713e29]"
                to={`${isRegister ? '/login' : '/register'}${location.search}`}
              >
                {isRegister ? 'Sign in' : 'Create an account'}
              </Link>
            </p>

          </div>
        </section>
      </div>

      <style>{`
        @keyframes authFormEnter {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes authFieldEnter {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .auth-form-enter {
          animation: authFormEnter 750ms cubic-bezier(.2,.7,.2,1) both;
        }

        .auth-field-enter {
          animation: authFieldEnter 650ms cubic-bezier(.2,.7,.2,1) both;
        }

        .auth-button-enter {
          animation: authFormEnter 700ms 350ms cubic-bezier(.2,.7,.2,1) both;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-form-enter,
          .auth-field-enter,
          .auth-button-enter {
            animation: none !important;
          }
          .auth-button-enter,
          .auth-button-enter * {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  )
}
