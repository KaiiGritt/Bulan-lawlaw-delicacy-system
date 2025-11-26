'use client'

import { useState, useEffect, useRef } from 'react'
import Pusher from 'pusher-js'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pusherRef = useRef<Pusher | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchConversations()

    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    if (orderId) {
      fetchOrderAndStartConversation(orderId)
    }
  }, [session, status, router])

  useEffect(() => {
    if (!session?.user) return

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? '',
    })

    const channelName = `user-${session.user.id}`
    const channel = pusherRef.current.subscribe(channelName)

    channel.bind('new-message', (data: unknown) => {
      const d = data as { conversationId: string; message: unknown }
      const { conversationId, message } = d

      interface Message {
        id: string
        content: string
        createdAt: string
        sender: { id: string; name: string }
      }
      const typedMessage = message as Message

      setConversations(prevConvs => {
        const convIndex = prevConvs.findIndex(c => c.id === conversationId)
        if (convIndex === -1) return prevConvs
        
        const conv = prevConvs[convIndex]
        if (conv.messages.find(m => m.id === typedMessage.id)) return prevConvs
        
        const updatedConv: Conversation = {
          ...conv,
          messages: [...conv.messages, typedMessage],
          updatedAt: new Date().toISOString(),
        }
        const newConvs = [...prevConvs]
        newConvs.splice(convIndex, 1)
        return [updatedConv, ...newConvs]
      })

      setSelectedConversation(prev => {
        if (prev && prev.id === conversationId) {
          if (prev.messages.find(m => m.id === typedMessage.id)) return prev
          toast.success('New message received')
          return {
            ...prev,
            messages: [...prev.messages, typedMessage],
            updatedAt: new Date().toISOString(),
          }
        }
        return prev
      })
    })

    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(channelName)
        pusherRef.current.disconnect()
      }
    }
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else {
        toast.error('Failed to load conversations')
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      toast.error('Error loading conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderAndStartConversation = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const order = await response.json()
        if (order.orderItems && order.orderItems.length > 0) {
          const firstProduct = order.orderItems[0].product
          const convResponse = await fetch('/api/chat/conversations')
          let existingConversations: Conversation[] = []
          if (convResponse.ok) {
            existingConversations = await convResponse.json()
            setConversations(existingConversations)
          }
          const existingConversation = existingConversations.find(
            conv => conv.product.id === firstProduct.id && conv.buyer.id === session?.user.id
          )
          if (existingConversation) {
            setSelectedConversation(existingConversation)
          } else {
            await createConversation(firstProduct.id, `Hello, I have a question about order ${orderId}`)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      toast.error('Failed to load order details')
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
        toast.success('Conversation started')
      } else {
        toast.error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error('Error creating conversation')
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    setIsTyping(true)
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
        toast.success('Message sent')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Error sending message')
    } finally {
      setIsTyping(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(m => m.id !== messageId)
        } : null)
        toast.success('Message deleted')
      } else {
        toast.error('Failed to delete message')
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      toast.error('Error deleting message')
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session?.user.role === 'seller' 
      ? conv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : conv.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading conversations...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Profile"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {session?.user.role === 'seller' ? '💼 Seller Chat' : '💬 My Conversations'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-primary-green hover:bg-leaf-green text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const lastMessage = conversation.messages[conversation.messages.length - 1]
                    const isSelected = selectedConversation?.id === conversation.id
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isSelected ? 'bg-primary-green/10 dark:bg-primary-green/20 border-l-4 border-l-primary-green' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <img
                              src={conversation.product.image}
                              alt={conversation.product.name}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {conversation.product.name}
                              </p>
                              <span className="text-xs text-gray-400 ml-2">
                                {new Date(conversation.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {session?.user.role === 'seller' ? conversation.buyer.name : conversation.seller.name}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedConversation.product.image}
                          alt={selectedConversation.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedConversation.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session?.user.role === 'seller' ? selectedConversation.buyer.name : selectedConversation.seller.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="More options"
                        >
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message, index) => {
                        const isOwn = message.sender && message.sender.id === session?.user.id
                        const showAvatar = index === 0 || selectedConversation.messages[index - 1].sender.id !== message.sender.id
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwn && showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-primary-green text-white flex items-center justify-center text-xs font-semibold">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {!isOwn && !showAvatar && <div className="w-8"></div>}
                            
                            <div className={`group relative max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl shadow-sm ${
                                  isOwn
                                    ? 'bg-primary-green text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                              </div>
                              <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {isOwn && (
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                                    title="Delete message"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-end space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Attach file"
                      >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        style={{ maxHeight: '120px' }}
                      />
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isTyping}
                        className="px-4 py-2 bg-primary-green hover:bg-leaf-green text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isTyping ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                        <span>Send</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center space-y-4">
                    <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Select a conversation</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}