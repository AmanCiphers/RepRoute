'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Calendar, Trash2, Pencil } from 'lucide-react'
import { timeAgo } from '@/lib/dates'

export default function SummaryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [exercises, setExercises] = useState([])
  const [dayExerciseMap, setDayExerciseMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    Promise.all([
      supabase.from('workout_sessions').select('*, workout_plans(name)').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('exercises').select('*').or(`user_id.eq.${user.id},user_id.is.null`),
      supabase.from('day_exercises').select('id, exercise_id'),
    ]).then(([sessionsRes, exRes, dayExercisesRes]) => {
      if (sessionsRes.data) setSessions(sessionsRes.data)
      if (exRes.data) setExercises(exRes.data)
      if (dayExercisesRes.data) {
        const nextMap = {}
        dayExercisesRes.data.forEach((dayExercise) => {
          nextMap[dayExercise.id] = dayExercise
        })
        setDayExerciseMap(nextMap)
      }
      setLoading(false)
    })
  }, [user, authLoading, router])

  async function deleteSession(id) {
    await supabase.from('exercise_sets').delete().eq('session_id', id)
    await supabase.from('workout_sessions').delete().eq('id', id).eq('user_id', user.id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
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
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-8 sm:px-10 sm:py-10 lg:px-20 xl:px-28">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
            Summary
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            All sessions
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
            Every workout you&apos;ve logged, with full set-by-set details.
          </p>
        </div>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl space-y-4">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center sm:p-12">
              <Calendar className="size-10 text-[#77766f]" />
              <p className="font-semibold text-[#55544f]">
                No sessions logged yet.
              </p>
              <Link
                href="/log"
                className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] sm:h-11 sm:w-fit"
              >
                Log your first session
              </Link>
            </div>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                exercises={exercises}
                dayExerciseMap={dayExerciseMap}
                onDelete={deleteSession}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function SessionCard({ session, exercises, dayExerciseMap, onDelete }) {
  const [sets, setSets] = useState([])

  useEffect(() => {
    supabase.from('exercise_sets').select('*').eq('session_id', session.id).order('set_number').then(({ data }) => {
      if (data) setSets(data)
    })
  }, [session.id])

  async function saveSet(setId, field, value) {
    const num = Number(value)
    if (isNaN(num)) return
    await supabase.from('exercise_sets').update({ [field]: num }).eq('id', setId)
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, [field]: num } : s)))
  }

  const grouped = {}
  sets.forEach((s) => {
    if (!grouped[s.day_exercise_id]) grouped[s.day_exercise_id] = []
    grouped[s.day_exercise_id].push(s)
  })

  return (
    <div className="rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-[#171717] sm:text-xl">
            {session.workout_plans?.name || 'Workout'}
          </h2>
          <p className="text-sm font-semibold text-[#77766f]">
            {timeAgo(session.date)}
          </p>
        </div>
        <button
          onClick={() => onDelete(session.id)}
          className="shrink-0 p-2 text-[#77766f] hover:text-[#c00]"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {Object.entries(grouped).length > 0 ? (
        <div className="mt-4 space-y-3">
          {Object.entries(grouped).map(([dayExId, exerciseSets]) => {
            const de = dayExerciseMap[dayExId]
            const exercise = exercises.find((e) => e.id === de?.exercise_id)
            return (
              <div key={dayExId} className="rounded-md border border-[#d9d8d2] bg-white p-3 sm:p-3">
                <p className="font-bold text-[#171717]">{exercise?.name || 'Unknown'}</p>
                <div className="mt-2 space-y-1">
                  {exerciseSets.map((set) => (
                    <div key={set.id} className="flex items-center gap-2 text-sm font-semibold text-[#55544f]">
                      <span className="w-12 shrink-0 text-[#77766f]">Set {set.set_number}</span>
                      <InlineEdit
                        value={set.weight}
                        onSave={(val) => saveSet(set.id, 'weight', val)}
                        suffix=" kg"
                      />
                      <span className="text-[#77766f]">&times;</span>
                      <InlineEdit
                        value={set.reps}
                        onSave={(val) => saveSet(set.id, 'reps', val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-[#77766f]">No sets logged.</p>
      )}
    </div>
  )
}

function InlineEdit({ value, onSave, suffix = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  function handleSave() {
    setEditing(false)
    if (Number(val) !== Number(value)) onSave(val)
  }

  if (editing) {
    return (
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setVal(value) } }}
        className="w-16 border border-[#171717] bg-white px-2 py-0.5 text-sm font-semibold outline-none"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => {
        setVal(value)
        setEditing(true)
      }}
      className="group inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:bg-[#efeee8]"
    >
      <span>{value || 0}{suffix}</span>
      <Pencil className="size-3 text-[#77766f] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
