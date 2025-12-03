import type { ChatMessage } from '../../context/SessionContext'
import { MessageBubble } from './MessageBubble'

type ChatMessageListProps = {
  messages: ChatMessage[]
  isStreaming?: boolean
}

export function ChatMessageList({ messages, isStreaming = false }: ChatMessageListProps) {
  // Check if we're waiting for an assistant response (last message is from user or no messages yet)
  const lastMessage = messages[messages.length - 1]
  const waitingForResponse = isStreaming && (!lastMessage || lastMessage.role === 'user')

  return (
    <div className="px-4 py-6 space-y-2">
      {messages.map((message, idx) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={isStreaming && idx === messages.length - 1 && message.role === 'assistant'}
        />
      ))}
      {waitingForResponse && (
        <div className="flex justify-start mb-4 px-4">
          <div className="max-w-[85%] rounded-lg px-4 py-3 bg-gray-700 text-gray-100">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

