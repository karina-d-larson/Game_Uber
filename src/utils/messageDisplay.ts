/** Format epoch millis for inbox preview (e.g. "2:45 PM", "Yesterday"). */
export function formatConversationTime(epochMs: number, now = Date.now()): string {
  const date = new Date(epochMs)
  const today = new Date(now)
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (epochMs >= startOfToday.getTime()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  if (epochMs >= startOfYesterday.getTime()) return 'Yesterday'

  const dayDiff = Math.floor((startOfToday.getTime() - epochMs) / 86_400_000)
  if (dayDiff < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' })
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatMessageTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
