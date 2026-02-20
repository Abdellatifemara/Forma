'use client';

import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Zap, Search, Dumbbell, UtensilsCrossed, BookOpen, MessageSquare, LayoutGrid } from 'lucide-react';
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
            className="text-forma-teal underline underline-offset-2 hover:text-forma-teal/80 font-medium"
          >
            {linkText}
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          className="text-forma-teal underline underline-offset-2 hover:text-forma-teal/80 font-medium"
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
    food_search: { icon: <UtensilsCrossed className="h-3 w-3" />, label: 'Food DB', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    exercise_search: { icon: <Dumbbell className="h-3 w-3" />, label: 'Exercise DB', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    faq: { icon: <BookOpen className="h-3 w-3" />, label: 'FAQ', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    program_match: { icon: <Zap className="h-3 w-3" />, label: 'Programs', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    premium_gate: { icon: <Sparkles className="h-3 w-3" />, label: 'Premium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
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
        content: result.response || (isAr ? 'تم استلام رسالتك.' : 'I received your message.'),
        source: result.source,
      };

      dispatch({ type: 'ADD_MESSAGE', message: assistantMsg });
    } catch (error: any) {
      const is403 = error?.message?.includes('403') || error?.status === 403;
      const errorContent = is403
        ? (isAr ? '🔒 وصلت للحد اليومي! جرب تاني بكرة أو اشترك في باقة أعلى.' : '🔒 Daily limit reached! Try again tomorrow or upgrade your plan.')
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const usageText = usageStats && usageStats.limit > 0
    ? `${usageStats.used}/${usageStats.limit}`
    : usageStats?.limit === -1
    ? '∞'
    : null;

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">{t.chat.title}</h1>
          <p className="text-xs text-muted-foreground">
            {isAr ? 'اكتب أي حاجة — أنا هنا عشانك' : 'Type anything — I\'m here for you'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usageText && (
            <Badge variant="outline" className="text-xs font-mono">
              {usageText} {isAr ? 'يومي' : 'today'}
            </Badge>
          )}
          <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white">
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
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                  : 'bg-primary/10 text-primary'
              }>
                {msg.role === 'assistant' ? (
                  msg.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className={`max-w-[80%] space-y-1`}>
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
              </div>
              {msg.role === 'assistant' && msg.source && (
                <SourceBadge source={msg.source} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-sm text-muted-foreground">{t.chat.thinking}</span>
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
            placeholder={t.chat.inputPlaceholder}
            disabled={isLoading}
            className="flex-1"
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={() => sendMessage()}
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

// ─── Main Chat Page ─────────────────────────────────────────
// Premium (299 LE) → Guided Chat (state machine with buttons)
// Premium+ (999 LE) → Free Chat (type anything, GPT)
// Trial/Free → Guided Chat (same as Premium)

export default function ChatPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's subscription tier
  useEffect(() => {
    aiApi.getChatUsage()
      .then(stats => {
        setTier(stats.tier || 'FREE');
        setLoading(false);
      })
      .catch(() => {
        // Default to guided chat if we can't determine tier
        setTier('PREMIUM');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              {isAr ? 'محادثة حرة' : 'Free Chat'}
            </Badge>
          ) : (
            <Badge className="bg-forma-teal text-white text-xs">
              <LayoutGrid className="h-3 w-3 mr-1" />
              {isAr ? 'مساعد ذكي' : 'Smart Guide'}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isPremiumPlus
            ? (isAr ? 'اكتب أي سؤال وأنا هجاوبك' : 'Ask me anything')
            : (isAr ? 'اختار من الخيارات' : 'Pick from the options')
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
