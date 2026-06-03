import { useState } from 'react'
import { sendChatMessage } from '../../services/promiseService'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Hi! Ask me anything about Indian government promises. Example: "Has BJP delivered on farmer income?" or "What is status of free electricity promise?"' }
  ])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!question.trim() || loading) return

    const userMsg = { role: 'user', text: question }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)

    try {
      const data = await sendChatMessage(question)
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-900 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-800 transition-colors z-50"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50" style={{ height: '450px' }}>
          {/* Header */}
          <div className="bg-blue-900 text-white px-4 py-3 rounded-t-2xl">
            <div className="font-bold">🤖 Ask the Tracker</div>
            <div className="text-xs text-blue-300">AI-powered promise assistant</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs text-sm px-3 py-2 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-blue-900 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 text-sm px-3 py-2 rounded-xl rounded-bl-none">
                  🤔 Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}