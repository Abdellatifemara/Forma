'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { RoleGuard } from '@/components/auth/role-guard';

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['TRAINER', 'ADMIN']} fallbackUrl="/dashboard">
      <div className="min-h-screen bg-background">
        <Sidebar type="trainer" />
        <div className="lg:pl-64">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
