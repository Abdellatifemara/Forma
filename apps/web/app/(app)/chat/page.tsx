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
  timestamp: Date;
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

const SYSTEM_CONTEXT = `You are Forma Coach, a knowledgeable fitness and nutrition coach. You help users with:
- Workout planning and exercise recommendations
- Nutrition advice and meal planning
- Exercise form and technique tips
- Supplement guidance
- Motivation and goal setting
- Recovery and injury prevention

Be concise, friendly, and encouraging. Use bullet points and formatting for clarity.
If you don't know something specific about the user, ask them.
Always prioritize safety - recommend consulting professionals for medical concerns.`;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your Forma Coach. I can help you with workout suggestions, nutrition advice, exercise form tips, and answer any fitness-related questions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Build context from recent messages for continuity
      const recentMessages = messages.slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const fullContext = `${SYSTEM_CONTEXT}\n\nRecent conversation:\n${recentMessages}`;

      const response = await aiApi.chat(userInput, fullContext);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Error handled

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request right now. Please try again in a moment.",
        timestamp: new Date(),
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

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-forma-teal to-cyan-400">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">Forma Coach</h1>
            <p className="text-sm text-muted-foreground">Your fitness assistant</p>
          </div>
          <Badge variant="forma" className="ml-auto">
            Pro Feature
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={
                    message.role === 'assistant'
                      ? message.error
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-gradient-to-br from-forma-teal to-cyan-400 text-white'
                      : 'bg-muted'
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-forma-teal text-forma-navy'
                    : message.error
                    ? 'bg-destructive/10 border border-destructive/20'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">
                      {line.startsWith('- ') || line.startsWith('• ') ? (
                        <span className="flex gap-2">
                          <span className="text-forma-teal">•</span>
                          <span>{line.substring(2)}</span>
                        </span>
                      ) : line.startsWith('**') && line.endsWith('**') ? (
                        <strong>{line.slice(2, -2)}</strong>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
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

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="border-t px-4 py-3">
          <p className="mb-2 text-sm text-muted-foreground">
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
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
  );
}
