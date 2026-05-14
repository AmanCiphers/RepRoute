'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Plus, Dumbbell, Calendar, ArrowUpRight } from 'lucide-react'
import { timeAgo } from '@/lib/dates'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    Promise.all([
      supabase.from('workout_plans').select('*').order('created_at', { ascending: false }),
      supabase.from('workout_sessions').select('*, workout_plans(name)').order('date', { ascending: false }).limit(10),
    ]).then(([plansRes, sessionsRes]) => {
      if (plansRes.data) setPlans(plansRes.data)
      if (sessionsRes.data) setSessions(sessionsRes.data)
      setLoading(false)
    })
  }, [user, authLoading, router])

  async function deleteSession(id) {
    await supabase.from('exercise_sets').delete().eq('session_id', id)
    await supabase.from('workout_sessions').delete().eq('id', id)
    setSessions(sessions.filter((s) => s.id !== id))
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
        <div className="size-6 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[0.95] sm:text-6xl">
              Ready to lift?
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
              Track active plans, recent sessions, and the next weight waiting to fall.
            </p>
          </div>
          <Link
            href="/plans"
            className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] sm:h-11 sm:w-fit"
          >
            <Plus className="size-4" />
            New plan
          </Link>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-[#d9d8d2] pb-4">
                <h2 className="text-lg font-black sm:text-xl">Your Plans</h2>
                <Link href="/plans" className="text-sm font-black underline underline-offset-4">
                  View all
                </Link>
              </div>

              {plans.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center sm:p-10">
                  <Dumbbell className="size-8 text-[#77766f]" />
                  <p className="font-semibold text-[#55544f]">
                    No workout plans yet. Create your first one.
                  </p>
                  <Link
                    href="/plans"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] sm:h-11 sm:w-fit"
                  >
                    Create plan
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {plans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/plans/${plan.id}`}
                      className="flex items-center justify-between rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 transition hover:border-[#171717] sm:p-5"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-[#171717] sm:text-xl">{plan.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-[#77766f]">
                          Created {timeAgo(plan.created_at)}
                        </p>
                      </div>
                      <ArrowUpRight className="size-5 shrink-0 text-[#62615d]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between border-b border-[#d9d8d2] pb-4">
                <h2 className="text-lg font-black sm:text-xl">Recent Sessions</h2>
                <Link href="/summary" className="text-sm font-black underline underline-offset-4">
                  View all
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center sm:p-10">
                  <Calendar className="size-8 text-[#77766f]" />
                  <p className="font-semibold text-[#55544f]">
                    No sessions logged yet.
                  </p>
                  <Link
                    href="/log"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] sm:h-11 sm:w-fit"
                  >
                    Log a session
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-[#171717]">
                          {session.workout_plans?.name || 'Workout'}
                        </p>
                        <p className="text-sm font-semibold text-[#77766f]">
                          {timeAgo(session.date)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="shrink-0 text-xs font-black text-[#77766f] underline underline-offset-4 hover:text-[#c00]"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#62615d]">
                Tip
              </p>
              <h2 className="mt-3 text-lg font-black text-[#171717] sm:text-xl">
                Progressive overload
              </h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#55544f]">
                Aim to add 2.5–5 kg or 1–2 reps each session. Small increases
                compound into big gains over months.
              </p>
            </div>

            <div className="border border-[#171717] bg-[#2f2f2d] p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white/65">
                Quick start
              </p>
              <h2 className="mt-3 text-xl font-black sm:text-2xl">Create a plan and start logging.</h2>
              <Link href="/log" className="mt-6 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
                Go to log
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
