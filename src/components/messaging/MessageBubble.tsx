import type { Message } from '../../types/message'

type MessageBubbleProps = {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isOwn
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-md py-sm text-body-md text-on-secondary shadow-sm'
            : 'max-w-[85%] rounded-2xl rounded-bl-md bg-surface-container-high px-md py-sm text-body-md text-on-surface shadow-sm'
        }
      >
        {message.body}
      </div>
    </div>
  )
}
