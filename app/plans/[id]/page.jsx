'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function PlanDetailPageWrapper() {
  return (
    <PlanDetailPage />
  )
}

function PlanDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [plan, setPlan] = useState(null)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDayName, setNewDayName] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    supabase
      .from('workout_plans')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (!data) { router.push('/plans'); return }
        setPlan(data)
      })

    supabase
      .from('plan_days')
      .select('*')
      .eq('plan_id', params.id)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setDays(data)
      })

    setLoading(false)
  }, [user, authLoading, router, params.id])

  async function addDay(e) {
    e.preventDefault()
    if (!newDayName.trim()) return

    const sort_order = days.length
    const { data } = await supabase
      .from('plan_days')
      .insert({ plan_id: params.id, name: newDayName.trim(), sort_order })
      .select()
      .single()

    if (data) {
      setDays([...days, data])
      setNewDayName('')
    }
  }

  async function deleteDay(dayId) {
    await supabase.from('day_exercises').delete().eq('day_id', dayId)
    await supabase.from('plan_days').delete().eq('id', dayId)
    setDays(days.filter((d) => d.id !== dayId))
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
        <div className="size-6 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-5 sm:px-10 sm:py-6 lg:px-20 xl:px-28">
        <Link
          href="/plans"
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#62615d] hover:text-[#171717]"
        >
          <ArrowLeft className="size-4" />
          Back to plans
        </Link>
        <h1 className="text-3xl font-black leading-[0.95] sm:text-5xl">{plan.name}</h1>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl space-y-6">
          <form onSubmit={addDay} className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Day name (e.g. Push Day)"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-11 sm:flex-1 sm:text-sm"
            />
            <button
              type="submit"
              disabled={!newDayName.trim()}
              className="h-12 w-full border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] disabled:opacity-50 sm:h-11 sm:w-fit"
            >
              <Plus className="inline size-4 mr-1" />
              Add day
            </button>
          </form>

          {days.length === 0 ? (
            <p className="py-10 text-center font-semibold text-[#55544f]">
              No days yet. Add your first training day above.
            </p>
          ) : (
            <div className="grid gap-4">
              {days.map((day) => (
                <DayCard key={day.id} day={day} onDelete={deleteDay} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function DayCard({ day, onDelete }) {
  const [dayExercises, setDayExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [targetSets, setTargetSets] = useState(3)
  const [targetReps, setTargetReps] = useState(10)
  const [allExercises, setAllExercises] = useState([])
  const [exercisesLoaded, setExercisesLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('day_exercises')
      .select('*')
      .eq('day_id', day.id)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setDayExercises(data)
      })

    supabase.from('exercises').select('*').then(({ data }) => {
      if (data) setAllExercises(data)
      setExercisesLoaded(true)
    })
  }, [day.id])

  async function addExercise(e) {
    e.preventDefault()
    if (!selectedExercise) return

    const sort_order = dayExercises.length
    const { data } = await supabase
      .from('day_exercises')
      .insert({
        day_id: day.id,
        exercise_id: selectedExercise,
        target_sets: targetSets,
        target_reps: targetReps,
        sort_order,
      })
      .select()
      .single()

    if (data) {
      setDayExercises([...dayExercises, data])
      setSelectedExercise('')
    }
  }

  async function deleteExercise(id) {
    await supabase.from('exercise_sets').delete().eq('day_exercise_id', id)
    await supabase.from('day_exercises').delete().eq('id', id)
    setDayExercises(dayExercises.filter((e) => e.id !== id))
  }

  return (
    <div className="rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-[#171717] sm:text-xl">{day.name}</h3>
        <button
          onClick={() => onDelete(day.id)}
          className="shrink-0 p-2 text-[#77766f] hover:text-[#c00]"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {dayExercises.length === 0 && (
          <p className="text-sm font-semibold text-[#77766f]">
            No exercises yet. Add one below.
          </p>
        )}
        {dayExercises.map((de) => {
          const exercise = allExercises.find((e) => e.id === de.exercise_id)
          return (
            <div
              key={de.id}
              className="flex items-center justify-between rounded-md border border-[#d9d8d2] bg-white p-3"
            >
              <div className="min-w-0 flex-1 font-bold text-[#171717]">
                {exercise?.name || 'Unknown'}
                <span className="ml-2 text-sm font-semibold text-[#77766f]">
                  {de.target_sets} &times; {de.target_reps}
                </span>
              </div>
              <button
                onClick={() => deleteExercise(de.id)}
                className="shrink-0 p-1 text-[#77766f] hover:text-[#c00]"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {exercisesLoaded && allExercises.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-[#d9d8d2] bg-white p-4 text-center">
          <p className="text-sm font-semibold text-[#55544f]">
            No exercises in your library yet.{' '}
            <Link href="/exercises" className="underline underline-offset-4 text-[#171717] hover:text-[#62615d]">
              Add some exercises first
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={addExercise} className="mt-4 flex flex-wrap gap-2">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="h-11 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-9 sm:flex-1 sm:text-sm"
          >
            <option value="">Select exercise</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              type="number"
              placeholder="Sets"
              value={targetSets}
              onChange={(e) => setTargetSets(Number(e.target.value))}
              className="h-11 flex-1 border border-[#d9d8d2] bg-white px-2 text-base font-semibold text-center outline-none focus:border-[#171717] sm:h-9 sm:w-16 sm:text-sm"
            />
            <input
              type="number"
              placeholder="Reps"
              value={targetReps}
              onChange={(e) => setTargetReps(Number(e.target.value))}
              className="h-11 flex-1 border border-[#d9d8d2] bg-white px-2 text-base font-semibold text-center outline-none focus:border-[#171717] sm:h-9 sm:w-16 sm:text-sm"
            />
            <button
              type="submit"
              disabled={!selectedExercise}
              className="h-11 flex-1 border border-[#171717] bg-[#171717] px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] disabled:opacity-50 sm:h-9 sm:flex-none"
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
