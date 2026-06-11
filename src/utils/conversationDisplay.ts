import type { Conversation } from '../types/message'

/** Placeholder in seed data — replaced with the signed-in user's id at runtime. */
export const CURRENT_USER_PLACEHOLDER = 'CURRENT_USER'

export function resolveParticipantIds(
  participantIds: string[],
  currentUserId: string,
): string[] {
  return participantIds.map((id) =>
    id === CURRENT_USER_PLACEHOLDER ? currentUserId : id,
  )
}

/** Other participant in a 1:1 thread for inbox/chat headers. */
export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string,
): { id: string; name: string; avatar?: string } | null {
  const index = conversation.participantIds.findIndex((id) => id !== currentUserId)
  if (index < 0) return null

  return {
    id: conversation.participantIds[index]!,
    name: conversation.participantNames[index] ?? 'Unknown',
    avatar: conversation.participantAvatars?.[index],
  }
}
