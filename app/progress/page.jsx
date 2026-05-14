'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { timeAgo } from '@/lib/dates'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [exercises, setExercises] = useState([])
  const [selectedExerciseId, setSelectedExerciseId] = useState(null)
  const [volumeData, setVolumeData] = useState([])
  const [rmData, setRmData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    supabase.from('exercises').select('*').then(({ data }) => {
      if (data) setExercises(data)
    })

    loadData()
  }, [user, authLoading, router])

  async function loadData() {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, date')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (!sessions || sessions.length === 0) { setLoading(false); return }

    const sessionIds = sessions.map((s) => s.id)

    const { data: allSets } = await supabase
      .from('exercise_sets')
      .select('*, day_exercises!inner(exercise_id)')
      .in('session_id', sessionIds)
      .order('set_number')

    if (!allSets) { setLoading(false); return }

    // Volume per session
    const volMap = {}
    allSets.forEach((set) => {
      volMap[set.session_id] = (volMap[set.session_id] || 0) + (Number(set.weight || 0) * Number(set.reps || 0))
    })

    setVolumeData(
      sessions
        .filter((s) => volMap[s.id])
        .map((s) => ({
          date: s.date,
          volume: volMap[s.id],
          label: timeAgo(s.date),
        }))
    )

    // 1RM per exercise per session
    const rmMap = {}
    allSets.forEach((set) => {
      const exId = set.day_exercises?.exercise_id
      if (!exId) return
      const epley = Number(set.weight || 0) * (1 + Number(set.reps || 0) / 30)
      if (!rmMap[exId]) rmMap[exId] = {}
      if (!rmMap[exId][set.session_id] || epley > rmMap[exId][set.session_id]) {
        rmMap[exId][set.session_id] = epley
      }
    })

    setRmData({ sessions, rmMap })
    setLoading(false)
  }

  function getRmChartData() {
    if (!rmData.sessions || !selectedExerciseId) return []

    const sessions = rmData.sessions
    const rmMap = rmData.rmMap[selectedExerciseId] || {}

    return sessions
      .filter((s) => rmMap[s.id])
      .map((s) => ({
        date: s.date,
        estimated_1rm: Math.round(rmMap[s.id] * 10) / 10,
        label: timeAgo(s.date),
      }))
  }

  const exercise = exercises.find((e) => e.id === Number(selectedExerciseId))

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-md border border-[#d9d8d2] bg-white p-3 text-sm font-semibold shadow-md">
        <p className="text-[#77766f]">{label}</p>
        <p className="text-[#171717]">{payload[0].value} kg</p>
      </div>
    )
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
            Progress
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Your trends
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
            Watch your volume and estimated 1RM climb over time.
          </p>
        </div>
      </section>

      <section className="px-6 py-6 sm:px-10 sm:py-8 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-3xl space-y-10">
          {volumeData.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#d9d8d2] bg-[#fbfbfa] p-10 text-center">
              <p className="font-semibold text-[#55544f]">
                No data yet. Log some sessions to see your progress.
              </p>
            </div>
          ) : (
            <>
              {/* Volume Chart */}
              <div className="rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:p-6">
                <h2 className="text-lg font-black sm:text-xl">Total Volume</h2>
                <p className="mt-1 text-sm font-semibold text-[#77766f]">Weight × reps per session</p>
                <div className="mt-6 h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d9d8d2" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#77766f' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#77766f' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" fill="#2f2f2d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 1RM Chart */}
              <div className="rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black sm:text-xl">Estimated 1RM</h2>
                    <p className="mt-1 text-sm font-semibold text-[#77766f]">
                      Epley formula: weight × (1 + reps/30)
                    </p>
                  </div>
                  <select
                    value={selectedExerciseId || ''}
                    onChange={(e) => setSelectedExerciseId(e.target.value ? Number(e.target.value) : null)}
                    className="h-11 w-full border border-[#d9d8d2] bg-white px-3 text-sm font-semibold outline-none focus:border-[#171717] sm:h-9 sm:w-auto"
                  >
                    <option value="">Select exercise</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                {selectedExerciseId && getRmChartData().length > 0 ? (
                  <div className="mt-6 h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getRmChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d9d8d2" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#77766f' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#77766f' }} domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="estimated_1rm" stroke="#2f2f2d" strokeWidth={2} dot={{ fill: '#2f2f2d' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : selectedExerciseId ? (
                  <p className="mt-6 text-center font-semibold text-[#55544f]">
                    No data for {exercise?.name}. Log some sets first.
                  </p>
                ) : (
                  <p className="mt-6 text-center font-semibold text-[#55544f]">
                    Select an exercise above to see 1RM trend.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
