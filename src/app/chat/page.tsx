'use client'

import { useState, useEffect, useRef } from 'react'
import Pusher from 'pusher-js'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

interface Conversation {
  id: string
  seller: {
    id: string
    name: string
    email: string
    sellerApplication?: {
      businessName: string
      businessLogo: string | null
    } | null
  }
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pusherRef = useRef<Pusher | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

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

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!pusherKey || !pusherCluster) {
      console.warn('⚠️ Pusher credentials not configured. Real-time updates disabled.')
      return
    }

    console.log('🚀 Initializing Pusher for real-time chat...')
    console.log('📍 Using cluster:', pusherCluster)

    try {
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      })

      const channelName = `user-${session.user.id}`
      const channel = pusherRef.current.subscribe(channelName)

      console.log(`📡 Subscribed to channel: ${channelName}`)

      // Connection status logging
      pusherRef.current.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully!')
      })

      pusherRef.current.connection.bind('connecting', () => {
        console.log('🔄 Connecting to Pusher...')
      })

      pusherRef.current.connection.bind('unavailable', () => {
        console.warn('⚠️ Pusher unavailable - falling back to manual refresh')
      })

      pusherRef.current.connection.bind('failed', () => {
        console.error('❌ Pusher connection failed')
      })

      pusherRef.current.connection.bind('error', (err: any) => {
        console.error('❌ Pusher connection error:', err)
        console.log('💡 Chat will still work, but without real-time updates')
      })

      // Channel subscription success
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to channel')
      })

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('❌ Channel subscription error:', err)
      })

      channel.bind('new-message', (data: unknown) => {
        console.log('💬 New message received via Pusher:', data)

      const d = data as { conversationId: string; message: unknown }
      const { conversationId, message } = d

      interface Message {
        id: string
        content: string
        createdAt: string
        sender: { id: string; name: string }
      }
      const typedMessage = message as Message

      // Update conversations list
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

      // Update selected conversation
      setSelectedConversation(prev => {
        if (prev && prev.id === conversationId) {
          // Check if message already exists (prevent duplicates)
          if (prev.messages.find(m => m.id === typedMessage.id)) {
            console.log('⚠️ Duplicate message prevented:', typedMessage.id)
            return prev
          }

          // Only show toast if message is from someone else
          const isFromOther = typedMessage.sender.id !== session.user.id
          if (isFromOther) {
            // Play notification sound (optional)
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {}) // Ignore errors if audio fails

            toast.success(`💬 ${typedMessage.sender.name}: ${typedMessage.content.substring(0, 30)}${typedMessage.content.length > 30 ? '...' : ''}`, {
              duration: 3000,
              position: 'top-right'
            })
          }

          console.log('✅ Adding new message to conversation:', typedMessage)
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
        console.log('🔌 Disconnecting Pusher...')
        if (pusherRef.current) {
          pusherRef.current.unsubscribe(channelName)
          pusherRef.current.disconnect()
        }
      }
    } catch (error) {
      console.error('❌ Error initializing Pusher:', error)
      console.log('💡 Chat will work without real-time updates')
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

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`

    // Optimistic update - add message immediately to UI
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      sender: {
        id: session?.user.id || '',
        name: session?.user.name || 'You',
        email: session?.user.email || ''
      },
      isOptimistic: true // Mark as temporary
    }

    // Clear input and show message immediately
    setNewMessage('')

    // Add to selected conversation immediately
    setSelectedConversation(prev => {
      if (!prev) return null
      const updated = {
        ...prev,
        messages: [...prev.messages, optimisticMessage],
        updatedAt: new Date().toISOString()
      }
      console.log('✅ Message added to UI immediately:', optimisticMessage)
      return updated
    })

    // Update conversations list
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, messages: [...c.messages, optimisticMessage], updatedAt: new Date().toISOString() }
          : c
      )
    )

    // Send to server
    setIsTyping(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageContent
        })
      })

      if (response.ok) {
        const actualMessage = await response.json()
        console.log('✅ Message confirmed by server:', actualMessage)

        // Replace temp message with real one
        setSelectedConversation(prev => {
          if (!prev) return null
          return {
            ...prev,
            messages: prev.messages.map(m => m.id === tempId ? actualMessage : m)
          }
        })

        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? { ...c, messages: c.messages.map(m => m.id === tempId ? actualMessage : m) }
              : c
          )
        )
      } else {
        console.error('❌ Failed to send message')
        // Remove optimistic message
        setSelectedConversation(prev => {
          if (!prev) return null
          return {
            ...prev,
            messages: prev.messages.filter(m => m.id !== tempId)
          }
        })

        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? { ...c, messages: c.messages.filter(m => m.id !== tempId) }
              : c
          )
        )

        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)

      // Remove optimistic message
      setSelectedConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: prev.messages.filter(m => m.id !== tempId)
        }
      })

      toast.error('Error sending message')
    } finally {
      setIsTyping(false)
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-6 px-4">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex mb-6 items-center justify-between animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
            {/* Conversations List Skeleton */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area Skeleton */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                    <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-700'} rounded-2xl p-4 space-y-2`}>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t dark:border-gray-700 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header - Hidden on mobile when conversation is open */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} mb-6 items-center justify-between`}>
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
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
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar - Left Side */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-900`}>
              {/* Header with Title */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-left">Messages</h2>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
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
                  <div>
                  {filteredConversations.map((conversation) => {
                    const lastMessage = conversation.messages[conversation.messages.length - 1]
                    const isSelected = selectedConversation?.id === conversation.id

                    // Get the business logo and name for display
                    const businessLogo = conversation.seller.sellerApplication?.businessLogo
                    const businessName = conversation.seller.sellerApplication?.businessName
                    const displayImage = session?.user.role === 'seller'
                      ? conversation.product.image  // Sellers see product image
                      : (businessLogo || conversation.product.image)  // Buyers see business logo or fallback to product
                    const displayName = session?.user.role === 'seller'
                      ? conversation.buyer.name  // Sellers see buyer name
                      : (businessName || conversation.seller.name)  // Buyers see business name or fallback to seller name

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isSelected ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-l-primary-green' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative flex-shrink-0">
                            <img
                              src={displayImage}
                              alt={displayName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate text-left">
                                {displayName}
                              </h4>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {new Date(conversation.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate text-left mb-0.5">
                              {conversation.product.name}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area - Right Side */}
            <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            session?.user.role === 'seller'
                              ? selectedConversation.product.image
                              : (selectedConversation.seller.sellerApplication?.businessLogo || selectedConversation.product.image)
                          }
                          alt={
                            session?.user.role === 'seller'
                              ? selectedConversation.product.name
                              : (selectedConversation.seller.sellerApplication?.businessName || selectedConversation.seller.name)
                          }
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {session?.user.role === 'seller'
                              ? selectedConversation.buyer.name
                              : (selectedConversation.seller.sellerApplication?.businessName || selectedConversation.seller.name)
                            }
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedConversation.product.name}
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
                  <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
                       style={{
                         backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(0,0,0,0.02) 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                       }}
                  >
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
                        if (!message.sender) return null;

                        const isOwn = message.sender.id === session?.user.id
                        const isSeller = message.sender.id === selectedConversation.seller.id
                        const isBuyer = message.sender.id === selectedConversation.buyer.id

                        // Show avatar when sender changes or first message
                        const showAvatar = index === 0 || (selectedConversation.messages[index - 1].sender && selectedConversation.messages[index - 1].sender.id !== message.sender.id)

                        // SIMPLE RULE: Seller messages ALWAYS go RIGHT, Buyer messages ALWAYS go LEFT
                        const isRightSide = isSeller

                        const senderName = message.sender.name || 'User'
                        const senderInitial = senderName.charAt(0).toUpperCase()

                        return (
                          <div
                            key={message.id}
                            className={`flex items-start gap-3 animate-fadeIn ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            {/* Avatar */}
                            {showAvatar && message.sender ? (
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                                isRightSide
                                  ? 'bg-gradient-to-br from-leaf-green to-banana-leaf text-white'
                                  : 'bg-gradient-to-br from-warm-orange to-earth-brown text-white'
                              }`}>
                                {senderInitial}
                              </div>
                            ) : (
                              <div className="w-10 flex-shrink-0"></div>
                            )}

                            {/* Message Bubble Container */}
                            <div className={`group relative max-w-[70%] md:max-w-md`}>
                              {/* Sender Name (only show when avatar is shown) */}
                              {showAvatar && (
                                <p className={`text-xs font-medium mb-1 px-1 ${
                                  isRightSide
                                    ? 'text-right text-leaf-green dark:text-banana-leaf'
                                    : 'text-left text-warm-orange dark:text-earth-brown'
                                }`}>
                                  {senderName}
                                </p>
                              )}

                              {/* Message Bubble */}
                              <div className="relative">
                                <div
                                  className={`px-4 py-3 shadow-lg transition-all hover:shadow-xl ${
                                    isRightSide
                                      ? 'bg-banana-leaf text-gray-800 dark:text-gray-900 rounded-2xl rounded-tr-md'
                                      : 'bg-accent-cream text-gray-800 dark:text-gray-900 rounded-2xl rounded-tl-md'
                                  } ${(message as any).isOptimistic ? 'opacity-75' : 'opacity-100'}`}
                                >
                                  <p className="text-sm break-words leading-relaxed">{message.content}</p>

                                  {/* Sending indicator */}
                                  {(message as any).isOptimistic && isOwn && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="flex gap-0.5">
                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                      </div>
                                      <span className="text-xs opacity-75 ml-1">Sending...</span>
                                    </div>
                                  )}
                                </div>

                                {/* Small triangle tail */}
                                <div className={`absolute top-0 ${
                                  isRightSide
                                    ? 'right-0 translate-x-1'
                                    : 'left-0 -translate-x-1'
                                }`}>
                                  <div className={`w-0 h-0 border-t-[10px] border-b-[10px] border-b-transparent ${
                                    isRightSide
                                      ? 'border-l-[10px] border-l-banana-leaf border-t-transparent'
                                      : 'border-r-[10px] border-r-accent-cream border-t-transparent'
                                  }`}></div>
                                </div>
                              </div>

                              {/* Timestamp and Actions */}
                              <div className={`flex items-center gap-2 mt-1 px-1 ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Delivery status for own messages */}
                                {isOwn && !(message as any).isOptimistic && (
                                  <span className="text-xs text-gray-400" title="Delivered">✓✓</span>
                                )}

                                {isOwn && !message.id.startsWith('temp-') && (
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete message"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          searchDisabled={false}
                          skinTonesDisabled={false}
                          width={350}
                          height={450}
                        />
                      </div>
                    )}

                    <div className="flex items-end space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                      />

                      {/* Emoji Button */}
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                          showEmojiPicker ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        title="Add emoji"
                      >
                        <span className="text-2xl">😊</span>
                      </button>

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
                        placeholder="Type your message... 😊"
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
                      Press Enter to send, Shift + Enter for new line • Click 😊 for emojis
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="text-center space-y-6 p-8">
                    <div className="relative">
                      <svg className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="absolute top-0 right-0 w-6 h-6 bg-primary-green dark:bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">💬 Lawlaw Chat</p>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Select a conversation</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                        Choose a conversation from the left sidebar to start chatting with buyers or sellers
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Real-time messaging powered by Pusher</span>
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