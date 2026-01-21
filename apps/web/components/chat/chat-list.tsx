'use client';

import { useState } from 'react';
import { Bot, MessageSquare, Search, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    type: 'ai' | 'trainer' | 'user';
    status?: 'online' | 'offline' | 'away';
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    sender: 'user' | 'other';
  };
  unreadCount: number;
}

interface ChatListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  showAIChat?: boolean;
}

export function ChatList({
  conversations,
  selectedId,
  onSelect,
  showAIChat = true,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
    } else {
      return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const aiChat: Conversation = {
    id: 'ai-coach',
    participant: {
      id: 'ai',
      name: 'AI Fitness Coach',
      type: 'ai',
      status: 'online',
    },
    lastMessage: {
      content: 'Ask me anything about fitness!',
      timestamp: new Date(),
      isRead: true,
      sender: 'other',
    },
    unreadCount: 0,
  };

  return (
    <Card className="h-[600px]">
      <CardHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
            <Badge variant="forma">
              {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search */}
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="max-h-[480px] overflow-y-auto">
          {/* AI Chat */}
          {showAIChat && (
            <div
              className={cn(
                'flex cursor-pointer items-center gap-3 border-b p-4 transition-colors hover:bg-muted/50',
                selectedId === 'ai-coach' && 'bg-muted'
              )}
              onClick={() => onSelect(aiChat)}
            >
              <div className="relative">
                <Avatar>
                  <AvatarFallback className="bg-forma-teal/10 text-forma-teal">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{aiChat.participant.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(aiChat.lastMessage.timestamp)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {aiChat.lastMessage.content}
                </p>
              </div>
            </div>
          )}

          {/* Other Conversations */}
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 border-b p-4 transition-colors hover:bg-muted/50',
                selectedId === conversation.id && 'bg-muted'
              )}
              onClick={() => onSelect(conversation)}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.participant.avatar} />
                  <AvatarFallback>
                    {conversation.participant.type === 'trainer' ? (
                      conversation.participant.name.charAt(0)
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {conversation.participant.status && (
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                      getStatusColor(conversation.participant.status)
                    )}
                  />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'font-medium',
                      conversation.unreadCount > 0 && 'text-foreground'
                    )}
                  >
                    {conversation.participant.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'truncate text-sm',
                      conversation.unreadCount > 0
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {conversation.lastMessage.sender === 'user' && 'You: '}
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="forma" className="ml-2 h-5 w-5 rounded-full p-0">
                      <span className="text-xs">{conversation.unreadCount}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && !showAIChat && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No conversations found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
