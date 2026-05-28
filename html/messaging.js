const form = document.querySelector(".chat-input")
const input = document.querySelector(".chat-input input")
const messages = document.querySelector(".messages")

form.addEventListener("submit", (e) => {

  e.preventDefault()

  const text = input.value.trim()

  if (!text) return

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
