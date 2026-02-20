'use client';

import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Zap, Dumbbell, UtensilsCrossed, BookOpen, MessageSquare, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import GuidedChat from '@/components/chat/guided-chat';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  source?: string;
}

// ─── Markdown Link Renderer ──────────────────────────────────

function renderMessageContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, href] = linkMatch;
      if (href.startsWith('http')) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
          >
            {linkText}
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
        >
          {linkText}
        </Link>
      );
    }

    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={i}>{boldMatch[1]}</strong>;
    }

    return <span key={i}>{part}</span>;
  });
}

// ─── Source Badge ─────────────────────────────────────────────

function SourceBadge({ source }: { source?: string }) {
  if (!source || source === 'local' || source === 'ai') return null;

  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    food_search: { icon: <UtensilsCrossed className="h-3 w-3" />, label: 'Food DB', color: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
    exercise_search: { icon: <Dumbbell className="h-3 w-3" />, label: 'Exercise DB', color: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
    faq: { icon: <BookOpen className="h-3 w-3" />, label: 'FAQ', color: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
    program_match: { icon: <Zap className="h-3 w-3" />, label: 'Programs', color: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' },
    premium_gate: { icon: <Sparkles className="h-3 w-3" />, label: 'Premium', color: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
  };

  const cfg = config[source];
  if (!cfg) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Typing Indicator (3-dot bounce) ──────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-amber-500 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────

const STORAGE_KEY = 'forma-chat-messages';

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

// ─── Chat Loading Skeleton ───────────────────────────────────

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border border-border/60 rounded-2xl bg-white dark:bg-card overflow-hidden shadow-card">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <div className="h-10 w-10 rounded-full animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded animate-shimmer" />
          <div className="h-3 w-40 rounded animate-shimmer" />
        </div>
      </div>
      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full animate-shimmer flex-shrink-0" />
          <div className="h-16 w-[60%] rounded-2xl animate-shimmer" />
        </div>
        <div className="flex gap-3 justify-end">
          <div className="h-10 w-[40%] rounded-2xl animate-shimmer" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full animate-shimmer flex-shrink-0" />
          <div className="h-12 w-[55%] rounded-2xl animate-shimmer" />
        </div>
      </div>
      {/* Input skeleton */}
      <div className="border-t p-4">
        <div className="h-10 w-full rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

// ─── Free Chat (Premium+ only) ──────────────────────────────

function FreeChat({ tier }: { tier: string }) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [usageStats, setUsageStats] = useState<{ used: number; limit: number; tier: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (parsed.length > 0) {
          dispatch({ type: 'SET_MESSAGES', messages: parsed });
          setMounted(true);
          return;
        }
      }
    } catch {
      // Ignore
    }

    dispatch({
      type: 'SET_MESSAGES',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: t.chat.welcome,
      }]
    });
    setMounted(true);
  }, []);

  useEffect(() => {
    aiApi.getChatUsage()
      .then(stats => setUsageStats(stats))
      .catch(() => {});
  }, [messages.length]);

  useEffect(() => {
    if (mounted) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mounted]);

  useEffect(() => {
    if (mounted && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch { /* ignore */ }
    }
  }, [messages, mounted]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    dispatch({ type: 'ADD_MESSAGE', message: userMsg });
    if (!overrideText) setInputValue('');

    setIsLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const result = await aiApi.chat(text, {
        language: isAr ? 'ar' : 'en',
        conversationHistory: history,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.response || (isAr ? '\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0631\u0633\u0627\u0644\u062A\u0643.' : 'I received your message.'),
        source: result.source,
      };

      dispatch({ type: 'ADD_MESSAGE', message: assistantMsg });
    } catch (error: any) {
      const is403 = error?.message?.includes('403') || error?.status === 403;
      const errorContent = is403
        ? (isAr ? '\uD83D\uDD12 \u0648\u0635\u0644\u062A \u0644\u0644\u062D\u062F \u0627\u0644\u064A\u0648\u0645\u064A! \u062C\u0631\u0628 \u062A\u0627\u0646\u064A \u0628\u0643\u0631\u0629 \u0623\u0648 \u0627\u0634\u062A\u0631\u0643 \u0641\u064A \u0628\u0627\u0642\u0629 \u0623\u0639\u0644\u0649.' : '\uD83D\uDD12 Daily limit reached! Try again tomorrow or upgrade your plan.')
        : t.chat.errorMessage;

      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorContent,
          isError: true,
        },
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, messages, isAr, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mounted) {
    return <ChatSkeleton />;
  }

  const usageText = usageStats && usageStats.limit > 0
    ? `${usageStats.used}/${usageStats.limit}`
    : usageStats?.limit === -1
    ? '\u221E'
    : null;

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border border-border/60 rounded-2xl bg-white dark:bg-card overflow-hidden shadow-card">
      {/* Header — Clean premium */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">{t.chat.title}</h1>
          <p className="text-xs text-muted-foreground">
            {isAr ? '\u0627\u0643\u062A\u0628 \u0623\u064A \u062D\u0627\u062C\u0629 \u2014 \u0623\u0646\u0627 \u0647\u0646\u0627 \u0639\u0634\u0627\u0646\u0643' : "Type anything \u2014 I'm here for you"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usageText && (
            <Badge variant="outline" className="text-xs font-mono">
              {usageText} {isAr ? '\u064A\u0648\u0645\u064A' : 'today'}
            </Badge>
          )}
          <Badge className="text-xs bg-amber-500 text-white hover:bg-amber-600">
            Premium+
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={
                msg.role === 'assistant'
                  ? msg.isError
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30'
                    : 'bg-amber-500 text-white'
                  : 'bg-primary/10 text-primary'
              }>
                {msg.role === 'assistant' ? (
                  msg.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="max-w-[80%] space-y-1">
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-tl-sm'
                  : 'bg-muted rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{renderMessageContent(msg.content)}</p>
              </div>
              {msg.role === 'assistant' && msg.source && (
                <SourceBadge source={msg.source} />
              )}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-3 bg-white dark:bg-card">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.inputPlaceholder}
            disabled={isLoading}
            className="flex-1 rounded-xl border-border/60"
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
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

// ─── Main Chat Page ─────────────────────────────────────────
// Premium (299 LE) → Guided Chat (state machine with buttons)
// Premium+ (999 LE) → Free Chat (type anything, GPT)
// Trial/Free → Guided Chat (same as Premium)

export default function ChatPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi.getChatUsage()
      .then(stats => {
        setTier(stats.tier || 'FREE');
        setLoading(false);
      })
      .catch(() => {
        setTier('PREMIUM');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ChatSkeleton />
      </div>
    );
  }

  const isPremiumPlus = tier === 'PREMIUM_PLUS';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Tier indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPremiumPlus ? (
            <Badge className="bg-amber-500 text-white text-xs hover:bg-amber-600">
              <MessageSquare className="h-3 w-3 me-1" />
              {isAr ? '\u0645\u062D\u0627\u062F\u062B\u0629 \u062D\u0631\u0629' : 'Free Chat'}
            </Badge>
          ) : (
            <Badge className="bg-primary text-white text-xs">
              <LayoutGrid className="h-3 w-3 me-1" />
              {isAr ? '\u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A' : 'Smart Guide'}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isPremiumPlus
            ? (isAr ? '\u0627\u0643\u062A\u0628 \u0623\u064A \u0633\u0624\u0627\u0644 \u0648\u0623\u0646\u0627 \u0647\u062C\u0627\u0648\u0628\u0643' : 'Ask me anything')
            : (isAr ? '\u0627\u062E\u062A\u0627\u0631 \u0645\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A' : 'Pick from the options')
          }
        </p>
      </div>

      {/* Chat Component */}
      {isPremiumPlus ? (
        <FreeChat tier={tier!} />
      ) : (
        <GuidedChat />
      )}
    </div>
  );
}
