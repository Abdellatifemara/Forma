'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { RoleGuard } from '@/components/auth/role-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} fallbackUrl="/dashboard">
      <div className="min-h-screen bg-background">
        <Sidebar type="admin" />
        <div className="lg:ps-64">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
