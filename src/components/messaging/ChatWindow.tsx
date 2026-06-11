import { useEffect, useRef } from 'react'
import type { Message } from '../../types/message'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

type ChatWindowProps = {
  messages: Message[]
  currentUserId: string
  loading?: boolean
  onSend: (body: string) => Promise<void>
}

export function ChatWindow({
  messages,
  currentUserId,
  loading = false,
  onSend,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-md overflow-y-auto bg-background px-md py-md"
      >
        {loading && messages.length === 0 ? (
          <p className="text-center text-body-md text-on-surface-variant">Loading messages…</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
      </div>

      <MessageInput onSend={onSend} disabled={loading} />
    </div>
  )
}
