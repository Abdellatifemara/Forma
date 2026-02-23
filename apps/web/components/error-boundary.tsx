'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { reportError } from '@/lib/error-reporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    reportError({
      message: error.message,
      stack: error.stack || errorInfo.componentStack || undefined,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({ error, onRetry, showDetails = false }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We apologize for the inconvenience. An unexpected error has occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && error && (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-mono text-sm text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="me-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" className="flex-1" asChild>
              <a href="/">
                <Home className="me-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please{' '}
            <a href="mailto:support@formaeg.com" className="underline">
              contact support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotFoundError() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground">
            404
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/">
              <Home className="me-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function UnauthorizedError() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to view this page. Please log in or contact
            support if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Go Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle>Connection Error</CardTitle>
          <CardDescription>
            Unable to connect to our servers. Please check your internet
            connection and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="me-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MaintenanceError() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forma-orange/10">
            <Bug className="h-8 w-8 text-forma-orange" />
          </div>
          <CardTitle>Under Maintenance</CardTitle>
          <CardDescription>
            We're currently performing scheduled maintenance. Please check back
            shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Expected to be back online within 30 minutes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
