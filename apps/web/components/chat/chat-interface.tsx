'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bot,
  ImageIcon,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  User,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'trainer';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'workout' | 'meal';
  url?: string;
  name: string;
  data?: any;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  type: 'ai' | 'trainer' | 'user';
  status?: 'online' | 'offline' | 'away';
}

interface ChatInterfaceProps {
  participant: ChatParticipant;
  messages: Message[];
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onTyping?: () => void;
  isLoading?: boolean;
  suggestedPrompts?: string[];
}

export function ChatInterface({
  participant,
  messages,
  onSendMessage,
  onTyping,
  isLoading = false,
  suggestedPrompts = [],
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    setShowSuggestions(false);
  }, [inputValue, isLoading, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    onSendMessage(prompt);
    setShowSuggestions(false);
  }, [onSendMessage]);

  const formatTime = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  }, []);

  const statusColor = useMemo(() => {
    switch (participant.status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  }, [participant.status]);

  return (
    <Card className="flex h-[600px] flex-col">
      {/* Header */}
      <CardHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={participant.avatar} />
                <AvatarFallback>
                  {participant.type === 'ai' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    participant.name.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
              {participant.status && (
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColor}`}
                />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{participant.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {participant.type === 'ai'
                  ? 'Your fitness assistant'
                  : participant.status === 'online'
                  ? 'Online'
                  : 'Last seen recently'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && showSuggestions && suggestedPrompts.length > 0 && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forma-orange/10">
                  <Bot className="h-8 w-8 text-forma-orange" />
                </div>
                <h3 className="font-semibold">How can I help you today?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask me anything about fitness, nutrition, or your workouts
                </p>
              </div>
              <div className="grid gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                {message.sender === 'user' ? (
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>
                      {participant.type === 'ai' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        participant.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              <div
                className={`max-w-[70%] space-y-1 ${
                  message.sender === 'user' ? 'items-end' : ''
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-forma-orange text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="rounded-lg border bg-background p-2"
                      >
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-32 w-32 rounded object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 text-xs text-muted-foreground ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender === 'user' && message.status && (
                    <span className="capitalize">{message.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onTyping?.();
            }}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="forma"
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
