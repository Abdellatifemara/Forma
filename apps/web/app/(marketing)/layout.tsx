import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

// Marketing layout for homepage and public pages
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
