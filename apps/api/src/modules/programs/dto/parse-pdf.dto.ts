import { IsString, IsUrl } from 'class-validator';

export class ParsePdfDto {
  @IsString()
  @IsUrl()
  pdfUrl: string;
}

// Response type for parsed PDF data
export interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface ParsedWorkoutDay {
  name: string;
  focus?: string;
  exercises: ParsedExercise[];
}

export interface ParsedProgramData {
  suggestedName: string;
  suggestedDescription: string;
  durationWeeks: number;
  frequency: number;
  workoutDays: ParsedWorkoutDay[];
  rawText?: string;
}
