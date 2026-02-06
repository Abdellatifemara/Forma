import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from './login-form';

function LoginFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          FORMA
        </h1>
        <p className="text-muted-foreground mt-2">Welcome back</p>
      </div>
      <div className="glass rounded-2xl p-6 border border-border/50 flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
