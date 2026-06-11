import type { Conversation, Message } from '../types/message'
import { CURRENT_USER_PLACEHOLDER } from '../utils/conversationDisplay'

/**
 * Seed messaging data for local dev — imported by messageService.dev only.
 * CURRENT_USER_PLACEHOLDER is replaced with the signed-in user's id at runtime.
 */
export const seedConversations: Conversation[] = [
  {
    id: 'conv-elena-everdell',
    participantIds: [CURRENT_USER_PLACEHOLDER, 'user-elena'],
    participantNames: ['You', 'Elena Vance'],
    participantAvatars: [
      '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwdo9No4CLqmsHOOOsHZwFVqpvIgWLu6f-5wzuToWbVOcDSSxbkDsN4Urbcr_Rpq-FhdCVPeuaLWf8xqa3jeNceGMQc2ftUhUEEDT9VtEfMxcMipj9Ey5t3tj4ovjFc1ortnFIpw0VWJo-aZaf5OJjXw3P-g76hzb5hX5vB2_TTh22sn-CZDo0L9501f7bk7vS9Zo4eKanDWsqRfKrkseoexAntQUjejcUeCbELY7drH6qq6uPyTFrkKB_SCIPn53b8QTQK3H9964',
    ],
    listingId: 'everdell',
    listingTitle: 'Everdell',
    lastMessageText: 'The game is still available. When can you meet?',
    lastMessageAt: Date.now() - 45 * 60_000,
    unreadCount: 1,
  },
  {
    id: 'conv-david-gloomhaven',
    participantIds: [CURRENT_USER_PLACEHOLDER, 'user-david'],
    participantNames: ['You', 'David Miller'],
    participantAvatars: [
      '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB_bP5LbUBYBCP9GfUN39lvLTq3lm3bRrSbBf3lvArSHW-6P_8KNehRM7zPQvPJjE1JHGOaFEPN-YAbRn8NTJLFWlg8SwQZJnBG9XcnEdMwVEXkYISmBJmp_cJKSFetO6pInlzi5-3XyrYpTWJFmagNGfu5wIxbHNcLZIgt4fPjc_TdJBLO6VyKFvRcVlXYYqg0WnPJ8cpxISfuT6AQkLOlW9ip2wjjWqKJhWZHoXSZf8Wy0E44uFdeqSB7VSMeTggaafxnp2YBFC0',
    ],
    listingId: 'gloomhaven',
    listingTitle: 'Gloomhaven',
    lastMessageText: 'Thanks again for the rental! Everything was in the box.',
    lastMessageAt: Date.now() - 86_400_000,
    unreadCount: 0,
  },
  {
    id: 'conv-chloe-scythe',
    participantIds: [CURRENT_USER_PLACEHOLDER, 'user-chloe'],
    participantNames: ['You', 'Chloe Park'],
    participantAvatars: [
      '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwcwWVg3idMuApjkFdlGHdZZws9O-s3ErZ2ANjSUoVZU2wKDD8sRrwFlk09icMS00ui6-a8F83A2bRINegzgu8n62DTIPwZxLfmtdVK3_dSKjN-F8Oy8BsxctcsFnLQHaeiziRsoJSF3LCTGmfs2e6UCGSKqETw6mgN7sn0D_vLZ4sSevKnFCIg53HgzrzDb0DPip-uWqrULc2ADZ38jDQtkjjH0t8ti4ldgR-A6MMfVqAdnDf89Izjg4Yb-xyfg--HY_8fQ9SwOA',
    ],
    listingId: 'scythe',
    listingTitle: 'Scythe',
    lastMessageText: "I'll be there in 5 minutes. Blue jacket!",
    lastMessageAt: Date.now() - 3 * 86_400_000,
    unreadCount: 0,
  },
  {
    id: 'conv-julian-7wonders',
    participantIds: [CURRENT_USER_PLACEHOLDER, 'user-julian'],
    participantNames: ['You', 'Julian Rossi'],
    participantAvatars: [
      '',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBs6wil02odGTiFAwKjCnZzITM-Amt62cXcfAHshUlCRb2h536IJntqxX8Qt8itcUNGon2DY4FC8BXAgld8pkpo_DuB2j08tPDNPE85iRlcaH2rNvHrZyWVPJmjdOjVyXqt9T_Aa7RII4CSxA9AZ9XfTVilyRbeMWgZb2QeP5SS6e9yDyKkaprgRvaMnqTgagnNnl6mf9KHEhRLKbxcS89zzD_UA2ZHaDc5g9hrqNFvQAi5pqK6hqd_3I5Oo5CTK1nSuN45mB3D41s',
    ],
    listingId: '7-wonders',
    listingTitle: '7 Wonders',
    lastMessageText: 'Do you have the Duel expansion included as well?',
    lastMessageAt: Date.now() - 5 * 86_400_000,
    unreadCount: 0,
  },
]

export const seedMessagesByConversation: Record<string, Message[]> = {
  'conv-elena-everdell': [
    {
      id: 'msg-elena-1',
      conversationId: 'conv-elena-everdell',
      senderId: 'user-elena',
      senderName: 'Elena Vance',
      body: 'Hey! Is Everdell still available this weekend?',
      createdAt: Date.now() - 3 * 60 * 60_000,
      read: true,
    },
    {
      id: 'msg-elena-2',
      conversationId: 'conv-elena-everdell',
      senderId: CURRENT_USER_PLACEHOLDER,
      senderName: 'You',
      body: 'Yes — Saturday works for me.',
      createdAt: Date.now() - 2.5 * 60 * 60_000,
      read: true,
    },
    {
      id: 'msg-elena-3',
      conversationId: 'conv-elena-everdell',
      senderId: 'user-elena',
      senderName: 'Elena Vance',
      body: 'The game is still available. When can you meet?',
      createdAt: Date.now() - 45 * 60_000,
      read: false,
    },
  ],
  'conv-david-gloomhaven': [
    {
      id: 'msg-david-1',
      conversationId: 'conv-david-gloomhaven',
      senderId: CURRENT_USER_PLACEHOLDER,
      senderName: 'You',
      body: 'Pickup is at the campus library lobby — does 4 PM work?',
      createdAt: Date.now() - 3 * 86_400_000,
      read: true,
    },
    {
      id: 'msg-david-2',
      conversationId: 'conv-david-gloomhaven',
      senderId: 'user-david',
      senderName: 'David Miller',
      body: 'Thanks again for the rental! Everything was in the box.',
      createdAt: Date.now() - 86_400_000,
      read: true,
    },
  ],
  'conv-chloe-scythe': [
    {
      id: 'msg-chloe-1',
      conversationId: 'conv-chloe-scythe',
      senderId: 'user-chloe',
      senderName: 'Chloe Park',
      body: "I'm almost at the meetup spot.",
      createdAt: Date.now() - 3 * 86_400_000 - 10 * 60_000,
      read: true,
    },
    {
      id: 'msg-chloe-2',
      conversationId: 'conv-chloe-scythe',
      senderId: 'user-chloe',
      senderName: 'Chloe Park',
      body: "I'll be there in 5 minutes. Blue jacket!",
      createdAt: Date.now() - 3 * 86_400_000,
      read: true,
    },
  ],
  'conv-julian-7wonders': [
    {
      id: 'msg-julian-1',
      conversationId: 'conv-julian-7wonders',
      senderId: 'user-julian',
      senderName: 'Julian Rossi',
      body: 'Do you have the Duel expansion included as well?',
      createdAt: Date.now() - 5 * 86_400_000,
      read: true,
    },
  ],
}
