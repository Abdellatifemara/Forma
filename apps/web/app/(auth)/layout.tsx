import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forma-navy to-forma-navy-light">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center justify-center space-x-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-forma-teal to-forma-teal-light" />
            <span className="text-2xl font-bold text-white">Forma</span>
          </Link>

          {children}

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-white/50">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-forma-teal hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-forma-teal hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
