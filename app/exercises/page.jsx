'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Plus } from 'lucide-react'

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Full Body']

export default function ExercisesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    supabase
      .from('exercises')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name')
      .then(({ data }) => {
      if (data) setExercises(data)
      setLoading(false)
      })
  }, [user, authLoading, router])

  async function addExercise(e) {
    e.preventDefault()
    if (!newName.trim()) return

    const { data } = await supabase
      .from('exercises')
      .insert({ name: newName.trim(), muscle_group: newGroup || null, user_id: user.id })
      .select()
      .single()

    if (data) {
      setExercises([...exercises, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setNewGroup('')
    }
  }

  const grouped = muscleGroups.reduce((acc, group) => {
    const filtered = exercises.filter((e) => e.muscle_group === group)
    if (filtered.length > 0) acc[group] = filtered
    return acc
  }, {})

  const ungrouped = exercises.filter((e) => !e.muscle_group)

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
            Exercise Library
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Your exercise list
          </h1>
        </div>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl space-y-8">
          <form onSubmit={addExercise} className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Exercise name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-11 sm:flex-1 sm:text-sm"
            />
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-11 sm:w-auto sm:text-sm"
            >
              <option value="">Muscle group</option>
              {muscleGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="h-12 w-full border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] disabled:opacity-50 sm:h-11 sm:w-fit"
            >
              <Plus className="inline size-4 mr-1" />
              Add
            </button>
          </form>

          {exercises.length === 0 ? (
            <p className="py-10 text-center font-semibold text-[#55544f]">
              No exercises yet. Add your first one above.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, exs]) => (
                <div key={group}>
                  <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#62615d] mb-3">
                    {group}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {exs.map((ex) => (
                      <span
                        key={ex.id}
                        className="rounded-full border border-[#d9d8d2] bg-white px-3 py-1.5 text-sm font-semibold text-[#31312f]"
                      >
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {ungrouped.length > 0 && (
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f] mb-3">
                    Other
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {ungrouped.map((ex) => (
                      <span
                        key={ex.id}
                        className="rounded-full border border-[#d9d8d2] bg-white px-3 py-1.5 text-sm font-semibold text-[#31312f]"
                      >
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
