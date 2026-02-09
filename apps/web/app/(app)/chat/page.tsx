'use client';

import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const SYSTEM_PROMPT = `You are Forma Coach, a friendly fitness and nutrition coach for Egyptian and Arab users.

LANGUAGE: Understand casual English, Arabic, Egyptian Arabic (Franco-Arab like "3ayz", "eh da").
Users may write informally like "hey bro i want good plan for food you get me?" - understand and help.

STYLE: Be friendly and casual like a gym buddy. Match the user's language. Keep responses concise (2-4 paragraphs).

TOPICS: Workouts, nutrition (including Egyptian foods), exercise form, supplements, motivation, recovery.`;

const WELCOME_MESSAGE = "Hey! I'm your Forma Coach. I can help you with workouts, nutrition, supplements, or any fitness questions. What's on your mind?";

// Message reducer for more predictable state updates
type MessageAction =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_MESSAGES'; messages: ChatMessage[] };

function messageReducer(state: ChatMessage[], action: MessageAction): ChatMessage[] {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.message];
    case 'SET_MESSAGES':
      return action.messages;
    default:
      return state;
  }
}

export default function ChatPage() {
  // Use reducer for more predictable state management
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountCountRef = useRef(0);

  // Track mounts for debugging
  useEffect(() => {
    mountCountRef.current += 1;
    setDebugInfo(`Mount #${mountCountRef.current}`);

    // Initialize with welcome message
    dispatch({
      type: 'SET_MESSAGES',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE,
      }]
    });
    setMounted(true);

    return () => {
      console.log('[ChatPage] Unmounting, mount count was:', mountCountRef.current);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (mounted) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mounted]);

  // Debug: log message changes
  useEffect(() => {
    console.log('[ChatPage] Messages updated:', messages.length, messages.map(m => m.id));
  }, [messages]);

  // Send message handler
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    console.log('[ChatPage] Sending message:', text);

    // Create user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', message: userMsg });
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context from last 4 messages
      const contextMessages = messages.slice(-4);
      const context = contextMessages.map(m =>
        `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
      ).join('\n');

      console.log('[ChatPage] Calling API...');
      const response = await aiApi.chat(text, `${SYSTEM_PROMPT}\n\nRecent:\n${context}`);
      console.log('[ChatPage] API response:', response);

      // Create assistant message
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response || 'I received your message but had no response.',
      };

      dispatch({ type: 'ADD_MESSAGE', message: assistantMsg });
    } catch (error) {
      console.error('[ChatPage] Chat error:', error);

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't connect. Please try again!",
        isError: true,
      };

      dispatch({ type: 'ADD_MESSAGE', message: errorMsg });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, messages]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-forma-teal to-cyan-400 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">Forma Coach</h1>
          <p className="text-xs text-muted-foreground">Your fitness assistant</p>
        </div>
        <Badge variant="outline" className="text-xs">{debugInfo} | {messages.length} msgs</Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={
                  msg.role === 'assistant'
                    ? msg.isError
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gradient-to-br from-forma-teal to-cyan-400 text-white'
                    : 'bg-primary/10 text-primary'
                }>
                  {msg.role === 'assistant' ? (
                    msg.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-forma-teal to-cyan-400 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about fitness..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
