'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Conversation {
  id: string
  seller: { id: string; name: string; email: string }
  buyer: { id: string; name: string; email: string }
  product: { id: string; name: string; image: string }
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: { id: string; name: string }
  }>
  updatedAt: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchConversations()

    // Check for orderId in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    if (orderId) {
      fetchOrderAndStartConversation(orderId)
    }
  }, [session, status, router])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderAndStartConversation = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const order = await response.json()
        // Find the first product in the order to get the seller
        if (order.orderItems && order.orderItems.length > 0) {
          const firstProduct = order.orderItems[0].product
          setSellerId(firstProduct.user.id)
          // First fetch existing conversations to check
          const convResponse = await fetch('/api/chat/conversations')
          let existingConversations: Conversation[] = []
          if (convResponse.ok) {
            existingConversations = await convResponse.json()
            setConversations(existingConversations)
          }
          // Then check if conversation already exists
          const existingConversation = existingConversations.find(
            conv => conv.product.id === firstProduct.id && conv.buyer.id === session?.user.id
          )
          if (existingConversation) {
            setSelectedConversation(existingConversation)
          } else {
            // Create new conversation
            await createConversation(firstProduct.id, `Hello, I have a question about order ${orderId}`)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (productId: string, message: string) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, message })
      })
      if (response.ok) {
        const newConversation = await response.json()
        setConversations(prev => [newConversation, ...prev])
        setSelectedConversation(newConversation)
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const message = await response.json()
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message]
        } : null)
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {session?.user.role === 'seller' ? 'Seller Chat' : 'My Conversations'}
        </h1>

        <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-primary-green/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={conversation.product.image}
                        alt={conversation.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session?.user.role === 'seller' ? conversation.buyer.name : conversation.seller.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.product.image}
                      alt={selectedConversation.product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Chat with {session?.user.role === 'seller' ? selectedConversation.buyer.name : selectedConversation.seller.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === session?.user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === session?.user.id
                            ? 'bg-primary-green text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.id === session?.user.id ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-leaf-green disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
