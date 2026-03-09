import type { Metadata } from 'next';
import TrainerShell from './trainer-shell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <TrainerShell>{children}</TrainerShell>;
}
