'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await authApi.getMe();
        const userRole = response.user?.role?.toUpperCase();

        if (userRole && allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          // Redirect based on actual role
          if (userRole === 'TRAINER') {
            router.replace('/trainer/dashboard');
          } else if (userRole === 'ADMIN') {
            router.replace('/admin/dashboard');
          } else {
            router.replace(fallbackUrl);
          }
        }
      } catch (error) {
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    }
    checkRole();
  }, [allowedRoles, fallbackUrl, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
