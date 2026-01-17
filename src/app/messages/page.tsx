'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { CircleNotch, PaperPlaneRight, User } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  other_user: {
    id: string
    name: string
    username: string
    avatar_url: string | null
  }
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (selectedConversation) {
          setMessages(prev => [...prev, payload.new as Message])
          scrollToBottom()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error loading conversations:', error)
      return
    }

    // Load other user details for each conversation
    const conversationsWithUsers = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .eq('id', otherUserId)
          .single()

        return {
          ...conv,
          other_user: userData || { id: otherUserId, name: 'Unknown', username: 'unknown', avatar_url: null }
        }
      })
    )

    setConversations(conversationsWithUsers)
    setLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    setMessages(data || [])

    // Mark messages as read
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return

    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation) return

    const receiverId = conversation.other_user.id

    try {
      setSending(true)
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: newMessage.trim(),
        })

      if (error) throw error

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation)

      setNewMessage('')
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-zinc-400">Chat with brands and creators</p>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="col-span-12 md:col-span-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold text-white">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 ${
                      selectedConversation === conv.id ? 'bg-zinc-800/50' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12 bg-purple-600 flex items-center justify-center">
                      {conv.other_user.avatar_url ? (
                        <img src={conv.other_user.avatar_url} alt={conv.other_user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-white" weight="bold" />
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{conv.other_user.name}</p>
                      <p className="text-sm text-zinc-400">@{conv.other_user.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="col-span-12 md:col-span-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-purple-600 flex items-center justify-center">
                      {conversations.find(c => c.id === selectedConversation)?.other_user.avatar_url ? (
                        <img 
                          src={conversations.find(c => c.id === selectedConversation)?.other_user.avatar_url!} 
                          alt="" 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" weight="bold" />
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">
                        {conversations.find(c => c.id === selectedConversation)?.other_user.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        @{conversations.find(c => c.id === selectedConversation)?.other_user.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_id === currentUserId
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-800 text-zinc-100'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-zinc-800/50 border-zinc-700 text-white"
                      disabled={sending}
                    />
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-500"
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? (
                        <CircleNotch className="h-5 w-5 animate-spin" weight="bold" />
                      ) : (
                        <PaperPlaneRight className="h-5 w-5" weight="bold" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
