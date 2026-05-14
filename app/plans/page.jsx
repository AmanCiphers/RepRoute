'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Plus, Dumbbell, Trash2, Sparkles, Loader2 } from 'lucide-react'
import templates from '@/lib/templates'

export default function PlansPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    supabase
      .from('workout_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPlans(data)
        setLoading(false)
      })
  }, [user, authLoading, router])

  async function createPlan(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)

    const { data } = await supabase
      .from('workout_plans')
      .insert({ name: newName.trim(), user_id: user.id })
      .select()
      .single()

    if (data) {
      setPlans([data, ...plans])
      setNewName('')
    }
    setCreating(false)
  }

  async function deletePlan(id) {
    await supabase.from('workout_plans').delete().eq('id', id)
    setPlans(plans.filter((p) => p.id !== id))
  }

  async function importTemplate(template) {
    setImporting(template.name)

    const { data: allExercises } = await supabase.from('exercises').select('id, name')

    if (!allExercises) { setImporting(null); return }

    const exerciseMap = {}
    allExercises.forEach((ex) => { exerciseMap[ex.name.toLowerCase()] = ex.id })

    const { data: plan } = await supabase
      .from('workout_plans')
      .insert({ name: template.name, user_id: user.id })
      .select()
      .single()

    if (!plan) { setImporting(null); return }
    setPlans([plan, ...plans])

    for (let i = 0; i < template.days.length; i++) {
      const day = template.days[i]
      const { data: planDay } = await supabase
        .from('plan_days')
        .insert({ plan_id: plan.id, name: day.name, sort_order: i })
        .select()
        .single()

      if (!planDay) continue

      for (let j = 0; j < day.exercises.length; j++) {
        const ex = day.exercises[j]
        const exerciseId = exerciseMap[ex.name.toLowerCase()]
        if (!exerciseId) continue

        await supabase.from('day_exercises').insert({
          day_id: planDay.id,
          exercise_id: exerciseId,
          target_sets: ex.sets,
          target_reps: ex.reps,
          sort_order: j,
        })
      }
    }

    setImporting(null)
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
            Workout Plans
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Your training split
          </h1>
        </div>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={createPlan} className="mb-8 flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Plan name (e.g. Push/Pull/Legs)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-12 w-full border border-[#d9d8d2] bg-white px-3 text-base font-semibold outline-none focus:border-[#171717] sm:h-11 sm:text-sm"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="h-12 w-full border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717] disabled:opacity-50 sm:h-11 sm:w-fit"
            >
              <Plus className="inline size-4 mr-1" />
              Create
            </button>
          </form>

          {/* Templates */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-[#62615d]" />
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#62615d]">
                Quick-start templates
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => importTemplate(template)}
                  disabled={importing === template.name}
                  className="rounded-md border border-[#d9d8d2] bg-white p-4 text-left transition hover:border-[#171717] disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-[#171717]">{template.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#55544f]">{template.desc}</p>
                      <p className="mt-1 text-xs font-semibold text-[#77766f]">
                        {template.days.length} days &middot; {template.days.reduce((s, d) => s + d.exercises.length, 0)} exercises
                      </p>
                    </div>
                    <div className="shrink-0 ml-3 mt-1">
                      {importing === template.name ? (
                        <Loader2 className="size-4 animate-spin text-[#62615d]" />
                      ) : (
                        <Plus className="size-4 text-[#62615d]" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center sm:p-12">
              <Dumbbell className="size-10 text-[#77766f]" />
              <p className="font-semibold text-[#55544f]">
                No plans yet. Use a template above or create one.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 transition hover:border-[#171717] sm:p-5"
                >
                  <Link href={`/plans/${plan.id}`} className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-[#171717] sm:text-xl">{plan.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#77766f]">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="shrink-0 p-2 text-[#77766f] transition hover:text-[#c00]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
