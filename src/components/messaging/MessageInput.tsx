import { useState, type FormEvent } from 'react'
import { MaterialIcon } from '../MaterialIcon'

type MessageInputProps = {
  onSend: (body: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Message...',
}: MessageInputProps) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || submitting || disabled) return

    setSubmitting(true)
    try {
      await onSend(trimmed)
      setBody('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="flex items-center gap-sm border-t border-outline-variant bg-surface px-md py-sm pb-safe"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || submitting}
        className="boardlink-field min-h-11 flex-1 rounded-full"
        aria-label="Message text"
      />
      <button
        type="submit"
        disabled={disabled || submitting || !body.trim()}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-secondary text-on-secondary transition-opacity disabled:opacity-50"
        aria-label="Send message"
      >
        <MaterialIcon name="send" className="text-xl" />
      </button>
    </form>
  )
}
