'use client';

import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Zap, Dumbbell, UtensilsCrossed, BookOpen, MessageSquare, LayoutGrid, MessagesSquare, UserCircle, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiApi, usersApi, type MyTrainer } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import GuidedChat from '@/components/chat/guided-chat';
import { ErrorBoundary } from '@/components/error-boundary';

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
          <a key={i} href={href} target="_blank" rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
            {linkText}
          </a>
        );
      }
      return (
        <Link key={i} href={href}
          className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
          {linkText}
        </Link>
      );
    }
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;
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

// ─── Typing Indicator ──────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-primary text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted/60 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
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
    case 'ADD_MESSAGE': return [...state, action.message];
    case 'SET_MESSAGES': return action.messages;
    default: return state;
  }
}

// ─── Chat Loading Skeleton ───────────────────────────────────

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] min-h-[400px] max-h-[700px] border border-border/60 rounded-2xl bg-white dark:bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div className="h-10 w-10 rounded-2xl animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded-lg animate-shimmer" />
          <div className="h-3 w-40 rounded-lg animate-shimmer" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-xl animate-shimmer flex-shrink-0" />
          <div className="h-16 w-[60%] rounded-2xl animate-shimmer" />
        </div>
        <div className="flex gap-3 justify-end">
          <div className="h-10 w-[40%] rounded-2xl animate-shimmer" />
        </div>
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-xl animate-shimmer flex-shrink-0" />
          <div className="h-12 w-[55%] rounded-2xl animate-shimmer" />
        </div>
      </div>
      <div className="border-t border-border/60 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-xl animate-shimmer" />
          <div className="h-14 rounded-xl animate-shimmer" />
          <div className="h-14 rounded-xl animate-shimmer" />
          <div className="h-14 rounded-xl animate-shimmer" />
        </div>
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
        if (parsed.length > 0) { dispatch({ type: 'SET_MESSAGES', messages: parsed }); setMounted(true); return; }
      }
    } catch { /* ignore */ }
    dispatch({ type: 'SET_MESSAGES', messages: [{ id: 'welcome', role: 'assistant', content: t.chat.welcome }] });
    setMounted(true);
  }, []);

  useEffect(() => { aiApi.getChatUsage().then(stats => setUsageStats(stats)).catch(() => {}); }, []);
  useEffect(() => { if (mounted) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, mounted]);
  useEffect(() => {
    if (mounted && messages.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }
  }, [messages, mounted]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || isLoading) return;
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: text };
    dispatch({ type: 'ADD_MESSAGE', message: userMsg });
    if (!overrideText) setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const result = await aiApi.chat(text, { language: isAr ? 'ar' : 'en', conversationHistory: history });
      dispatch({ type: 'ADD_MESSAGE', message: {
        id: `assistant-${Date.now()}`, role: 'assistant',
        content: result.response || (isAr ? 'تم استلام رسالتك.' : 'I received your message.'),
        source: result.source,
      }});
    } catch (error: any) {
      const is403 = error?.message?.includes('403') || error?.status === 403;
      dispatch({ type: 'ADD_MESSAGE', message: {
        id: `error-${Date.now()}`, role: 'assistant',
        content: is403
          ? (isAr ? 'وصلت للحد اليومي! جرب تاني بكرة أو اشترك في باقة أعلى.' : 'Daily limit reached! Try again tomorrow or upgrade your plan.')
          : t.chat.errorMessage,
        isError: true,
      }});
    } finally { setIsLoading(false); inputRef.current?.focus(); }
  }, [inputValue, isLoading, messages, isAr, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!mounted) return <ChatSkeleton />;

  const usageText = usageStats && usageStats.limit > 0
    ? `${usageStats.used}/${usageStats.limit}`
    : usageStats?.limit === -1 ? '\u221E' : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] min-h-[400px] max-h-[700px] border border-border/60 rounded-2xl bg-white dark:bg-card overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm">{t.chat.title}</h1>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAr ? 'اكتب أي حاجة — أنا هنا عشانك' : "Type anything \u2014 I'm here for you"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usageText && (
            <Badge variant="outline" className="text-[10px] font-mono h-5 px-1.5">
              {usageText}
            </Badge>
          )}
          <Badge className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 h-5 px-2">
            Premium+
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-up`}>
            <div className={`h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'assistant'
                ? msg.isError ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {msg.role === 'assistant' ? (
                msg.isError ? <AlertCircle className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="max-w-[80%] space-y-1">
              <div className={`rounded-2xl px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-md'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-tl-md'
                  : 'bg-muted/60 rounded-tl-md'
              }`}>
                <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{renderMessageContent(msg.content)}</p>
              </div>
              {msg.role === 'assistant' && msg.source && <SourceBadge source={msg.source} />}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.inputPlaceholder}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl border-border/60 text-[13px]"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Chat Page ─────────────────────────────────────────
// Premium (299 LE) → Guided Chat only
// Premium+ (999 LE) → Guided Chat (default) + toggle to Free Chat
// Trial/Free → Guided Chat only

export default function ChatPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMode, setChatMode] = useState<'guided' | 'free'>('guided');
  const [myTrainer, setMyTrainer] = useState<MyTrainer | null>(null);

  useEffect(() => {
    aiApi.getChatUsage()
      .then(stats => { setTier(stats.tier || 'FREE'); setLoading(false); })
      .catch(() => { setTier('FREE'); setLoading(false); });
    usersApi.getMyTrainers()
      .then(trainers => { if (trainers.length > 0) setMyTrainer(trainers[0]); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <ChatSkeleton />
      </div>
    );
  }

  const isPremiumPlus = tier === 'PREMIUM_PLUS';

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header: badge + mode toggle for Premium+ */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary text-[11px] border-0 h-6">
            <LayoutGrid className="h-3 w-3 me-1" />
            {isAr ? 'مساعد ذكي' : 'Smart Guide'}
          </Badge>
          {isPremiumPlus && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] border-0 h-5 px-1.5">
              Premium+
            </Badge>
          )}
        </div>
        {isPremiumPlus ? (
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setChatMode('guided')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                chatMode === 'guided'
                  ? 'bg-white dark:bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              {isAr ? 'موجّه' : 'Guided'}
            </button>
            <button
              onClick={() => setChatMode('free')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                chatMode === 'free'
                  ? 'bg-white dark:bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessagesSquare className="h-3 w-3" />
              {isAr ? 'حر' : 'Free'}
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {isAr ? 'اختار من الخيارات أو اكتب' : 'Pick options or type'}
          </p>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground/60 mb-2 text-center">
        {isAr ? 'النصائح دي للإرشاد فقط — استشير طبيبك قبل أي تغيير كبير' : 'Tips are for guidance only — consult your doctor before major changes'}
      </p>

      {/* Your Trainer Card */}
      {myTrainer && (
        <div className="mb-3 rounded-2xl border border-forma-orange/30 bg-forma-orange/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-forma-orange/40">
              {myTrainer.avatarUrl ? (
                <AvatarImage src={myTrainer.avatarUrl} alt={myTrainer.name} />
              ) : null}
              <AvatarFallback className="bg-forma-orange/10 text-forma-orange font-bold text-sm">
                {myTrainer.name?.charAt(0)?.toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{myTrainer.name}</h3>
                {myTrainer.tier === 'TRUSTED_PARTNER' && (
                  <Star className="h-3.5 w-3.5 text-forma-orange fill-forma-orange shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {myTrainer.currentProgram
                  ? (isAr ? myTrainer.currentProgram.nameAr || myTrainer.currentProgram.name : myTrainer.currentProgram.name)
                  : (isAr ? 'المدرب بتاعك' : 'Your Trainer')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/trainers/${myTrainer.id}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forma-orange/10 hover:bg-forma-orange/20 text-forma-orange text-xs font-medium transition-colors"
              >
                <UserCircle className="h-3.5 w-3.5" />
                {isAr ? 'بروفايل' : 'Profile'}
              </Link>
              <Link
                href={`/trainers/${myTrainer.id}?chat=true`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forma-orange text-white text-xs font-medium hover:bg-forma-orange/90 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {isAr ? 'محادثة' : 'Chat'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <ErrorBoundary
        fallback={
          <ChatErrorFallback isAr={isAr} onRetry={() => window.location.reload()} />
        }
      >
        {isPremiumPlus && chatMode === 'free' ? <FreeChat tier={tier!} /> : <GuidedChat />}
      </ErrorBoundary>
    </div>
  );
}

function ChatErrorFallback({ isAr, onRetry }: { isAr: boolean; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">
          {isAr ? 'حصل مشكلة في الشات' : 'Chat encountered an error'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isAr ? 'جرّب تاني أو ارجع للصفحة الرئيسية' : 'Try again or go back to the dashboard'}
        </p>
      </div>
      <Button onClick={onRetry} className="btn-primary">
        {isAr ? 'حاول تاني' : 'Try Again'}
      </Button>
    </div>
  );
}
