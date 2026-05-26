'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { TrendingUp, Target, Zap } from 'lucide-react'
import { timeAgo } from '@/lib/dates'

export function OverloadSuggestion({ dayExercise, sessionId }) {
  const { user } = useAuth()
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    if (!user || !dayExercise) return

    async function fetchLastSession() {
      const { data: dayExIds } = await supabase
        .from('day_exercises')
        .select('id')
        .eq('exercise_id', dayExercise.exercise_id)

      if (!dayExIds || dayExIds.length === 0) {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
        return
      }

      const deIds = dayExIds.map((d) => d.id)

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!sessions || sessions.length === 0) {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
        return
      }

      const sessIds = sessionId
        ? sessions.filter((s) => s.id !== sessionId).map((s) => s.id)
        : sessions.map((s) => s.id)

      if (sessIds.length === 0) {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
        return
      }

      const { data: candidateSets } = await supabase
        .from('exercise_sets')
        .select('reps, weight, session_id, day_exercise_id')
        .in('session_id', sessIds)
        .in('day_exercise_id', deIds)
        .order('session_id', { ascending: false })
        .order('set_number', { ascending: true })

      if (!candidateSets || candidateSets.length === 0) {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
        return
      }

      const latestSessionId = candidateSets[0].session_id
      const lastSetsData = candidateSets
        .filter((set) => set.session_id === latestSessionId)
        .map((set) => ({ reps: set.reps, weight: set.weight }))

      if (lastSetsData.length === 0) {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
        return
      }

      const session = sessions.find((s) => s.id === latestSessionId)
      const sessionDate = session?.date

      const allHitTarget = lastSetsData.every(
        (s) => Number(s.reps || 0) >= dayExercise.target_reps
      )

      const bestWeight = Math.max(...lastSetsData.map((s) => Number(s.weight || 0)))

      if (allHitTarget && bestWeight > 0) {
        const nextWeight = Math.ceil((bestWeight + 2.5) / 2.5) * 2.5
        setSuggestion({
          type: 'increase',
          message: `Progressive overload hit! Last time (${timeAgo(sessionDate)}): ${bestWeight} kg \u00d7 ${dayExercise.target_reps}. Go for ${nextWeight} kg \u00d7 ${dayExercise.target_reps} this session.`,
        })
      } else if (bestWeight > 0) {
        const repSummary = lastSetsData.map((s) => `${s.reps || 0}`).join(', ')
        setSuggestion({
          type: 'push',
          message: `Last session (${timeAgo(sessionDate)}): ${bestWeight} kg — reps: ${repSummary}. Hit ${dayExercise.target_reps} on all ${dayExercise.target_sets} sets to unlock the next weight.`,
        })
      } else {
        setSuggestion({
          type: 'baseline',
          message: `Hit ${dayExercise.target_reps} reps on all ${dayExercise.target_sets} sets to establish your baseline.`,
        })
      }
    }

    fetchLastSession()
  }, [user, dayExercise, sessionId])

  if (!suggestion) return null

  const colors = {
    baseline: 'bg-[#efeee8] text-[#55544f]',
    push: 'bg-[#2f2f2d] text-white',
    increase: 'bg-[#171717] text-white',
  }

  const icons = {
    baseline: Target,
    push: TrendingUp,
    increase: Zap,
  }

  const Icon = icons[suggestion.type]

  return (
    <div className={`mt-3 rounded-md p-3 text-sm font-semibold flex items-start gap-2 ${colors[suggestion.type]}`}>
      <Icon className="size-4 mt-0.5 shrink-0" />
      <span>{suggestion.message}</span>
    </div>
  )
}
