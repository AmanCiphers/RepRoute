const units = [
  { label: 'year', seconds: 31536000 },
  { label: 'month', seconds: 2592000 },
  { label: 'week', seconds: 604800 },
  { label: 'day', seconds: 86400 },
  { label: 'hour', seconds: 3600 },
  { label: 'minute', seconds: 60 },
]

export function timeAgo(dateInput) {
  const date = new Date(dateInput)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 10) return 'just now'

  const today = now.toISOString().split('T')[0]
  const dateStr = date.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dateStr === today) return 'today'
  if (dateStr === yesterdayStr) return 'yesterday'

  for (const unit of units) {
    const count = Math.floor(seconds / unit.seconds)
    if (count >= 1) {
      return `${count} ${unit.label}${count > 1 ? 's' : ''} ago`
    }
  }

  return date.toLocaleDateString()
}

export function formatDate(dateInput) {
  const date = new Date(dateInput)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
