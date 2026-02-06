'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  trainersApi,
  TrainerStats,
  TrainerEarningsBreakdown,
  TrainerClientResponse,
  ClientComplianceOverview,
  ClientDetails,
} from '@/lib/api';

interface UseTrainerStatsReturn {
  stats: TrainerStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTrainerStats(): UseTrainerStatsReturn {
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

interface UseTrainerEarningsReturn {
  earnings: TrainerEarningsBreakdown | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (month?: number, year?: number) => Promise<void>;
}

export function useTrainerEarnings(
  initialMonth?: number,
  initialYear?: number
): UseTrainerEarningsReturn {
  const [earnings, setEarnings] = useState<TrainerEarningsBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEarnings = useCallback(async (month?: number, year?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const params: { month?: number; year?: number } = {};
      if (month !== undefined) params.month = month;
      if (year !== undefined) params.year = year;
      const data = await trainersApi.getEarnings(params);
      setEarnings(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch earnings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings(initialMonth, initialYear);
  }, [fetchEarnings, initialMonth, initialYear]);

  return { earnings, isLoading, error, refetch: fetchEarnings };
}

interface UseTrainerClientsReturn {
  clients: TrainerClientResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTrainerClients(): UseTrainerClientsReturn {
  const [clients, setClients] = useState<TrainerClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, isLoading, error, refetch: fetchClients };
}

interface UseClientComplianceReturn {
  compliance: ClientComplianceOverview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClientCompliance(): UseClientComplianceReturn {
  const [compliance, setCompliance] = useState<ClientComplianceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompliance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getClientCompliance();
      setCompliance(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch compliance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  return { compliance, isLoading, error, refetch: fetchCompliance };
}

interface UseInviteCodeReturn {
  inviteCode: string | null;
  isGenerating: boolean;
  error: Error | null;
  generateCode: () => Promise<string | null>;
  createLink: (grantsPremium?: boolean) => Promise<{ code: string; link: string } | null>;
}

export function useInviteCode(initialCode?: string | null): UseInviteCodeReturn {
  const [inviteCode, setInviteCode] = useState<string | null>(initialCode ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const { inviteCode: newCode } = await trainersApi.generateInviteCode();
      setInviteCode(newCode);
      return newCode;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate code'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const createLink = useCallback(async (grantsPremium?: boolean) => {
    try {
      setIsGenerating(true);
      setError(null);
      const result = await trainersApi.createInviteLink(grantsPremium);
      return { code: result.code, link: result.link };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create invite link'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { inviteCode, isGenerating, error, generateCode, createLink };
}

// Combined hook for dashboard data
interface UseTrainerDashboardReturn {
  stats: TrainerStats | null;
  clients: TrainerClientResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTrainerDashboard(): UseTrainerDashboardReturn {
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [clients, setClients] = useState<TrainerClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, clientsData] = await Promise.all([
        trainersApi.getDashboardStats(),
        trainersApi.getClients(),
      ]);
      setStats(statsData);
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stats, clients, isLoading, error, refetch: fetchAll };
}

// Hook for fetching individual client details
interface UseClientDetailsReturn {
  client: ClientDetails | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClientDetails(clientId: string | null): UseClientDetailsReturn {
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getClientDetails(clientId);
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch client details'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return { client, isLoading, error, refetch: fetchClient };
}
