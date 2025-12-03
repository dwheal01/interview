import type { ChatMessage } from '../../context/SessionContext'
import { MessageBubble } from './MessageBubble'

type ChatMessageListProps = {
  messages: ChatMessage[]
  isStreaming?: boolean
}

export function ChatMessageList({ messages, isStreaming = false }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>Start a conversation to begin...</p>
        </div>
      ) : (
        messages.map((message, idx) => (
          <MessageBubble
            key={idx}
            message={message}
            isStreaming={isStreaming && idx === messages.length - 1}
          />
        ))
      )}
    </div>
  )
}

