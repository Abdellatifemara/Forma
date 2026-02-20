'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Send, MoreVertical, Loader2, MessageCircle, Clock, CheckCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VoiceRecorder, VoicePlayer, ImagePicker } from '@/components/chat';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useSendMediaMessage,
  useMarkAsRead,
} from '@/hooks/use-chat';
import type { Conversation, ChatMessage, MessageType } from '@/lib/api';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { FeatureGate } from '@/components/feature-gate';

function formatTime(dateString: string, isAr = false) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return isAr ? 'دلوقتي' : 'Just now';
  if (diffMins < 60) return isAr ? `من ${diffMins} د` : `${diffMins}m ago`;
  if (diffHours < 24) return isAr ? `من ${diffHours} س` : `${diffHours}h ago`;
  if (diffDays === 1) return isAr ? 'امبارح' : 'Yesterday';
  if (diffDays < 7) return isAr ? `من ${diffDays} يوم` : `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
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

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && filteredConversations.length > 0) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

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

  const renderMessage = (message: ChatMessage & { isPending?: boolean }) => {
    const isMine = message.isMine;
    const isPending = message.isPending || message.id.startsWith('temp-');

    return (
      <div
        key={message.id}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {message.type === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {message.type === 'IMAGE' && message.mediaUrl && (
            <div className="space-y-2">
              <img
                src={message.mediaUrl}
                alt={isAr ? 'صورة مشتركة' : 'Shared image'}
                className="max-w-full rounded-lg cursor-pointer"
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

          <div className={`flex items-center justify-end gap-1 mt-1 ${
            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            <span className="text-[10px]">{formatMessageTime(message.createdAt)}</span>
            {isMine && (
              isPending ? (
                <Clock className="h-3 w-3" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // Empty state when no conversations
  if (!conversationsLoading && (!conversations || conversations.length === 0)) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t.messages.noConversations}</h2>
          <p className="mb-6 text-muted-foreground">
            {t.messages.noConversationsDesc}
          </p>
          <Link href="/trainers">
            <Button variant="forma">{t.trainers.findTrainer}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <FeatureGate featureId="trainer_messaging" blurContent>
    <div className="flex h-[calc(100vh-12rem)] gap-4 lg:gap-6">
      {/* Conversations List - Hidden on mobile when conversation is selected */}
      <Card className={`w-full flex-shrink-0 lg:w-80 ${selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex h-full w-full flex-col">
          <div className="border-b p-4">
            <h2 className="mb-4 text-lg font-semibold">{t.messages.title}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-conversations"
                name="search-conversations"
                placeholder={t.messages.searchConversations}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`cursor-pointer border-b p-4 transition-colors hover:bg-muted/50 ${
                    selectedConversationId === conv.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.participant?.avatarUrl || undefined} />
                        <AvatarFallback>
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
                        <p className="font-medium">{conv.participant?.name || (isAr ? 'مجهول' : 'Unknown')}</p>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessage.createdAt, isAr)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conv.lastMessage?.isMine && (isAr ? 'انت: ' : 'You: ')}
                        {conv.lastMessage?.content || (isAr ? 'مفيش رسايل لسه' : 'No messages yet')}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="forma" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
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
      <Card className={`flex flex-1 flex-col ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConversation.participant?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {selectedConversation.participant?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.participant?.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600">{isAr ? 'مشفّر بالكامل' : 'End-to-end encrypted'}</span>
                    <span className="mx-1">·</span>
                    <span>{selectedConversation.participant?.isOnline ? t.messages.online : t.messages.offline}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{isAr ? 'بروفايل المدرب' : 'View Trainer Profile'}</DropdownMenuItem>
                    <DropdownMenuItem>{isAr ? 'برنامجي' : 'View My Program'}</DropdownMenuItem>
                    <DropdownMenuItem>{isAr ? 'حجز جلسة' : 'Schedule Session'}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      {isAr ? 'إبلاغ عن مشكلة' : 'Report Issue'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground px-4">
                  <div>
                    <p className="mb-2">{isAr ? 'مفيش رسايل لسه.' : 'No messages yet.'}</p>
                    <p className="text-sm">{isAr ? 'ابعت رسالة عشان تبدأ الكلام مع المدرب بتاعك!' : 'Send a message to start the conversation with your trainer!'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {hasNextPage && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
                        {isAr ? 'تحميل رسايل أقدم' : 'Load older messages'}
                      </Button>
                    </div>
                  )}
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
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
                  id="message-input"
                  name="message-input"
                  placeholder={t.messages.typeMessage}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={sendMessage.isPending || mediaLoading}
                  autoComplete="off"
                />
                <Button
                  variant="forma"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendMessage.isPending}
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
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t.messages.noConversationsDesc}
          </div>
        )}
      </Card>
    </div>
    </FeatureGate>
  );
}
