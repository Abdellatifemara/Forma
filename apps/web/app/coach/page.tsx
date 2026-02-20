'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /coach to the main chat page at /chat
export default function CoachPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return null;
}
