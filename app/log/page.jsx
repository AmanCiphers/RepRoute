'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { OverloadSuggestion } from '@/components/progressive-overload'
import { CalendarDays, CheckCircle, Trash2 } from 'lucide-react'
import { timeAgo } from '@/lib/dates'

export default function LogPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
      <div className="size-6 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
    </div>}>
      <LogPage />
    </Suspense>
  )
}

function LogPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(dateParam || today)
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [planDays, setPlanDays] = useState([])
  const [dayExercises, setDayExercises] = useState([])
  const [exercises, setExercises] = useState([])
  const [sets, setSets] = useState({})
  const [saving, setSaving] = useState(false)
  const [existingSession, setExistingSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [pastSessions, setPastSessions] = useState([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    Promise.all([
      supabase.from('workout_plans').select('*').eq('user_id', user.id),
      supabase.from('exercises').select('*').or(`user_id.eq.${user.id},user_id.is.null`),
      supabase.from('workout_sessions').select('*, workout_plans(name)').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
    ]).then(([plansRes, exRes, sessionsRes]) => {
      if (plansRes.data) setPlans(plansRes.data)
      if (exRes.data) setExercises(exRes.data)
      if (sessionsRes.data) setPastSessions(sessionsRes.data)
      setLoading(false)
    })
  }, [user, authLoading, router])

  useEffect(() => {
    if (!selectedPlanId) return
    supabase
      .from('plan_days')
      .select('*, day_exercises:day_exercises(id)')
      .eq('plan_id', selectedPlanId)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setPlanDays(data)
      })
  }, [selectedPlanId])

  async function selectDay(day) {
    setSelectedDay(day)
    setDayExercises([])
    setSets({})
    setExistingSession(null)

    const { data: dayExData } = await supabase
      .from('day_exercises')
      .select('*')
      .eq('day_id', day.id)
      .order('sort_order')

    if (!dayExData || dayExData.length === 0) return
    setDayExercises(dayExData)

    const session = await findSessionForDay({
      userId: user.id,
      planId: selectedPlanId,
      date: selectedDate,
      dayExerciseIds: dayExData.map((item) => item.id),
    })

    if (session) {
      setExistingSession(session)
      const { data: existingSets } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('session_id', session.id)
        .in('day_exercise_id', dayExData.map((item) => item.id))
        .order('set_number')

      if (existingSets && existingSets.length > 0) {
        const grouped = {}
        existingSets.forEach((s) => {
          if (!grouped[s.day_exercise_id]) grouped[s.day_exercise_id] = []
          grouped[s.day_exercise_id].push(s)
        })
        setSets(grouped)
      } else {
        initNewSets(dayExData)
      }
    } else {
      initNewSets(dayExData)
    }
  }

  async function findSessionForDay({ userId, planId, date, dayExerciseIds }) {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('date', date)
      .order('id', { ascending: false })

    if (!sessions || sessions.length === 0) return null
    if (!dayExerciseIds.length) return sessions[0]

    const { data: matchingSets } = await supabase
      .from('exercise_sets')
      .select('session_id, day_exercise_id')
      .in('session_id', sessions.map((session) => session.id))
      .in('day_exercise_id', dayExerciseIds)

    if (!matchingSets || matchingSets.length === 0) return null

    const sessionMatchCounts = matchingSets.reduce((acc, set) => {
      acc[set.session_id] = (acc[set.session_id] || 0) + 1
      return acc
    }, {})

    return sessions.find((session) => sessionMatchCounts[session.id] > 0) || sessions[0]
  }

  function sanitizeSetForInsert(set, sessionId) {
    return {
      session_id: sessionId,
      day_exercise_id: set.day_exercise_id,
      set_number: set.set_number,
      reps: Number(set.reps || 0),
      weight: Number(set.weight || 0),
    }
  }

  function initNewSets(exercisesList) {
    const newSets = {}
    exercisesList.forEach((de) => {
      newSets[de.id] = Array.from({ length: de.target_sets }, (_, i) => ({
        _local: true,
        day_exercise_id: de.id,
        set_number: i + 1,
        reps: de.target_reps,
        weight: 0,
      }))
    })
    setSets(newSets)
  }

  function updateSet(dayExerciseId, setNumber, field, value) {
    setSets((prev) => ({
      ...prev,
      [dayExerciseId]: (prev[dayExerciseId] || []).map((s) =>
        s.set_number === setNumber ? { ...s, [field]: value } : s
      ),
    }))
  }

  async function saveSession() {
    setSaving(true)
    const allSets = Object.values(sets).flat()
    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

    try {
      if (existingSession) {
        const { error: delErr } = await supabase.from('exercise_sets').delete().eq('session_id', existingSession.id)
        if (delErr) { alert('Delete error: ' + delErr.message); setSaving(false); return }

        const { error: insErr } = await supabase.from('exercise_sets').insert(
          allSets.map((set) => sanitizeSetForInsert(set, existingSession.id))
        )
        if (insErr) { alert('Insert error: ' + insErr.message) }
        setPastSessions((prev) =>
          prev.map((session) => (
            session.id === existingSession.id
              ? {
                  ...session,
                  date: selectedDate,
                  workout_plans: selectedPlan
                    ? { name: selectedPlan.name }
                    : session.workout_plans || null,
                }
              : session
          ))
        )
      } else {
        const { data: newSession, error: sessErr } = await supabase
          .from('workout_sessions')
          .insert({ user_id: user.id, plan_id: selectedPlanId, date: selectedDate })
          .select()
          .single()

        if (sessErr) { alert('Session error: ' + sessErr.message); setSaving(false); return }

        if (newSession) {
          setExistingSession(newSession)
          const { error: insErr } = await supabase.from('exercise_sets').insert(
            allSets.map((set) => sanitizeSetForInsert(set, newSession.id))
          )
          if (insErr) { alert('Sets insert error: ' + insErr.message) }
          setPastSessions((prev) => [
            { ...newSession, workout_plans: selectedPlan ? { name: selectedPlan.name } : null },
            ...prev.filter((session) => session.id !== newSession.id),
          ])
        }
      }
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setSaving(false)
  }

  async function deleteSession(id) {
    await supabase.from('exercise_sets').delete().eq('session_id', id)
    await supabase.from('workout_sessions').delete().eq('id', id).eq('user_id', user.id)
    setPastSessions((prev) => prev.filter((s) => s.id !== id))
    if (existingSession?.id === id) {
      setExistingSession(null)
      setDayExercises([])
      setSets({})
      setSelectedDay(null)
    }
  }

  const alreadyLogged = !!existingSession

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
        <div className="size-6 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-8 sm:px-10 sm:py-10 lg:px-20 xl:px-28">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
            Workout Log
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Log your session
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
            Pick a plan and day. Your exercises load with pre-set sets — suggestions show based on your last session.
          </p>
        </div>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {/* Step 1: Date & Plan */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="flex items-center gap-2 rounded-md border border-[#d9d8d2] bg-white px-3">
              <CalendarDays className="size-5 shrink-0 text-[#62615d]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedDay(null); setDayExercises([]); setSets({}); setExistingSession(null) }}
                className="h-12 w-full border-0 bg-transparent px-0 text-base font-semibold outline-none sm:h-11 sm:text-sm"
              />
            </div>

            <select
              value={selectedPlanId || ''}
              onChange={(e) => { setSelectedPlanId(e.target.value ? Number(e.target.value) : null); setSelectedDay(null); setDayExercises([]); setSets({}); setExistingSession(null) }}
              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-11 sm:w-auto sm:text-sm"
            >
              <option value="">Select a plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Pick a day */}
          {selectedPlanId && planDays.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-bold text-[#62615d]">Select a day to log:</p>
              <div className="flex flex-wrap gap-2">
                {planDays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => selectDay(day)}
                    className={`h-11 px-5 text-sm font-black transition ${
                      selectedDay?.id === day.id
                        ? 'bg-[#171717] text-white'
                        : 'border border-[#d9d8d2] bg-white text-[#171717] hover:border-[#171717]'
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlanId && planDays.length === 0 && (
            <div className="rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center sm:p-8">
              <p className="font-semibold text-[#55544f]">
                This plan has no days yet.{' '}
                <Link href={`/plans/${selectedPlanId}`} className="underline underline-offset-4 text-[#171717] hover:text-[#62615d]">
                  Add days and exercises
                </Link>
              </p>
            </div>
          )}

          {selectedDay && dayExercises.length === 0 && (
            <div className="rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center sm:p-8">
              <p className="font-semibold text-[#55544f]">
                This day has no exercises.{' '}
                <Link href={`/plans/${selectedPlanId}`} className="underline underline-offset-4 text-[#171717] hover:text-[#62615d]">
                  Add exercises to {selectedDay.name}
                </Link>
              </p>
            </div>
          )}

          {/* Already logged banner */}
          {alreadyLogged && (
            <div className="rounded-md bg-[#2f2f2d] p-4 text-white flex items-center gap-3">
              <CheckCircle className="size-5 shrink-0" />
              <div>
                <p className="font-black">Session logged for {selectedDate}</p>
                <p className="text-sm font-semibold text-white/70">
                  You can still edit the numbers below and re-save.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Log sets */}
          {dayExercises.length > 0 && (
            <div className="space-y-5 sm:space-y-6">
              {dayExercises.map((de) => {
                const exercise = exercises.find((e) => e.id === de.exercise_id)
                const exerciseSets = sets[de.id] || []

                return (
                  <div key={de.id} className="rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:p-5">
                    <h3 className="text-lg font-black text-[#171717] sm:text-xl">
                      {exercise?.name || 'Unknown'}
                      <span className="ml-2 text-sm font-semibold text-[#77766f]">
                        target: {de.target_sets} &times; {de.target_reps}
                      </span>
                    </h3>

                    <OverloadSuggestion dayExercise={de} sessionId={existingSession?.id} />

                    <div className="mt-4">
                      <div className="grid grid-cols-[2.5rem_1fr_1fr] sm:grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3 px-1 pb-2 text-xs font-black uppercase tracking-wider text-[#77766f]">
                        <span>Set</span>
                        <span>Weight</span>
                        <span>Reps</span>
                      </div>
                      <div className="grid gap-2">
                        {exerciseSets.map((set) => (
                          <div key={set.set_number} className="grid grid-cols-[2.5rem_1fr_1fr] sm:grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3 items-center">
                            <span className="text-center text-sm font-bold text-[#62615d]">
                              {set.set_number}
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              placeholder="kg"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(de.id, set.set_number, 'weight', Number(e.target.value))}
                              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-10 sm:text-sm"
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="reps"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(de.id, set.set_number, 'reps', Number(e.target.value))}
                              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-10 sm:text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={saveSession}
                disabled={saving}
                className="h-12 w-full bg-[#171717] text-sm font-black text-white transition hover:bg-[#2f2f2d] disabled:opacity-50"
              >
                {saving ? 'Saving...' : alreadyLogged ? 'Update Session' : 'Save Session'}
              </button>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div className="border-t border-[#d9d8d2] pt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black sm:text-xl">Past Sessions</h2>
                <Link href="/summary" className="text-sm font-black underline underline-offset-4">
                  Full summary
                </Link>
              </div>
              <div className="grid gap-2">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#171717]">
                        {session.workout_plans?.name || 'Workout'}
                      </p>
                      <p className="text-sm font-semibold text-[#77766f]">
                        {timeAgo(session.date)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="shrink-0 p-2 text-[#77766f] hover:text-[#c00]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
