'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UserPreferences, RamadanSettings, RamadanModeData } from '@/lib/api';

// Get user preferences
export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => settingsApi.getPreferences(),
  });
}

// Update preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => settingsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

// Get Ramadan settings
export function useRamadanSettings() {
  return useQuery({
    queryKey: ['ramadan-settings'],
    queryFn: () => settingsApi.getRamadanSettings(),
  });
}

// Enable Ramadan mode
export function useEnableRamadanMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RamadanModeData) => settingsApi.enableRamadanMode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ramadan-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

// Disable Ramadan mode
export function useDisableRamadanMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsApi.disableRamadanMode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ramadan-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

// Get injuries
export function useInjuries() {
  return useQuery({
    queryKey: ['injuries'],
    queryFn: () => settingsApi.getInjuries(),
  });
}

// Update injuries
export function useUpdateInjuries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (injuries: string[]) => settingsApi.updateInjuries(injuries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['injuries'] });
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

// Update equipment
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipment: string[]) => settingsApi.updateEquipment(equipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}
