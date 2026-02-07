'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VoiceRecorder, VoicePlayer, ImagePicker } from '@/components/chat';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useSendMediaMessage,
  useMarkAsRead,
  useCreateConversation,
} from '@/hooks/use-chat';
import type { Conversation, ChatMessage, MessageType } from '@/lib/api';
import { cn } from '@/lib/utils';

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('client');

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const createConversation = useCreateConversation();
  const { data: messagesData, isLoading: messagesLoading, fetchNextPage, hasNextPage } = useMessages(selectedConversationId);
  const sendMessage = useSendMessage();
  const { sendImageMessage, sendVoiceMessage, isLoading: mediaLoading, isUploadingImage, isUploadingVoice } = useSendMediaMessage();
  const markAsRead = useMarkAsRead();

  // Flatten messages from infinite query
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages.flatMap(page => page.messages).reverse();
  }, [messagesData]);

  // Selected conversation
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId || !conversations) return null;
    return conversations.find(c => c.id === selectedConversationId) || null;
  }, [selectedConversationId, conversations]);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery) return conversations;
    return conversations.filter(conv =>
      conv.participant?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Handle client query parameter - create/select conversation with that client
  useEffect(() => {
    async function handleClientParam() {
      if (!clientIdParam || isCreatingConversation || conversationsLoading) return;

      // Check if we already have a conversation with this client
      const existingConv = conversations?.find(
        c => c.participant?.id === clientIdParam
      );

      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        return;
      }

      // Create new conversation with this client
      setIsCreatingConversation(true);
      try {
        const newConv = await createConversation.mutateAsync(clientIdParam);
        setSelectedConversationId(newConv.id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      } finally {
        setIsCreatingConversation(false);
      }
    }

    handleClientParam();
  }, [clientIdParam, conversations, conversationsLoading]);

  // Auto-select first conversation if none selected and no client param
  useEffect(() => {
    if (!selectedConversationId && !clientIdParam && filteredConversations.length > 0) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId, clientIdParam]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead.mutate(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    sendMessage.mutate({
      conversationId: selectedConversationId,
      type: 'TEXT' as MessageType,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleVoiceRecording = async (blob: Blob) => {
    if (!selectedConversationId) return;
    await sendVoiceMessage(selectedConversationId, blob);
  };

  const handleImageSelected = async (file: File) => {
    if (!selectedConversationId) return;
    await sendImageMessage(selectedConversationId, file);
  };

  const renderMessage = (message: ChatMessage) => {
    const isTrainer = message.isMine;

    return (
      <div
        key={message.id}
        className={cn('flex', isTrainer ? 'justify-end' : 'justify-start')}
      >
        <div
          className={cn(
            'max-w-[70%] rounded-2xl px-4 py-3',
            isTrainer
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
              : 'bg-muted/50 border border-border/50'
          )}
        >
          {message.type === 'TEXT' && (
            <p className="text-sm">{message.content}</p>
          )}

          {message.type === 'IMAGE' && message.mediaUrl && (
            <div className="space-y-2">
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            </div>
          )}

          {message.type === 'VOICE' && message.mediaUrl && (
            <VoicePlayer url={message.mediaUrl} />
          )}

          {(message.type === 'WORKOUT_SHARE' || message.type === 'PROGRESS_SHARE') && (
            <p className="text-sm">{message.content}</p>
          )}

          <p className={cn(
            'mt-1 text-xs',
            isTrainer ? 'text-white/60' : 'text-muted-foreground'
          )}>
            {formatMessageTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your clients</p>
      </div>

      <div className="flex h-[calc(100vh-14rem)] gap-6">
        {/* Conversations List */}
        <Card className="glass border-border/50 w-80 flex-shrink-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-border/50 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(conversationsLoading || isCreatingConversation) ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'cursor-pointer border-b border-border/30 p-4 transition-all',
                      selectedConversationId === conv.id
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-muted/30'
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-border/50">
                          <AvatarImage src={conv.participant?.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {conv.participant?.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {conv.participant?.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">{conv.participant?.name || 'Unknown'}</p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {conv.lastMessage?.isMine && <span className="text-primary">You: </span>}
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="glass border-border/50 flex flex-1 flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={selectedConversation.participant?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedConversation.participant?.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConversation.participant?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participant?.isOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Online
                        </span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Program</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Session</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Block Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold mb-2">No messages yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasNextPage && (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} className="text-primary">
                          Load older messages
                        </Button>
                      </div>
                    )}
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <ImagePicker
                    onImageSelected={handleImageSelected}
                    isUploading={isUploadingImage}
                    disabled={mediaLoading}
                  />
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceRecording}
                    isUploading={isUploadingVoice}
                    disabled={mediaLoading}
                  />
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={sendMessage.isPending || mediaLoading}
                    className="bg-muted/50 border-border/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="btn-primary"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="font-semibold text-lg mb-2">Select a conversation</p>
              <p className="text-muted-foreground">
                Choose a client from the list to start messaging
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MessagesPageContent />
    </Suspense>
  );
}
