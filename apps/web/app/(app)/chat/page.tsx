'use client';

import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

interface LocalResponse {
  content: string;
}

// ─── Local Intent Router ───────────────────────────────────────────
// Catches greetings, thanks/bye, help, and navigation locally
// so we never waste an API call on "hi" or "where are my workouts?"

const GREETING_PATTERNS = /^(h+i+|hey+|hello+|yo+|sup|what'?s? ?up|ahla+|salam|marhaba|3aml ?eh|ازيك|هاي|سلام|اهلا|مرحبا|صباح الخير|مساء الخير|صباح النور|مساء النور|يا +(من|باشا|برو|حبيبي)|hola|oi|howdy)[\s!?.]*$/i;

const THANKS_BYE_PATTERNS = /^(thanks?|thank ?you|thx|ty|shukran|bye+|goodbye|see ?ya|later|cya|yalla|peace|salam|salaam|مع السلامة|شكرا|تسلم|يلا|باي|مشكور|الله يسلمك)[\s!?.]*$/i;

const HELP_PATTERNS = /^(help|what can you do|what do you do|ايه ده|eh ?da|commands|features|capabilities|how does this work|ممكن تساعدني|تعمل ايه|بتعمل ايه)[\s!?.]*$/i;

const NAV_PATTERNS: Array<{ pattern: RegExp; route: string; label: string }> = [
  { pattern: /change ?(my)? ?name|edit ?(my)? ?profile|update ?(my)? ?profile|اسمي|بروفايل|تغيير ?(الاسم|اسمي)/i, route: '/settings', label: 'Settings' },
  { pattern: /show ?(my)? ?workout|my ?(workout|plan)|workout ?plan|تمارين|تمريناتي|برنامجي/i, route: '/workouts', label: 'Workouts' },
  { pattern: /log ?food|track ?(my)? ?meal|meal ?plan|nutrition|food ?log|اكل|وجبات|تغذية/i, route: '/nutrition', label: 'Nutrition' },
  { pattern: /progress|my ?weight|track ?(my)? ?weight|وزني|تقدمي/i, route: '/progress', label: 'Progress' },
  { pattern: /find ?(a)? ?trainer|trainer|coach|مدرب|كوتش/i, route: '/trainers', label: 'Trainers' },
  { pattern: /exercise|find ?(an)? ?exercise|browse ?exercise|تمرين|تمارين/i, route: '/exercises', label: 'Exercises' },
  { pattern: /achievement|badge|انجاز|ميدالية/i, route: '/achievements', label: 'Achievements' },
  { pattern: /check.?in|daily ?check|تسجيل/i, route: '/check-in', label: 'Check-in' },
  { pattern: /setting|preferences|اعدادات|الاعدادات/i, route: '/settings', label: 'Settings' },
  { pattern: /message|chat ?with|رسائل|محادثات/i, route: '/messages', label: 'Messages' },
  { pattern: /health|my ?health|صحتي/i, route: '/health', label: 'Health' },
  { pattern: /test|fitness ?test|اختبار/i, route: '/tests', label: 'Fitness Tests' },
];

const GREETING_RESPONSES = [
  "Hey! 💪 What's up? Need help with workouts, nutrition, or anything fitness?",
  "Ahla! Ready to crush it today? What do you need?",
  "Yo! Your Forma Coach is here. What can I help you with?",
  "Hey there! Whether it's workouts, food, or supplements — I got you. What's on your mind?",
  "Salam! 🔥 Tell me what you're working on and I'll help.",
  "What's good! Ready to help with whatever you need — workouts, nutrition, you name it.",
  "Ahlan wa sahlan! How can your coach help today?",
];

const THANKS_BYE_RESPONSES = [
  "Anytime! Keep pushing 💪",
  "You got this! Come back whenever you need me.",
  "Ma3 el salama! Stay consistent 🔥",
  "No problem! Remember — consistency beats intensity. See you next time!",
  "Yalla, go crush it! I'm here whenever you need. ✌️",
];

const HELP_RESPONSE = `Here's what I can help you with:

**🏋️ Workouts**
Ask me for workout plans, exercise tips, or form advice.
Go to [Workouts](/workouts) to see your plans.

**🥗 Nutrition**
Ask about calories, macros, Egyptian foods, or meal plans.
Go to [Nutrition](/nutrition) to log meals.

**💊 Supplements**
What to take, when, and what actually works.

**📊 Progress**
Go to [Progress](/progress) to track your weight and measurements.

**🏆 Achievements**
Go to [Achievements](/achievements) to see your badges.

**⚙️ Settings**
Go to [Settings](/settings) to update your profile.

Just type your question naturally — English, Arabic, Franco, whatever you're comfortable with!`;

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLocalResponse(text: string): LocalResponse | null {
  const trimmed = text.trim();

  // Greetings
  if (GREETING_PATTERNS.test(trimmed)) {
    return { content: pickRandom(GREETING_RESPONSES) };
  }

  // Thanks / bye
  if (THANKS_BYE_PATTERNS.test(trimmed)) {
    return { content: pickRandom(THANKS_BYE_RESPONSES) };
  }

  // Help / capabilities
  if (HELP_PATTERNS.test(trimmed)) {
    return { content: HELP_RESPONSE };
  }

  // Navigation
  for (const nav of NAV_PATTERNS) {
    if (nav.pattern.test(trimmed)) {
      return {
        content: `Head to [${nav.label}](${nav.route}) — that's where you can handle that! Let me know if you need anything else.`,
      };
    }
  }

  // Everything else falls through to OpenAI
  return null;
}

// ─── Markdown Link Renderer ──────────────────────────────────────
// Renders [text](url) as clickable Next.js Links inside chat messages

function renderMessageContent(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, href] = linkMatch;
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
    return <span key={i}>{part}</span>;
  });
}

