import type { Conversation } from '../../types/message'
import { ConversationItem } from './ConversationItem'

type ConversationListProps = {
  conversations: Conversation[]
  currentUserId: string
  activeConversationId?: string
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          isActive={conversation.id === activeConversationId}
        />
      ))}
    </div>
  )
}
