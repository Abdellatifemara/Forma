import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileApi } from '@/lib/api';
import type {
  UserAIProfile,
  ProfileCompletionStatus,
  EquipmentInventory,
  ExerciseCapability,
  MovementScreen,
  HealthProfile,
  InjuryData,
  NutritionProfile,
  LifestyleProfile,
  BodyComposition,
  DailyReadiness,
  DailyReadinessInput,
  WorkoutFeedbackInput,
  TrainingHistory,
  GoalsProfile,
  FastingProfile,
} from '@/lib/api';

// Complete AI Profile
export function useAIProfile() {
  return useQuery({
    queryKey: ['aiProfile'],
    queryFn: userProfileApi.getAIProfile,
    staleTime: 5 * 60 * 1000,
  });
}

// Profile Completion Status
export function useProfileCompletion() {
  return useQuery({
    queryKey: ['profileCompletion'],
    queryFn: userProfileApi.getCompletionStatus,
    staleTime: 60 * 1000,
  });
}

// Equipment Inventory
export function useEquipmentInventory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['equipment'],
    queryFn: userProfileApi.getEquipment,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<EquipmentInventory>) =>
      userProfileApi.updateEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Exercise Capability
export function useExerciseCapability() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['capability'],
    queryFn: userProfileApi.getCapability,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ExerciseCapability>) =>
      userProfileApi.updateCapability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capability'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Movement Screen
export function useMovementScreen() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['movement'],
    queryFn: userProfileApi.getMovement,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<MovementScreen>) =>
      userProfileApi.updateMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movement'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Health Profile
export function useHealthProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['health'],
    queryFn: userProfileApi.getHealth,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<HealthProfile>) =>
      userProfileApi.updateHealth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  const addInjuryMutation = useMutation({
    mutationFn: (data: InjuryData) => userProfileApi.addInjury(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  const updateInjuryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InjuryData> }) =>
      userProfileApi.updateInjury(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  const deleteInjuryMutation = useMutation({
    mutationFn: (id: string) => userProfileApi.deleteInjury(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    addInjury: addInjuryMutation.mutate,
    updateInjury: updateInjuryMutation.mutate,
    deleteInjury: deleteInjuryMutation.mutate,
    isAddingInjury: addInjuryMutation.isPending,
  };
}

// Nutrition Profile
export function useNutritionProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['nutritionProfile'],
    queryFn: userProfileApi.getNutrition,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<NutritionProfile>) =>
      userProfileApi.updateNutrition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Lifestyle Profile
export function useLifestyleProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lifestyle'],
    queryFn: userProfileApi.getLifestyle,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<LifestyleProfile>) =>
      userProfileApi.updateLifestyle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Body Composition
export function useBodyComposition() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['body'],
    queryFn: userProfileApi.getBody,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<BodyComposition>) =>
      userProfileApi.updateBody(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Daily Readiness
export function useDailyReadiness() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ['readiness', 'today'],
    queryFn: userProfileApi.getTodayReadiness,
    staleTime: 60 * 1000,
  });

  const historyQuery = useQuery({
    queryKey: ['readiness', 'history'],
    queryFn: userProfileApi.getReadinessHistory,
    staleTime: 5 * 60 * 1000,
  });

  const logMutation = useMutation({
    mutationFn: (data: DailyReadinessInput) =>
      userProfileApi.logReadiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readiness'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    today: todayQuery.data,
    history: historyQuery.data,
    isLoading: todayQuery.isLoading || historyQuery.isLoading,
    log: logMutation.mutate,
    logAsync: logMutation.mutateAsync,
    isLogging: logMutation.isPending,
    hasLoggedToday: !!todayQuery.data,
  };
}

// Workout Feedback
export function useWorkoutFeedback(workoutLogId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['feedback', workoutLogId],
    queryFn: () => userProfileApi.getWorkoutFeedback(workoutLogId!),
    enabled: !!workoutLogId,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: ({
      logId,
      data,
    }: {
      logId: string;
      data: WorkoutFeedbackInput;
    }) => userProfileApi.logWorkoutFeedback(logId, data),
    onSuccess: (_, { logId }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', logId] });
    },
  });

  return {
    ...query,
    log: mutation.mutate,
    logAsync: mutation.mutateAsync,
    isLogging: mutation.isPending,
  };
}

// Muscle Recovery
export function useMuscleRecovery() {
  return useQuery({
    queryKey: ['muscleRecovery'],
    queryFn: userProfileApi.getMuscleRecovery,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 min to update recovery %
  });
}

// Training History
export function useTrainingHistory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['trainingHistory'],
    queryFn: userProfileApi.getTrainingHistory,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<TrainingHistory>) =>
      userProfileApi.updateTrainingHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Goals Profile
export function useGoalsProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['goals'],
    queryFn: userProfileApi.getGoals,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<GoalsProfile>) =>
      userProfileApi.updateGoals(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// Fasting Profile
export function useFastingProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fasting'],
    queryFn: userProfileApi.getFasting,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<FastingProfile>) =>
      userProfileApi.updateFasting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasting'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['aiProfile'] });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
