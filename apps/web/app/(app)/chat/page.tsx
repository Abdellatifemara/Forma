'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number; // Use number timestamp to avoid hydration issues
  error?: boolean;
}

const suggestedQuestions = [
  'What exercises target my chest?',
  'How much protein should I eat daily?',
  'Create a workout for me today',
  'What are the benefits of creatine?',
  'How can I improve my squat form?',
  'What should I eat before a workout?',
];

const SYSTEM_CONTEXT = `You are Forma Coach, a friendly and knowledgeable fitness and nutrition coach for Egyptian and Arab users.

IMPORTANT - LANGUAGE UNDERSTANDING:
- Users may write in casual/informal English, Arabic, or Egyptian Arabic (Franco-Arab like "3ayz", "eh da", "kda")
- Users may use slang, abbreviations, or broken grammar like "hey bro i want good plan for food you get me?"
- ALWAYS understand the intent behind casual messages and respond helpfully
- If a message is unclear, make your best guess at what they want, then confirm
- Never say you don't understand - always try to help

COMMUNICATION STYLE:
- Be friendly, casual, and encouraging - like a gym buddy
- Use simple language, avoid jargon
- Match the user's energy and language style
- If they write in Arabic, respond in Arabic
- If they write casually, respond casually

YOU HELP WITH:
- Workout planning and exercise recommendations
- Nutrition advice and meal planning (including Egyptian foods)
- Exercise form and technique tips
- Supplement guidance
- Motivation and goal setting
- Recovery and injury prevention

RESPONSE FORMAT:
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Be specific and actionable
- Always end with a question or next step`;

const INITIAL_MESSAGE = "Hey! I'm your Forma Coach. I can help you with workouts, nutrition, supplements, or any fitness questions. What's on your mind today?";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize messages only on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: INITIAL_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
  }, []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Build context from recent messages for continuity
      const recentMessages = messages.slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
      ).join('\n');

      const fullContext = `${SYSTEM_CONTEXT}\n\nRecent conversation:\n${recentMessages}`;

      const response = await aiApi.chat(userInput, fullContext);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: Date.now(),
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loading state while mounting to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      {/* Full-width chat container */}
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-card px-4 py-3">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-forma-teal to-cyan-400">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">Forma Coach</h1>
              <p className="text-sm text-muted-foreground truncate">Your fitness assistant</p>
            </div>
            <Badge variant="forma" className="flex-shrink-0">
              Pro
            </Badge>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ minHeight: 0 }}
        >
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.role === 'assistant'
                        ? message.error
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-gradient-to-br from-forma-teal to-cyan-400 text-white'
                        : 'bg-primary/10 text-primary'
                    }
                  >
                    {message.role === 'assistant' ? (
                      message.error ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.error
                      ? 'bg-destructive/10 border border-destructive/20 text-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm break-words">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-1 last:mb-0">
                        {line.startsWith('- ') || line.startsWith('• ') ? (
                          <span className="flex gap-2">
                            <span>•</span>
                            <span>{line.substring(2)}</span>
                          </span>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <strong>{line.slice(2, -2)}</strong>
                        ) : (
                          line || '\u00A0'
                        )}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-forma-teal to-cyan-400 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-forma-teal" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions - Only show when no conversation */}
        {messages.length === 1 && (
          <div className="flex-shrink-0 border-t bg-muted/30 px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <p className="mb-2 text-sm text-muted-foreground">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-3"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 border-t bg-background p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              placeholder="Ask me anything about fitness..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              variant="forma"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
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
    </div>
  );
}
