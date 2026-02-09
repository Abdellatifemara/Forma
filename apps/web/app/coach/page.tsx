'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { aiApi } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const SYSTEM_PROMPT = `You are Forma Coach, a friendly fitness and nutrition coach for Egyptian and Arab users.
Understand casual English, Arabic, Egyptian Arabic. Be friendly like a gym buddy. Keep responses concise.`;

const WELCOME = "Hey! I'm your Forma Coach. Ask me anything about workouts, nutrition, or fitness!";

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: WELCOME }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ctx = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
      const res = await aiApi.chat(text, `${SYSTEM_PROMPT}\n\n${ctx}`);
      setMessages(m => [...m, { id: `a-${Date.now()}`, role: 'assistant', content: res.response }]);
    } catch (e) {
      setMessages(m => [...m, { id: `e-${Date.now()}`, role: 'assistant', content: "Connection error. Try again!", isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold">Forma Coach</h1>
          <p className="text-xs text-muted-foreground">Your fitness assistant</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={
                  msg.role === 'assistant'
                    ? msg.isError ? 'bg-red-100 text-red-600' : 'bg-teal-500 text-white'
                    : 'bg-gray-200'
                }>
                  {msg.role === 'assistant' ? (msg.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user' ? 'bg-teal-500 text-white' : msg.isError ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-teal-500 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={send} disabled={!input.trim() || loading} size="icon">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
