const form = document.querySelector(".chat-input")
const input = document.querySelector(".chat-input input")
const messages = document.querySelector(".messages")
const conversations = document.querySelectorAll(".conversation")

let currentChat = "Jordan Lee"

const chats = {
  "Jordan Lee": [
    { type: "received", text: "Hey, is this still available?" },
    { type: "sent", text: "Yep — still available." }
  ],

  "John Doe": [
    { type: "received", text: "Could you meet tomorrow?" }
  ],

  "Alex Morgan": [
    { type: "received", text: "Is the price negotiable?" }
  ]
}

function loadChat(name) {

  currentChat = name

  document.querySelector(".chat-user h2").textContent = name

  messages.innerHTML = ""

  chats[name].forEach(msg => {

    const div = document.createElement("div")

    div.classList.add("message")
    div.classList.add(msg.type)

    div.textContent = msg.text

    messages.appendChild(div)
  })

  scrollToBottom()
}

conversations.forEach(conversation => {

  conversation.addEventListener("click", () => {

    conversations.forEach(c =>
      c.classList.remove("active")
    )

    conversation.classList.add("active")

    const name =
      conversation.querySelector("h3").textContent

    loadChat(name)

  })

})

form.addEventListener("submit", (e) => {

  e.preventDefault()

  const text = input.value.trim()

  if (!text) return

  chats[currentChat].push({
    type: "sent",
    text: text
  })

  updateConversationPreview(currentChat)

  const message = document.createElement("div")

  message.classList.add("message")
  message.classList.add("sent")

  message.textContent = text

  messages.appendChild(message)

  input.value = ""

  scrollToBottom()
})

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight
}

loadChat(currentChat)

function updateConversationPreview(name) {

  const conversation = [...conversations].find(c =>
    c.querySelector("h3").textContent === name
  )

  if (!conversation) return

  const preview =
    conversation.querySelector(".conversation-bottom p")

  const lastMessage =
    chats[name][chats[name].length - 1]

  preview.textContent = lastMessage.text
}
