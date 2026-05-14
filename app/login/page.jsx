'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Dumbbell } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-6 text-[#171717]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Dumbbell className="mx-auto size-8 text-[#171717]" />
          <h1 className="mt-4 text-2xl font-black">Welcome back</h1>
          <p className="mt-2 text-sm font-semibold text-[#62615d]">
            Log in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[#171717]">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 h-12 w-full border border-[#d9d8d2] bg-white px-3 font-semibold text-[#171717] outline-none focus:border-[#171717] placeholder:text-[#77766f] sm:h-11"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#171717]">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 h-12 w-full border border-[#d9d8d2] bg-white px-3 font-semibold text-[#171717] outline-none focus:border-[#171717] placeholder:text-[#77766f] sm:h-11"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-[#c00]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#171717] font-black text-white transition hover:bg-[#2f2f2d] disabled:opacity-50 sm:h-11"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-[#62615d]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#171717] underline underline-offset-4 hover:text-[#62615d]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
