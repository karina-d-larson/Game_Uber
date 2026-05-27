# BoardLink Messaging UI Tasks

## Your Goal
Build and polish the messaging experience for the BoardLink MVP.

You do **NOT** need to connect Firebase or implement backend logic.  
Firebase integration will be handled separately.

Focus only on the frontend messaging UI and user experience.

---

# Features To Work On

## 1. Inbox Page
Improve/build the inbox screen.

Requirements:
- conversation list layout
- user avatar
- last message preview
- timestamp display
- unread styling (UI only)
- mobile-first spacing/layout

Component ideas:
- `InboxList`
- `ConversationCard`

---

## 2. Chat Screen
Build/polish the one-on-one chat UI.

Requirements:
- chat bubbles
- sent vs received message styling
- scrollable message area
- mobile-friendly layout
- sticky message input bar
- responsive behavior

Component ideas:
- `ChatWindow`
- `MessageBubble`
- `ChatInput`

---

## 3. Empty / Loading / Error States
Create good UX states for messaging.

Examples:
- no conversations
- loading conversations
- loading messages
- failed-to-load messages

---

## 4. Mobile UX Polish
Focus heavily on mobile usability.

Improve:
- spacing
- touch targets
- keyboard/input spacing
- scrolling behavior
- responsive layouts

---

# Important Rules

## Do NOT:
- connect Firebase
- implement realtime listeners
- add push notifications
- add typing indicators
- add read receipts
- add reactions
- add voice/video calls
- add group chats

## Do:
- keep components reusable
- preserve existing architecture
- use mock data where needed
- keep everything mobile-first
- add comments where Firebase data will later connect

---

# Expected Result

A polished messaging frontend that already feels like a real mobile marketplace chat system, ready for Firebase integration later.