// ─── Constants ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Forma Coach, a friendly fitness and nutrition coach for Egyptian and Arab users.

LANGUAGE: Understand casual English, Arabic, Egyptian Arabic (Franco-Arab like "3ayz", "eh da").
Users may write informally like "hey bro i want good plan for food you get me?" - understand and help.

STYLE: Be friendly and casual like a gym buddy. Match the user's language. Keep responses concise (2-4 paragraphs).

TOPICS: Workouts, nutrition (including Egyptian foods), exercise form, supplements, motivation, recovery.`;

const STORAGE_KEY = 'forma-chat-messages';

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
  const { t } = useLanguage();
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage or initialize with welcome message
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
      // Ignore parse errors
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (mounted) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mounted]);

  // Persist messages to localStorage
  useEffect(() => {
    if (mounted && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages, mounted]);

  // Send message handler
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', message: userMsg });
    setInputValue('');

    // ── Local Intent Router ──
    // Try to respond locally first — no API call, no loading spinner
    const localResponse = getLocalResponse(text);
    if (localResponse) {
      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: localResponse.content,
        },
      });
      inputRef.current?.focus();
      return;
    }

    // ── Falls through to OpenAI API ──
    setIsLoading(true);

    try {
      const contextMessages = messages.slice(-4);
      const context = contextMessages.map(m =>
        `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
      ).join('\n');

      const response = await aiApi.chat(text, `${SYSTEM_PROMPT}\n\nRecent:\n${context}`);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response || 'I received your message but had no response.',
      };

      dispatch({ type: 'ADD_MESSAGE', message: assistantMsg });
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t.chat.errorMessage,
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
          <h1 className="font-semibold">{t.chat.title}</h1>
          <p className="text-xs text-muted-foreground">{t.chat.subtitle}</p>
        </div>
        <Badge variant="outline" className="text-xs">{t.chat.rateLimited}</Badge>
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
                <p className="text-sm whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
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
