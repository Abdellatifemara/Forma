import { API_URL } from '@/lib/constants';

// ─── Error Reporter ────────────────────────────────────────
// Catches all errors globally, deduplicates, batches, and sends
// to the backend which emails the owner.

interface ErrorEntry {
  message: string;
  url: string;
  endpoint?: string;
  status?: number;
  stack?: string;
  count: number;
  firstSeen: string;
}

const errorBuffer: Map<string, ErrorEntry> = new Map();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 30_000; // 30 seconds — batch errors before sending
const MAX_BUFFER = 20;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_DELAY);
}

async function flush() {
  if (errorBuffer.size === 0) return;

  const errors = Array.from(errorBuffer.values());
  errorBuffer.clear();

  try {
    await fetch(`${API_URL}/errors/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors }),
    });
  } catch {
    // If we can't report errors, log to console — don't cause more errors
    console.error('[ErrorReporter] Failed to send error report', errors);
  }
}

// ─── Report an error ───────────────────────────────────────
export function reportError(opts: {
  message: string;
  url?: string;
  endpoint?: string;
  status?: number;
  stack?: string;
}) {
  const key = `${opts.status || 'JS'}:${opts.message}:${opts.endpoint || opts.url || ''}`;

  const existing = errorBuffer.get(key);
  if (existing) {
    existing.count++;
    return;
  }

  errorBuffer.set(key, {
    message: opts.message.slice(0, 500),
    url: opts.url || (typeof window !== 'undefined' ? window.location.pathname : ''),
    endpoint: opts.endpoint,
    status: opts.status,
    stack: opts.stack?.slice(0, 500),
    count: 1,
    firstSeen: new Date().toISOString(),
  });

  if (errorBuffer.size >= MAX_BUFFER) {
    flush();
  } else {
    scheduleFlush();
  }
}

// ─── Setup global listeners ───────────────────────────────
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Unhandled JS errors
  window.addEventListener('error', (event) => {
    reportError({
      message: event.message || 'Unknown error',
      url: event.filename || window.location.pathname,
      stack: event.error?.stack,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportError({
      message: reason?.message || String(reason) || 'Unhandled promise rejection',
      stack: reason?.stack,
    });
  });
}

// ─── Flush on page unload ──────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (errorBuffer.size > 0) {
      const errors = Array.from(errorBuffer.values());
      errorBuffer.clear();
      // Use sendBeacon for reliable delivery on page close
      navigator.sendBeacon(
        `${API_URL}/errors/report`,
        JSON.stringify({ errors })
      );
    }
  });
}
