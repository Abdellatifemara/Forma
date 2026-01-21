'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'What exercises target my chest?',
  'How much protein should I eat daily?',
  'Create a workout for me today',
  'What are the benefits of creatine?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI fitness coach. I can help you with workout suggestions, nutrition advice, exercise form tips, and answer any fitness-related questions. How can I help you today?",
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
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      chest:
        "Great question! For chest development, I recommend:\n\n1. **Bench Press** - The king of chest exercises\n2. **Incline Dumbbell Press** - Targets upper chest\n3. **Cable Flyes** - Great for isolation\n4. **Push-ups** - Bodyweight classic\n5. **Dips** - Compound movement\n\nWould you like me to create a chest workout for you?",
      protein:
        "For optimal muscle building and recovery, I recommend:\n\n**Daily Protein Intake:** 1.6-2.2g per kg of body weight\n\nBased on your profile (83kg), that's approximately **133-183g of protein daily**.\n\nGood protein sources:\n- Chicken breast (31g per 100g)\n- Greek yogurt (10g per 100g)\n- Eggs (6g per egg)\n- Fish (20-25g per 100g)\n- Legumes (for plant-based options)\n\nWould you like help planning your meals to hit this target?",
      workout:
        "Based on your Push Pull Legs program, here's today's workout:\n\n**Push Day - Chest & Triceps**\n\n1. Bench Press - 4x8\n2. Incline Dumbbell Press - 3x10\n3. Cable Flyes - 3x12\n4. Overhead Tricep Extension - 3x12\n5. Tricep Pushdowns - 3x15\n6. Lateral Raises - 3x15\n\nEstimated duration: 45-50 minutes\n\nShall I start tracking this workout?",
      creatine:
        "Creatine is one of the most researched and effective supplements:\n\n**Benefits:**\n✅ Increased strength and power\n✅ Improved muscle recovery\n✅ Enhanced brain function\n✅ Safe for long-term use\n\n**Recommended dosage:** 3-5g daily\n\n**Best type:** Creatine Monohydrate (most studied, cost-effective)\n\n**When to take:** Timing doesn't matter much, just be consistent.\n\nWould you like more information about supplements?",
    };

    let response =
      "I'm here to help with your fitness questions! I can assist with workout planning, nutrition advice, exercise form, and more. What would you like to know?";

    for (const [key, value] of Object.entries(responses)) {
      if (input.toLowerCase().includes(key)) {
        response = value;
        break;
      }
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col pb-20 lg:ml-64 lg:pb-0">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forma-teal/20">
            <Sparkles className="h-5 w-5 text-forma-teal" />
          </div>
          <div>
            <h1 className="font-semibold">AI Fitness Coach</h1>
            <p className="text-sm text-muted-foreground">Powered by Forma AI</p>
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
                      ? 'bg-forma-teal/20 text-forma-teal'
                      : 'bg-muted'
                  }
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-forma-teal text-forma-navy'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <p className="mt-1 text-xs opacity-60">
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
                <AvatarFallback className="bg-forma-teal/20 text-forma-teal">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="forma"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
