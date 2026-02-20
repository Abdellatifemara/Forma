'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the main settings page
export default function ProfileSettingsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/settings'); }, [router]);
  return null;
}
