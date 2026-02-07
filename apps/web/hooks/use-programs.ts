'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  programsApi,
  uploadApiExtended,
  trainersApi,
  type TrainerProgramSummary,
  type TrainerProgramFull,
  type CreateProgramData,
  type UpdateProgramData,
  type ParsedProgramData,
  type AddExerciseData,
  type UpdateExerciseData,
  type WorkoutDayUpdate,
} from '@/lib/api';

// Query keys
const PROGRAMS_KEY = ['programs'];
const PROGRAM_KEY = (id: string) => ['programs', id];

/**
 * Hook to get all programs for the current trainer
 */
export function usePrograms() {
  return useQuery({
    queryKey: PROGRAMS_KEY,
    queryFn: programsApi.getAll,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get a single program with full details
 */
export function useProgram(programId: string | null) {
  return useQuery({
    queryKey: PROGRAM_KEY(programId || ''),
    queryFn: () => programsApi.getById(programId!),
    enabled: !!programId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new program
 */
export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramData) => programsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
    },
  });
}

/**
 * Hook to create a program from parsed PDF data
 */
export function useCreateProgramFromPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pdfUrl, parsedData }: { pdfUrl: string; parsedData: ParsedProgramData }) =>
      programsApi.createFromPdf(pdfUrl, parsedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
    },
  });
}

/**
 * Hook to update a program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgramData }) =>
      programsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(id) });
    },
  });
}

/**
 * Hook to publish a draft program
 */
export function usePublishProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(id) });
    },
  });
}

/**
 * Hook to archive a program
 */
export function useArchiveProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programsApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(id) });
    },
  });
}

/**
 * Hook to duplicate a program
 */
export function useDuplicateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
    },
  });
}

/**
 * Hook to delete a program
 */
export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY });
    },
  });
}

/**
 * Hook to add a workout day to a program
 */
export function useAddWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: string;
      data: { nameEn?: string; nameAr?: string };
    }) => programsApi.addWorkoutDay(programId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to update a workout day
 */
export function useUpdateWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      dayId,
      data,
    }: {
      programId: string;
      dayId: string;
      data: WorkoutDayUpdate;
    }) => programsApi.updateWorkoutDay(programId, dayId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to delete a workout day
 */
export function useDeleteWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, dayId }: { programId: string; dayId: string }) =>
      programsApi.deleteWorkoutDay(programId, dayId),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to add an exercise to a workout day
 */
export function useAddExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      dayId,
      data,
    }: {
      programId: string;
      dayId: string;
      data: AddExerciseData;
    }) => programsApi.addExercise(programId, dayId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to update an exercise
 */
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      exerciseId,
      data,
    }: {
      programId: string;
      exerciseId: string;
      data: UpdateExerciseData;
    }) => programsApi.updateExercise(programId, exerciseId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to delete an exercise
 */
export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, exerciseId }: { programId: string; exerciseId: string }) =>
      programsApi.deleteExercise(programId, exerciseId),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: PROGRAM_KEY(programId) });
    },
  });
}

/**
 * Hook to upload a PDF file
 */
export function useUploadPdf() {
  return useMutation({
    mutationFn: (file: File) => uploadApiExtended.uploadPdf(file),
  });
}

/**
 * Hook to assign a program to a client
 */
export function useAssignProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, programId }: { clientId: string; programId: string }) =>
      trainersApi.assignProgramToClient(clientId, programId),
    onSuccess: () => {
      // Invalidate client-related queries
      queryClient.invalidateQueries({ queryKey: ['trainer', 'clients'] });
    },
  });
}

/**
 * Combined hook for managing programs on the list page
 */
export function useProgramsManager() {
  const programs = usePrograms();
  const duplicateProgram = useDuplicateProgram();
  const deleteProgram = useDeleteProgram();
  const assignProgram = useAssignProgram();

  return {
    programs: programs.data || [],
    isLoading: programs.isLoading,
    error: programs.error,
    refetch: programs.refetch,
    duplicate: duplicateProgram.mutateAsync,
    delete: deleteProgram.mutateAsync,
    assignToClient: assignProgram.mutateAsync,
    isDuplicating: duplicateProgram.isPending,
    isDeleting: deleteProgram.isPending,
    isAssigning: assignProgram.isPending,
  };
}
