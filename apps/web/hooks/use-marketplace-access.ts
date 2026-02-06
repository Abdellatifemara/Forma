'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersApi, type MarketplaceAccess } from '@/lib/api';

interface UseMarketplaceAccessReturn {
  canSeeMarketplace: boolean;
  reason?: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMarketplaceAccess(): UseMarketplaceAccessReturn {
  const [access, setAccess] = useState<MarketplaceAccess>({ canSeeMarketplace: true });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccess = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await usersApi.checkMarketplaceAccess();
      setAccess(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check access'));
      // Default to allowing marketplace on error
      setAccess({ canSeeMarketplace: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  return {
    canSeeMarketplace: access.canSeeMarketplace,
    reason: access.reason,
    isLoading,
    error,
    refetch: fetchAccess,
  };
}
