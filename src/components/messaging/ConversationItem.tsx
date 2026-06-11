import { Link } from 'react-router-dom'
import type { Conversation } from '../../types/message'
import { getOtherParticipant } from '../../utils/conversationDisplay'
import { formatConversationTime } from '../../utils/messageDisplay'
import { ROUTES } from '../../routes/paths'

type ConversationItemProps = {
  conversation: Conversation
  currentUserId: string
  isActive?: boolean
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive = false,
}: ConversationItemProps) {
  const other = getOtherParticipant(conversation, currentUserId)
  const hasUnread = (conversation.unreadCount ?? 0) > 0

  return (
    <Link
      to={ROUTES.chat(conversation.id)}
      state={{ conversation }}
      className={
        isActive
          ? 'flex items-center gap-md border-b border-outline-variant bg-surface-container-low p-md transition-colors last:border-0'
          : 'flex items-center gap-md border-b border-outline-variant p-md transition-colors hover:bg-surface-container-low last:border-0'
      }
    >
      <div className="relative shrink-0">
        {other?.avatar ? (
          <img
            src={other.avatar}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border border-outline-variant bg-surface-container-high" />
        )}
        {hasUnread && (
          <div className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-surface-container-lowest bg-[#4ade80]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-sm">
          <h3 className="truncate font-headline-md text-headline-md text-on-surface">
            {other?.name ?? 'Conversation'}
          </h3>
          <span className="shrink-0 text-[12px] text-on-surface-variant">
            {formatConversationTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center gap-xs">
          {conversation.listingTitle && (
            <span className="rounded bg-surface-container-high px-xs text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              {conversation.listingTitle}
            </span>
          )}
          <p className="truncate text-body-md text-on-surface-variant">
            {conversation.lastMessageText}
          </p>
        </div>
      </div>

      {hasUnread && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
      )}
    </Link>
  )
}
